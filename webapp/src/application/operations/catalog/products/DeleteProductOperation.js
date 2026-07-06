import { BaseOperation } from '../../BaseOperation.js';
import { ProductRepository } from '../../../../persistence/repositories/ProductRepository.js';
import { DomainEvent } from '../../../../infrastructure/events/DomainEvent.js';

export class DeleteProductOperation extends BaseOperation {
  async validate(context, input) {
    if (!input.id) throw new Error('Product ID is required');
    this.id = input.id;
  }

  async perform(context, input, tx) {
    const existing = await ProductRepository.findById(this.id, tx);
    if (!existing || existing.businessId !== context.businessId) {
      const err = new Error('Product not found');
      err.code = 'NOT_FOUND';
      throw err;
    }

    await ProductRepository.delete(this.id, tx);
    return { success: true };
  }

  createEvents(context, result) {
    return [
      DomainEvent.create('catalog.product.deleted', {
        businessId: context.businessId,
        aggregateId: this.id,
      }, context)
    ];
  }
}
