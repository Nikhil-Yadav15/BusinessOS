import { BaseOperation } from '../BaseOperation.js';
import { WorkflowRepository } from '../../../persistence/repositories/WorkflowRepository.js';
import { ValidationUtils, validateDto } from '../../common/ValidationUtils.js';
import { generateId } from '../../../infrastructure/id/uuid.js';

export class CreateWorkflowOperation extends BaseOperation {
  async validate(context, input) {
    if (!input.name || typeof input.name !== 'string') {
      throw new Error('Workflow name is required');
    }
    if (!input.triggerEvent) {
      throw new Error('triggerEvent is required');
    }
    if (!input.actions || !Array.isArray(input.actions) || input.actions.length === 0) {
      throw new Error('At least one action is required');
    }
  }

  async perform(context, input, tx) {
    const { businessId, userId } = context;

    // 1. Create the Parent Workflow Rule
    const workflowId = generateId();
    await WorkflowRepository.create({
      id: workflowId,
      businessId,
      name: input.name,
      description: input.description || null,
      triggerEvent: input.triggerEvent,
      condition: input.condition || {}, 
      isEnabled: input.isEnabled !== false,
      createdBy: userId
    }, tx);

    // 2. Insert the Sequential Actions securely locking them to the workflow
    const actionsTable = WorkflowRepository.getDB(tx).insert; 
    // Wait, BaseRepository currently doesn't natively expose custom tables for generic inserts. 
    // We should use standard operations or explicit raw drizzle logic mapped through the repository layer.
    
    // For V1, let's call a custom creation method inside WorkflowRepository.
    await WorkflowRepository.createActions(
      input.actions.map((action, idx) => ({
        workflowId,
        actionOrder: idx + 1,
        actionType: action.actionType,
        configuration: action.configuration || {}
      })),
      tx
    );

    return { id: workflowId, status: 'CREATED' };
  }
}
