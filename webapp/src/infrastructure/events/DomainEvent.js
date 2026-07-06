import { generateId } from '../id/uuid.js';

export class DomainEvent {
  /**
   * Creates a standardized canonical domain event.
   * @param {Object} params
   * @param {string} params.businessId - The active tenant
   * @param {string} params.eventType - e.g., 'invoice.finalized'
   * @param {string} params.sourceDomain - e.g., 'sales'
   * @param {string} params.aggregateType - e.g., 'invoice'
   * @param {string} params.aggregateId - The ID of the affected business entity
   * @param {string} [params.correlationId] - Ties the entire business operation together
   * @param {string} [params.causationId] - Identifies the predecessor event, if any
   * @param {Object} params.payload - The immutable business facts
   */
  static create({ 
    businessId, 
    eventType, 
    sourceDomain, 
    aggregateType, 
    aggregateId, 
    correlationId, 
    causationId, 
    payload 
  }) {
    return {
      id: generateId(),
      businessId: businessId || null, 
      eventType: eventType,
      eventVersion: 1, 
      sourceDomain: sourceDomain,
      aggregateType: aggregateType,
      aggregateId: aggregateId,
      correlationId: correlationId || null,
      causationId: causationId || null,
      payload: payload,
      occurredAt: new Date(),
    };
  }
}