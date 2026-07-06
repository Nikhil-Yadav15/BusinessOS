import { BaseOperation } from '../../BaseOperation.js';
import { ProductRepository } from '../../../../persistence/repositories/ProductRepository.js';
import { DomainEvent } from '../../../../infrastructure/events/DomainEvent.js';
import { ProductDto } from '../dto/ProductDto.js';
import { validateDto } from '../../../common/ValidationUtils.js';

export class CreateProductOperation extends BaseOperation {
  async validate(context, input) {
    this.validatedData = validateDto(ProductDto.create, input);
  }

  async perform(context, input, tx) {
    const businessId = context.businessId;
    if (!businessId) throw new Error('businessId is missing from execution context');

    // Convert decimal numbers to string mathematically since Decimal places map cleanly in Postgres
    const recordToInsert = {
      ...this.validatedData,
      purchasePrice: String(this.validatedData.purchasePrice),
      sellingPrice: String(this.validatedData.sellingPrice),
      mrp: this.validatedData.mrp ? String(this.validatedData.mrp) : null,
      gstRate: String(this.validatedData.gstRate),
      minimumStock: String(this.validatedData.minimumStock),
      businessId
    };

    const product = await ProductRepository.create(recordToInsert, tx);
    return product;
  }

  createEvents(context, result) {
    return [
      DomainEvent.create('catalog.product.created', {
        businessId: context.businessId,
        aggregateId: result.id,
        sku: result.sku,
        name: result.name
      }, context)
    ];
  }
}
