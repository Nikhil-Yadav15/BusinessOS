import { BaseOperation } from '../../BaseOperation.js';
import { CategoryRepository } from '../../../../persistence/repositories/CategoryRepository.js';
import { DomainEvent } from '../../../../infrastructure/events/DomainEvent.js';

export class DeleteCategoryOperation extends BaseOperation {
  async validate(context, input) {
    if (!input.id) throw new Error('Category ID is required');
    this.id = input.id;
  }

  async perform(context, input, tx) {
    const existing = await CategoryRepository.findById(this.id, tx);
    if (!existing || existing.businessId !== context.businessId) {
      const err = new Error('Category not found');
      err.code = 'NOT_FOUND';
      throw err;
    }

    await CategoryRepository.delete(this.id, tx);
    return { success: true };
  }

  createEvents(context, result) {
    return [
      DomainEvent.create('catalog.category.deleted', {
        businessId: context.businessId,
        aggregateId: this.id,
      }, context)
    ];
  }
}
