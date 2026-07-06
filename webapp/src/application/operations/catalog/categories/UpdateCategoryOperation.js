import { BaseOperation } from '../../BaseOperation.js';
import { CategoryRepository } from '../../../../persistence/repositories/CategoryRepository.js';
import { DomainEvent } from '../../../../infrastructure/events/DomainEvent.js';
import { CategoryDto } from '../dto/CategoryDto.js';
import { validateDto } from '../../../common/ValidationUtils.js';

export class UpdateCategoryOperation extends BaseOperation {
  async validate(context, input) {
    if (!input.id) throw new Error('Category ID is required');
    this.id = input.id;
    this.validatedData = validateDto(CategoryDto.update, input.data);
  }

  async perform(context, input, tx) {
    const existing = await CategoryRepository.findById(this.id, tx);
    if (!existing || existing.businessId !== context.businessId) {
      const err = new Error('Category not found');
      err.code = 'NOT_FOUND';
      throw err;
    }

    const updated = await CategoryRepository.update(this.id, this.validatedData, tx);
    return updated;
  }

  createEvents(context, result) {
    return [
      DomainEvent.create('catalog.category.updated', {
        businessId: context.businessId,
        aggregateId: result.id,
      }, context)
    ];
  }
}
