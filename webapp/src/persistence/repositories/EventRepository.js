import { BaseRepository } from './BaseRepository.js';
import { events, eventOutbox } from '../../db/schema/system.js';
import { eq, asc, inArray } from 'drizzle-orm';

export class EventRepository extends BaseRepository {
  static get table() { return events; }
  
  static async getPendingOutboxEvents(limit = 50, tx) {
    const conn = this.getDB(tx);
    // Fetch pending outbox records and join the actual canonical event payload
    const records = await conn
      .select({
        outboxId: eventOutbox.id,
        eventId: events.id,
        eventType: events.eventType,
        payload: events.payload,
        businessId: events.businessId,
        retryCount: eventOutbox.retryCount,
      })
      .from(eventOutbox)
      .innerJoin(events, eq(eventOutbox.eventId, events.id))
      .where(eq(eventOutbox.status, 'PENDING'))
      .orderBy(asc(eventOutbox.createdAt)) // Process oldest first (FIFO)
      .limit(limit);
      
    return records;
  }

  static async markOutboxCompleted(outboxIds, tx) {
    if (!outboxIds || outboxIds.length === 0) return;
    const conn = this.getDB(tx);
    await conn.update(eventOutbox)
      .set({ 
        status: 'COMPLETED', 
        processedAt: new Date() 
      })
      .where(inArray(eventOutbox.id, outboxIds));
  }
  
  static async markOutboxFailed(outboxId, retryCount, tx) {
    const conn = this.getDB(tx);
    await conn.update(eventOutbox)
      .set({ 
        status: retryCount >= 3 ? 'FAILED' : 'PENDING',
        retryCount: retryCount + 1,
        lastAttemptAt: new Date()
      })
      .where(eq(eventOutbox.id, outboxId));
  }
}
