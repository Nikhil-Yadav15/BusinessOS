import { BaseOperation } from '../../BaseOperation.js';
import { BrandRepository } from '../../../../persistence/repositories/BrandRepository.js';
import { DomainEvent } from '../../../../infrastructure/events/DomainEvent.js';

export class DeleteBrandOperation extends BaseOperation {
  async validate(context, input) {
    if (!input.id) throw new Error('Brand ID is required');
    this.id = input.id;
  }

  async perform(context, input, tx) {
    const existing = await BrandRepository.findById(this.id, tx);
    if (!existing || existing.businessId !== context.businessId) {
      const err = new Error('Brand not found');
      err.code = 'NOT_FOUND';
      throw err;
    }

    await BrandRepository.delete(this.id, tx);
    return { success: true };
  }

  createEvents(context, result) {
    return [
      DomainEvent.create('catalog.brand.deleted', {
        businessId: context.businessId,
        aggregateId: this.id,
      }, context)
    ];
  }
}
