import { BaseOperation } from '../../BaseOperation.js';
import { BrandRepository } from '../../../../persistence/repositories/BrandRepository.js';
import { DomainEvent } from '../../../../infrastructure/events/DomainEvent.js';
import { BrandDto } from '../dto/BrandDto.js';
import { validateDto } from '../../../common/ValidationUtils.js';

export class UpdateBrandOperation extends BaseOperation {
  async validate(context, input) {
    if (!input.id) throw new Error('Brand ID is required');
    this.id = input.id;
    this.validatedData = validateDto(BrandDto.update, input.data);
  }

  async perform(context, input, tx) {
    const existing = await BrandRepository.findById(this.id, tx);
    if (!existing || existing.businessId !== context.businessId) {
      const err = new Error('Brand not found');
      err.code = 'NOT_FOUND';
      throw err;
    }

    const updated = await BrandRepository.update(this.id, this.validatedData, tx);
    return updated;
  }

  createEvents(context, result) {
    return [
      DomainEvent.create('catalog.brand.updated', {
        businessId: context.businessId,
        aggregateId: result.id,
      }, context)
    ];
  }
}
