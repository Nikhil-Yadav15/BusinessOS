import { BaseOperation } from '../../BaseOperation.js';
import { UnitRepository } from '../../../../persistence/repositories/UnitRepository.js';
import { DomainEvent } from '../../../../infrastructure/events/DomainEvent.js';

export class DeleteUnitOperation extends BaseOperation {
  async validate(context, input) {
    if (!input.id) throw new Error('Unit ID is required');
    this.id = input.id;
  }

  async perform(context, input, tx) {
    const existing = await UnitRepository.findById(this.id, tx);
    if (!existing || existing.businessId !== context.businessId) {
      const err = new Error('Unit not found');
      err.code = 'NOT_FOUND';
      throw err;
    }

    await UnitRepository.delete(this.id, tx);
    return { success: true };
  }

  createEvents(context, result) {
    return [
      DomainEvent.create('catalog.unit.deleted', {
        businessId: context.businessId,
        aggregateId: this.id,
      }, context)
    ];
  }
}
