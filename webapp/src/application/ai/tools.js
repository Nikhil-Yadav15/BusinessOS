import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { GetAnalyticsSnapshotOperation } from '../operations/analytics/GetAnalyticsSnapshotOperation.js';
import { ListInvoicesOperation } from '../operations/sales/invoices/ListInvoicesOperation.js';
import { ListInventoryOperation } from '../operations/inventory/ListInventoryOperation.js';
import { CreateWorkflowOperation } from '../operations/workflows/CreateWorkflowOperation.js';
import { db } from '../../db/index.js';
import { aiMemories } from '../../db/schema/ai.js';
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
        description: 'Creates a background automation rule (IFTTT). Use this when the user asks you to automate something or trigger an alert.',
        schema: z.object({
          name: z.string().describe('Readable name of the workflow'),
          triggerEvent: z.enum(['inventory.adjusted', 'invoice.created', 'purchase.created', 'payment.recorded']).describe('The system event that wakes up the workflow'),
          condition: z.object({
            field: z.string(),
            operator: z.enum(['>', '<', '==', '!=']),
            value: z.any()
          }).optional().describe('Mathematical if-condition logic. Ex: { field: "quantity", operator: "<", value: 10 }'),
          actions: z.array(z.object({
            actionType: z.enum(['CREATE_TASK', 'INTERNAL_EMAIL', 'REPLENISH_STOCK']),
            configuration: z.record(z.any()).optional()
          })).describe('The sequence of actions to take if the condition passes. Return an array of action objects.')
        })
      }
    )
  ];
};
