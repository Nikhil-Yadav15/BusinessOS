import { BaseOperation } from '../../BaseOperation.js';
import { BrandRepository } from '../../../../persistence/repositories/BrandRepository.js';
import { DomainEvent } from '../../../../infrastructure/events/DomainEvent.js';
import { BrandDto } from '../dto/BrandDto.js';
import { validateDto } from '../../../common/ValidationUtils.js';

export class CreateBrandOperation extends BaseOperation {
  async validate(context, input) {
    this.validatedData = validateDto(BrandDto.create, input);
  }

  async perform(context, input, tx) {
    const businessId = context.businessId;
    if (!businessId) throw new Error('businessId is missing from execution context');

    const recordToInsert = {
      ...this.validatedData,
      businessId
    };

    const brand = await BrandRepository.create(recordToInsert, tx);
    return brand;
  }

  createEvents(context, result) {
    return [
      DomainEvent.create('catalog.brand.created', {
        businessId: context.businessId,
        aggregateId: result.id,
        name: result.name
      }, context)
    ];
  }
}
