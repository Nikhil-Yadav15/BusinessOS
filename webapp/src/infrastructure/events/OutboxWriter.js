import { events, eventOutbox } from '../../db/schema/system.js'; 
import { generateId } from '../id/uuid.js';

export class OutboxWriter {
  /**
   * Writes canonical events to the outbox within the existing database transaction.
   * @param {Object} tx - The Drizzle transaction object from UnitOfWork
   * @param {Array} eventsList - The standardized domain events to publish
   */
  static async write(tx, eventsList) {
    if (!eventsList || eventsList.length === 0) return;

    // Create the outbox pointer records with correct camelCase Drizzle schema keys
    const outboxRecords = eventsList.map(event => ({
      id: generateId(),
      eventId: event.id,
      status: 'PENDING',
      retryCount: 0,
      createdAt: new Date(),
    }));

    // 1. Save the canonical event to the immutable event ledger
    await tx.insert(events).values(eventsList);

    // 2. Save the pointer to the outbox for eventual background processing
    await tx.insert(eventOutbox).values(outboxRecords);
  }
}