import { UnitOfWork } from '../../infrastructure/db/UnitOfWork.js';
import { OutboxWriter } from '../../infrastructure/events/OutboxWriter.js';

export class BaseOperation {
  /**
   * Enforces the standard lifecycle of every business operation in Atlas.
   * @param {ExecutionContext} context 
   * @param {Object} input - The validated DTO or payload
   */
  async execute(context, input) {
    // 1. Pre-Execution Validation (Application Safeguards)
    await this.validate(context, input);

    // 2. Unit of Work Boundary (ACID Transaction)
    return await UnitOfWork.execute(context, async (tx) => {
      
      // 3. Execute the core business logic (implemented by child classes)
      const result = await this.perform(context, input, tx);

      // 4. Generate Canonical Domain Events
      const events = this.createEvents(context, result);

      if (events && events.length > 0) {
        // 5. Write to Event Outbox within the SAME transaction
        await OutboxWriter.write(tx, events);
      }

      // 6. Return the business outcome
      return result;
    });
  }

  /**
   * @virtual Override for custom pre-transaction validation.
   */
  async validate(context, input) {
    // Default: no-op.
  }

  /**
   * @abstract MUST be implemented by specific operations.
   */
  async perform(context, input, tx) {
    throw new Error('perform() must be implemented by subclass');
  }

  /**
   * @virtual Maps the business result to Canonical Domain Events.
   * Should return an array of events created via DomainEvent.create()
   */
  createEvents(context, result) {
    return []; 
  }
}