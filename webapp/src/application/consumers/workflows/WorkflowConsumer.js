import { WorkflowRepository } from '../../../persistence/repositories/WorkflowRepository.js';

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
               await this.executeAction(action, payload, tx);
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

  async executeAction(action, payload, tx) {
     // An internal registry mapping external IFTTT user configs to rigid backend classes.
     switch (action.actionType) {
        case 'CREATE_TASK':
           console.log('🤖 Background Workflow creating TASK:', action.configuration);
           // We will map this natively to a CRM task generator logic here later as we build actions!
           break;
        case 'INTERNAL_EMAIL':
           console.log('🤖 Background Workflow triggering EMAIL via generic SMTP:', action.configuration);
           break;
        case 'REPLENISH_STOCK':
           console.log('🤖 Background Workflow drafting Purchase Bill against payload:', payload);
           break;
        default:
           console.log('🤖 Undefined background action node type executed:', action.actionType);
     }
  }
}
