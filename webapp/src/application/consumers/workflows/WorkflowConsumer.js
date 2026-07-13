import { WorkflowRepository } from '../../../persistence/repositories/WorkflowRepository.js';
import { db } from '../../../db/index.js';
import { purchases, purchaseItems } from '../../../db/schema/purchasing.js';
import { notifications, notificationDeliveries } from '../../../db/schema/notification.js';
import { generateId } from '../../../infrastructure/id/uuid.js';
import { EmailNotificationService } from '../../../infrastructure/notifications/EmailNotificationService.js';

export class WorkflowConsumer {
  /**
   * The Workflow Engine intercepts EVERYTHING dynamically using a wildcard routing flag.
   */
  getSubscribedEvents() {
    return ['*'];
  }

  async handle(event, tx) {
    const { businessId, eventType, payload, eventId } = event;

    // Fast check: Do we have active IF-statements configured for this exact trigger?
    const rules = await WorkflowRepository.findActiveRulesWithActions(businessId, eventType, tx);
    
    for (const rule of rules) {
      let executionId = null;
      try {
         // Create audit trail indicating background agent took over
         const exec = await WorkflowRepository.logExecution({
           workflowId: rule.id,
           eventId: eventId,
           status: 'RUNNING'
         }, tx);
         executionId = exec.id;

         // 1. Evaluate Condition Engine (Handles 'If Stock < 10' logic limits)
         const passed = this.evaluateCondition(rule.condition, payload);
         
         if (passed) {
            // 2. Pipeline sequence action handlers natively 
            for (const action of rule.actions) {
               await this.executeAction(action, rule, event, tx);
            }
            await WorkflowRepository.updateExecution(executionId, 'COMPLETED', null, tx);
         } else {
            // Logic aborted safely
            await WorkflowRepository.updateExecution(executionId, 'COMPLETED', 'Rule matched but condition evaluated false.', tx);
         }
      } catch (err) {
         console.error('[Workflow Engine] Execution Failed:', err);
         if (executionId) {
             await WorkflowRepository.updateExecution(executionId, 'FAILED', err.message, tx);
         }
      }
    }
  }

  evaluateCondition(condition, payload) {
    // Blank conditions mean global bypass (e.g. Always trigger on this Event).
    if (!condition || Object.keys(condition).length === 0) return true; 
    
    // Abstracted Engine: Supports { field: 'quantity', operator: '<', value: 10 }
    const { field, operator, value } = condition;
    const actual = payload[field];
    
    if (actual === undefined || actual === null) return false;
    
    switch (operator) {
      case '>': return Number(actual) > Number(value);
      case '<': return Number(actual) < Number(value);
      case '==': return actual == value;
      case '!=': return actual != value;
      default: return false;
    }
  }

  async executeAction(action, rule, event, tx) {
     const { payload, businessId } = event;
     const config = action.configuration || {};
     const conn = db; // We use raw db connection builder, or we can use the transacting tx context directly!
     
     // Note: we can use 'tx' directly to ensure atomic row locks
     
     switch (action.actionType) {
        case 'REPLENISH_STOCK': {
           const supplierId = config.fallbackSupplierId;
           if (!supplierId || !payload.productId) {
             console.log('🤖 Draft generation aborted: Missing config mapping.');
             break;
           }

           const purchaseId = generateId();
           await tx.insert(purchases).values({
              id: purchaseId,
              businessId,
              supplierId,
              purchaseNumber: `AUTO-PO-${Date.now()}`,
              purchaseType: 'PURCHASE',
              status: 'DRAFT',
              purchaseDate: new Date(),
              subtotal: "0.00",
              taxAmount: "0.00",
              totalAmount: "0.00",
              balanceAmount: "0.00",
              createdBy: rule.createdBy // Use the user who designed the rule as the auditor!
           });

           await tx.insert(purchaseItems).values({
              id: generateId(),
              purchaseId,
              productId: payload.productId,
              quantity: String(config.reorderQuantity || 20),
              unitCost: "1.00",
              taxAmount: "0.00",
              lineTotal: String(config.reorderQuantity || 20)
           });
           
           console.log('✅ Background Workflow drafted a Replenishment Bill!');
           break;
        }
        case 'INTERNAL_EMAIL': {
           // Create Notification Audit Row
           const notifId = generateId();
           await tx.insert(notifications).values({
              id: notifId,
              businessId,
              recipientType: 'USER',
              recipientId: rule.createdBy,
              message: `Atlas System Alert: ${config.subject || 'Automated Email Triggered'}`,
              status: 'SENT'
           });

           // Background dispatch via EmailNotificationService
           await EmailNotificationService.send({
             to: config.toEmail || 'owner@business.com',
             subject: config.subject || 'Atlas Automation Triggered',
             html: `<h3>Atlas Background Process</h3><p>Workflow <strong>${rule.name}</strong> successfully executed. <br/>Payload: ${JSON.stringify(payload)}</p>`
           });
           break;
        }
        case 'SEND_SMS': {
           // We will map this via standard Twilio fetch parameters later if the payload has a phone number.
           const twilioSid = process.env.TWILIO_ACCOUNT_SID;
           const twilioToken = process.env.TWILIO_AUTH_TOKEN;
           
           if (!twilioSid || !twilioToken) {
              console.log("No TWILIO variables in .env.local - SMS bypassed.");
              break;
           }
           
           const notifId = generateId();
           await tx.insert(notifications).values({
              id: notifId,
              businessId,
              recipientType: 'PARTY',
              recipientId: payload.partyId || generateId(), // If partyId isn't on the event, SMS is orphaned
              message: `Atlas Alert: ${config.smsMessage || 'Payment Received!'}`,
              status: 'SENT'
           });
           
           // Mocked Twilio Dispatch for MVP
           console.log("☎️ Twilio Hook dispatched securely.");
           break;
        }
        default:
           console.log('🤖 Undefined background action node type executed:', action.actionType);
     }
  }
}
