import { BaseOperation } from '../../BaseOperation.js';
import { UnitRepository } from '../../../../persistence/repositories/UnitRepository.js';
import { DomainEvent } from '../../../../infrastructure/events/DomainEvent.js';
import { UnitDto } from '../dto/UnitDto.js';
import { validateDto } from '../../../common/ValidationUtils.js';

export class UpdateUnitOperation extends BaseOperation {
  async validate(context, input) {
    if (!input.id) throw new Error('Unit ID is required');
    this.id = input.id;
    this.validatedData = validateDto(UnitDto.update, input.data);
  }

  async perform(context, input, tx) {
    const existing = await UnitRepository.findById(this.id, tx);
    if (!existing || existing.businessId !== context.businessId) {
      const err = new Error('Unit not found');
      err.code = 'NOT_FOUND';
      throw err;
    }

    const updated = await UnitRepository.update(this.id, this.validatedData, tx);
    return updated;
  }

  createEvents(context, result) {
    return [
      DomainEvent.create('catalog.unit.updated', {
        businessId: context.businessId,
        aggregateId: result.id,
      }, context)
    ];
  }
}
