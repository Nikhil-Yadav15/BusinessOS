import { BaseOperation } from '../../BaseOperation.js';
import { UnitRepository } from '../../../../persistence/repositories/UnitRepository.js';
import { DomainEvent } from '../../../../infrastructure/events/DomainEvent.js';
import { UnitDto } from '../dto/UnitDto.js';
import { validateDto } from '../../../common/ValidationUtils.js';

export class CreateUnitOperation extends BaseOperation {
  async validate(context, input) {
    this.validatedData = validateDto(UnitDto.create, input);
  }

  async perform(context, input, tx) {
    const businessId = context.businessId;
    if (!businessId) throw new Error('businessId is missing from execution context');

    const recordToInsert = {
      ...this.validatedData,
      businessId
    };

    const unit = await UnitRepository.create(recordToInsert, tx);
    return unit;
  }

  createEvents(context, result) {
    return [
      DomainEvent.create('catalog.unit.created', {
        businessId: context.businessId,
        aggregateId: result.id,
        name: result.name
      }, context)
    ];
  }
}
