import { eq, and, asc } from 'drizzle-orm';
import { BaseRepository } from './BaseRepository.js';
import { workflows, workflowActions, workflowExecutions } from '../../db/schema/workflow.js';

export class WorkflowRepository extends BaseRepository {
  static get table() { return workflows; }

  static async findActiveRulesWithActions(businessId, triggerEvent, tx) {
    const conn = this.getDB(tx);
    const activeFlows = await conn
      .select()
      .from(workflows)
      .where(and(
        eq(workflows.businessId, businessId),
        eq(workflows.triggerEvent, triggerEvent),
        eq(workflows.isEnabled, true)
      ));

    // Hydrate all sequence layout actions associated with the active workflows
    const hydratedFlows = [];
    for (const flow of activeFlows) {
      const actions = await conn
        .select()
        .from(workflowActions)
        .where(eq(workflowActions.workflowId, flow.id))
        .orderBy(asc(workflowActions.actionOrder));
      
      hydratedFlows.push({ ...flow, actions });
    }
    
    return hydratedFlows;
  }

  static async createActions(actionsData, tx) {
     const conn = this.getDB(tx);
     if (actionsData.length === 0) return [];
     return await conn.insert(workflowActions).values(actionsData).returning();
  }

  static async logExecution(data, tx) {
     const conn = this.getDB(tx);
     const [record] = await conn.insert(workflowExecutions).values(data).returning();
     return record;
  }
  
  static async updateExecution(id, status, error, tx) {
     const conn = this.getDB(tx);
     await conn.update(workflowExecutions)
       .set({ status, errorMessage: error || null, completedAt: new Date() })
       .where(eq(workflowExecutions.id, id));
  }
}
