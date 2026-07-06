import { BaseOperation } from '../../BaseOperation.js';
import { UnitRepository } from '../../../../persistence/repositories/UnitRepository.js';

export class GetUnitOperation extends BaseOperation {
  async perform(context, input, tx) {
    if (!input.id) throw new Error('Unit ID is required');

    const unit = await UnitRepository.findById(input.id, tx);
    if (!unit || unit.businessId !== context.businessId) {
      const err = new Error('Unit not found');
      err.code = 'NOT_FOUND';
      throw err;
    }

    return unit;
  }
}
