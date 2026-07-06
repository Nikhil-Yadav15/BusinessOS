import { AnalyticsConsumer } from '../../application/consumers/analytics/AnalyticsConsumer.js';

export class EventRouter {
  /**
   * Routes an event dynamically to all registered domain consumers.
   * Using dynamic hardcoded routing here for Phase V1 simplicity instead of Kafka/RabbitMQ.
   */
  static async dispatch(event, tx) {
     const consumers = [
       AnalyticsConsumer
       // WorkflowsConsumer
       // NotificationsConsumer (Phase 6 expansion)
     ];

     for (const consumerClass of consumers) {
       const consumer = new consumerClass();
       // Only trigger consumers that declare they care about this eventType
       if (consumer.getSubscribedEvents().includes(event.eventType)) {
          await consumer.handle(event, tx);
       }
     }
  }
}
