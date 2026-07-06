import { BaseOperation } from '../../BaseOperation.js';
import { ProductRepository } from '../../../../persistence/repositories/ProductRepository.js';
import { DomainEvent } from '../../../../infrastructure/events/DomainEvent.js';
import { ProductDto } from '../dto/ProductDto.js';
import { validateDto } from '../../../common/ValidationUtils.js';

export class UpdateProductOperation extends BaseOperation {
  async validate(context, input) {
    if (!input.id) throw new Error('Product ID is required');
    this.id = input.id;
    this.validatedData = validateDto(ProductDto.update, input.data);
  }

  async perform(context, input, tx) {
    const existing = await ProductRepository.findById(this.id, tx);
    if (!existing || existing.businessId !== context.businessId) {
      const err = new Error('Product not found');
      err.code = 'NOT_FOUND';
      throw err;
    }

    const payload = { ...this.validatedData };
    if (payload.purchasePrice !== undefined) payload.purchasePrice = String(payload.purchasePrice);
    if (payload.sellingPrice !== undefined) payload.sellingPrice = String(payload.sellingPrice);
    if (payload.mrp !== undefined) payload.mrp = payload.mrp ? String(payload.mrp) : null;
    if (payload.gstRate !== undefined) payload.gstRate = String(payload.gstRate);
    if (payload.minimumStock !== undefined) payload.minimumStock = String(payload.minimumStock);

    const updated = await ProductRepository.update(this.id, payload, tx);
    return updated;
  }

  createEvents(context, result) {
    return [
      DomainEvent.create('catalog.product.updated', {
        businessId: context.businessId,
        aggregateId: result.id,
      }, context)
    ];
  }
}
