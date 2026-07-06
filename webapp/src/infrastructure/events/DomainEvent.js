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
  static create(paramsOrEventType, payloadArg = {}, context = null) {
    const params = typeof paramsOrEventType === 'string'
      ? DomainEvent.fromEventType(paramsOrEventType, payloadArg, context)
      : paramsOrEventType;

    const {
      businessId,
      eventType,
      sourceDomain,
      aggregateType,
      aggregateId,
      correlationId,
      causationId,
      payload
    } = params;

    return {
      id: generateId(),
      businessId: businessId || null, 
      eventType,
      eventVersion: 1, 
      sourceDomain,
      aggregateType,
      aggregateId,
      correlationId: correlationId || null,
      causationId: causationId || null,
      payload,
      occurredAt: new Date(),
    };
  }

  static fromEventType(eventType, payload, context) {
    const [sourceDomain, ...aggregateParts] = eventType.split('.');
    const aggregateType = aggregateParts[0] || sourceDomain;

    return {
      businessId: context?.businessId || payload.businessId || null,
      eventType,
      sourceDomain,
      aggregateType,
      aggregateId: DomainEvent.resolveAggregateId(aggregateType, payload),
      correlationId: context?.metadata?.correlationId || null,
      causationId: context?.metadata?.causationId || null,
      payload,
    };
  }

  static resolveAggregateId(aggregateType, payload) {
    const aggregateKey = `${aggregateType}Id`;
    return payload[aggregateKey] || payload.aggregateId || payload.businessId || payload.memberId;
  }
}
