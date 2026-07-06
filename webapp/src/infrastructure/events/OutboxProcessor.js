import { UnitOfWork } from '../db/UnitOfWork.js';
import { EventRepository } from '../../persistence/repositories/EventRepository.js';
import { EventRouter } from './EventRouter.js';

export class OutboxProcessor {
  /**
   * Core background worker function handling Event-Driven asynchronous dispatching.
   */
  static async processBatch(batchSize = 25) {
    // 1. We process sequentially to prevent race conditions on analytics in Phase 1
    const pendingEvents = await EventRepository.getPendingOutboxEvents(batchSize);

    if (pendingEvents.length === 0) {
      return { processed: 0, status: 'idle' };
    }

    let processedCount = 0;
    let failedCount = 0;

    for (const eventPointer of pendingEvents) {
       // Isolate each event into its own Database Transaction!
       // If one event crashes, the others still succeed and process.
       try {
         await UnitOfWork.execute({}, async (tx) => {
           // 2. Hydrate the full generic mapped Event structure
           const hydrationPayload = {
              eventId: eventPointer.eventId,
              eventType: eventPointer.eventType,
              businessId: eventPointer.businessId,
              payload: eventPointer.payload
           };

           // 3. Dispatch to internal router
           await EventRouter.dispatch(hydrationPayload, tx);

           // 4. Mark successful natively inside the same transaction locking
           await EventRepository.markOutboxCompleted([eventPointer.outboxId], tx);
           processedCount++;
         });
       } catch (error) {
         console.error(`[Outbox] Failed to process event ${eventPointer.eventId}`, error);
         failedCount++;
         
         // Mark failure natively (outside the rollback tx of the actual failure)
         await UnitOfWork.execute({}, async (tx) => {
            await EventRepository.markOutboxFailed(eventPointer.outboxId, eventPointer.retryCount, tx);
         });
       }
    }

    return { processed: processedCount, failed: failedCount, status: 'completed' };
  }
}
