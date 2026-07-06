import { BaseOperation } from '../../BaseOperation.js';
import { CategoryRepository } from '../../../../persistence/repositories/CategoryRepository.js';
import { DomainEvent } from '../../../../infrastructure/events/DomainEvent.js';
import { CategoryDto } from '../dto/CategoryDto.js';
import { validateDto } from '../../../common/ValidationUtils.js';

export class CreateCategoryOperation extends BaseOperation {
  async validate(context, input) {
    this.validatedData = validateDto(CategoryDto.create, input);
  }

  async perform(context, input, tx) {
    const businessId = context.businessId;
    if (!businessId) throw new Error('businessId is missing from execution context');

    const recordToInsert = {
      ...this.validatedData,
      businessId
    };

    const category = await CategoryRepository.create(recordToInsert, tx);
    return category;
  }

  createEvents(context, result) {
    return [
      DomainEvent.create('catalog.category.created', {
        businessId: context.businessId,
        aggregateId: result.id,
        name: result.name
      }, context)
    ];
  }
}
