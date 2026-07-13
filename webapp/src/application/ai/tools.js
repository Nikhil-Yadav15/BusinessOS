import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { GetAnalyticsSnapshotOperation } from '../operations/analytics/GetAnalyticsSnapshotOperation.js';
import { ListInvoicesOperation } from '../operations/sales/invoices/ListInvoicesOperation.js';
import { ListInventoryOperation } from '../operations/inventory/ListInventoryOperation.js';
import { CreateWorkflowOperation } from '../operations/workflows/CreateWorkflowOperation.js';
import { db } from '../../db/index.js';
import { aiMemories } from '../../db/schema/ai.js';
import { workflows } from '../../db/schema/workflow.js';
import { units } from '../../db/schema/catalog.js';
import { eq, and } from 'drizzle-orm';
import { generateId } from '../../infrastructure/id/uuid.js';

export const buildAITools = (executionContext) => {
  return [
    // 1. Get Analytics Tool
    tool(
      async () => {
        try {
          const result = await new GetAnalyticsSnapshotOperation().execute(executionContext, {});
          return JSON.stringify(result);
        } catch (e) { return `Error: ${e.message}`; }
      },
      {
        name: 'get_business_analytics',
        description: 'Fetches real-time financial metrics, revenue, profit, and stock numbers. Use to answer "How are we doing?"',
        schema: z.object({})
      }
    ),

    // 2. Query Recent Sales Tool
    tool(
      async ({ status, limit }) => {
        try {
          const filters = status ? { status } : {};
          const result = await new ListInvoicesOperation().execute(executionContext, { filters, limit: limit || 10 });
          return JSON.stringify(result.map(i => ({ number: i.invoiceNumber, total: i.totalAmount, balance: i.balanceAmount, status: i.status })));
        } catch (e) { return `Error: ${e.message}`; }
      },
      {
        name: 'query_recent_sales',
        description: 'Fetches recent sales invoices. Optionally filter by status (DRAFT, UNPAID, PARTIALLY_PAID, PAID, CANCELLED).',
        schema: z.object({
          status: z.string().optional().describe('Invoice status to filter by'),
          limit: z.number().optional().describe('Number of invoices to return (default 10)'),
        })
      }
    ),

    // 3. Query Inventory Tool
    tool(
      async ({ minStock }) => {
        try {
          const result = await new ListInventoryOperation().execute(executionContext, { limit: 50 });
          let items = result.map(i => ({ product: i.product?.name, sku: i.product?.sku, quantity: i.quantity }));
          if (minStock !== undefined) {
             items = items.filter(i => i.quantity <= minStock);
          }
          return JSON.stringify(items);
        } catch (e) { return `Error: ${e.message}`; }
      },
      {
        name: 'query_inventory',
        description: 'Fetches current stock levels. If minStock is provided, returns ONLY products where quantity is at or below minStock.',
        schema: z.object({
          minStock: z.number().optional().describe('Only return inventory <= this threshold'),
        })
      }
    ),

    // 4. Save to Long-Term Memory Tool
    tool(
      async ({ namespace, key, value }) => {
        try {
          const { businessId, userId } = executionContext;
          
          // Check if exists
          const existing = await db.select().from(aiMemories).where(and(
             eq(aiMemories.businessId, businessId),
             eq(aiMemories.userId, userId),
             eq(aiMemories.namespace, namespace),
             eq(aiMemories.memoryKey, key)
          ));

          if (existing.length > 0) {
             await db.update(aiMemories)
               .set({ data: { value }, updatedAt: new Date() })
               .where(eq(aiMemories.id, existing[0].id));
          } else {
             await db.insert(aiMemories).values({
               id: generateId(),
               businessId,
               userId,
               namespace,
               memoryKey: key,
               scope: 'USER',
               data: { value },
               importance: 5,
               createdAt: new Date(),
               updatedAt: new Date()
             });
          }
          return `Successfully remembered that ${key} = ${value}`;
        } catch (e) { return `Error saving memory: ${e.message}`; }
      },
      {
        name: 'save_fact_to_memory',
        description: 'Saves a preference, rule, or fact to long-term memory (e.g. "User prefers Markdown tables", "Default markup is 20%").',
        schema: z.object({
          namespace: z.string().describe('Category of the memory (e.g. "preferences", "rules", "facts")'),
          key: z.string().describe('Short identifier for the fact (e.g. "markup", "format")'),
          value: z.any().describe('The actual value to remember')
        })
      }
    ),

    // 5. Create Background Workflow Engine Tool
    tool(
      async ({ name, triggerEvent, condition, actions }) => {
        try {
          const result = await new CreateWorkflowOperation().execute(executionContext, {
            name, 
            triggerEvent, 
            condition: condition || {}, 
            actions, 
            isEnabled: true
          });
          return `Successfully generated background Workflow Rule ID: ${result.id}. Automation is now live!`;
        } catch (e) { return `Error mapping workflow: ${e.message}`; }
      },
      {
        name: 'create_workflow_rule',
        description: 'Creates a background automation rule (IFTTT). CRITICAL: Before deploying a new rule, ALWAYS use list_workflows first! If a functionally identical rule exists but is disabled, use toggle_workflow_status to turn it back on instead of creating a duplicate.',
        schema: z.object({
          name: z.string().describe('Readable name of the workflow'),
          triggerEvent: z.enum(['inventory.adjusted', 'invoice.created', 'purchase.created', 'payment.recorded']).describe('The system event that wakes up the workflow'),
          condition: z.object({
            field: z.string(),
            operator: z.enum(['>', '<', '==', '!=']),
            value: z.any()
          }).optional().describe('Mathematical if-condition logic. Ex: { field: "quantity", operator: "<", value: 10 }'),
          actions: z.array(z.object({
            actionType: z.enum(['CREATE_TASK', 'INTERNAL_EMAIL', 'REPLENISH_STOCK', 'SEND_SMS']),
            configuration: z.record(z.any()).optional()
          })).describe('The sequence of actions to take if the condition passes. Return an array of action objects.')
        })
      }
    ),

    // 6. List Workflows Tool
    tool(
      async () => {
        try {
          const rules = await db.select({
             id: workflows.id,
             name: workflows.name,
             triggerEvent: workflows.triggerEvent,
             isEnabled: workflows.isEnabled
          }).from(workflows).where(eq(workflows.businessId, executionContext.businessId));
          return JSON.stringify(rules);
        } catch (e) { return `Error: ${e.message}`; }
      },
      {
         name: 'list_workflows',
         description: 'Retrieves all background IFTTT workflow logic rules configured for the business along with their UUIDs.',
         schema: z.object({})
      }
    ),

    // 7. Toggle Workflow Status Tool
    tool(
      async ({ workflowId, enable }) => {
        try {
          await db.update(workflows)
            .set({ isEnabled: enable })
            .where(and(eq(workflows.id, workflowId), eq(workflows.businessId, executionContext.businessId)));
          return `Successfully set workflow ID ${workflowId} to enabled=${enable}`;
        } catch (e) { return `Error toggling workflow: ${e.message}`; }
      },
      {
         name: 'toggle_workflow_status',
         description: 'Turns an existing background workflow ON or OFF given its ID.',
         schema: z.object({
           workflowId: z.string().describe('The UUID of the workflow to toggle'),
           enable: z.boolean().describe('Set to true to activate the workflow, false to disable it')
         })
      }
    ),

    // 8. Stage Add Product Tool (DRAFT ONLY)
    tool(
      async (payload) => {
        // Auto-inject a default unitId to satisfy strict Dto Validation (e.g. PCS)
        if (!payload.unitId) {
           const defaultUnit = await db.select().from(units).where(eq(units.businessId, executionContext.businessId)).limit(1);
           if (defaultUnit.length > 0) payload.unitId = defaultUnit[0].id;
        }

        // Return a structural drafted envelope instead of mutating DB
        return JSON.stringify({
          _type: 'ACTION_CONFIRMATION',
          action: 'add_product',
          endpoint: '/api/catalog/products',
          payload
        });
      },
      {
        name: 'stage_add_product',
        description: 'Drafts a new product to be added to the catalog. Does NOT execute it. Requires user confirmation. Always use this instead of trying to hit the database directly for products.',
        schema: z.object({
          name: z.string().describe('Readable product name'),
          sku: z.string().describe('Barcode or unique SKU'),
          purchasePrice: z.number().describe('Cost to buy this item'),
          sellingPrice: z.number().describe('Price to sell this item'),
          categoryId: z.string().optional().describe('Optional category UUID if known'),
          type: z.enum(['PHYSICAL', 'DIGITAL', 'SERVICE']).describe('Type of product. Defaults to PHYSICAL if unsure.')
        })
      }
    ),

    // 9. Stage Adjust Inventory Tool (DRAFT ONLY)
    tool(
      async (payload) => {
        return JSON.stringify({
          _type: 'ACTION_CONFIRMATION',
          action: 'adjust_inventory',
          endpoint: '/api/inventory',
          payload
        });
      },
      {
        name: 'stage_adjust_inventory',
        description: 'Drafts an inventory stock adjustment. Requires user confirmation. Use this when user says "I received 10 units of XYZ" or "We threw away 2 units".',
        schema: z.object({
          productId: z.string().describe('UUID of the product'),
          quantity: z.number().describe('The delta amount to change. Positive for received stock, negative for damages/loss.'),
          reason: z.enum(['PURCHASED', 'SOLD', 'DAMAGED', 'RETURNED', 'STOCKTAKE']).describe('Reason for the stock change'),
          notes: z.string().optional().describe('Any human readable notes like "found in warehouse"')
        })
      }
    ),

    // 10. Stage Add Customer Tool (DRAFT ONLY)
    tool(
      async (payload) => {
        return JSON.stringify({
          _type: 'ACTION_CONFIRMATION',
          action: 'add_customer',
          endpoint: '/api/crm/parties',
          payload
        });
      },
      {
        name: 'stage_add_customer',
        description: 'Drafts a new customer or supplier entity to be added to the CRM. Requires user confirmation.',
        schema: z.object({
          type: z.enum(['CUSTOMER', 'SUPPLIER']).describe('Whether this is a client (CUSTOMER) or a vendor (SUPPLIER)'),
          name: z.string().describe('Full name or business name of the party'),
          phone: z.string().optional().describe('Phone number of the party'),
          email: z.string().optional().describe('Email address of the party')
        })
      }
    ),

    // 11. Stage Create Invoice Tool (DRAFT ONLY)
    tool(
      async (payload) => {
        return JSON.stringify({
          _type: 'ACTION_CONFIRMATION',
          action: 'create_invoice',
          endpoint: '/api/sales/invoices',
          payload
        });
      },
      {
        name: 'stage_create_invoice',
        description: 'Drafts a new sales invoice. Requires user confirmation. The payload represents the invoice envelope.',
        schema: z.object({
          customerId: z.string().optional().describe('UUID of the customer ordering. If unknown, leave blank.'),
          items: z.array(z.object({
            productId: z.string().describe('UUID of the product'),
            quantity: z.number().describe('Quantity selling'),
            price: z.number().describe('Unit price being sold at')
          })).describe('Array of line items in the invoice'),
          totalAmount: z.number().describe('Total computed amount of the invoice'),
          amountPaid: z.number().describe('Amount the customer paid upfront. If 0, the invoice is an unpaid Udhaar/debt.')
        })
      }
    )
  ];
};
