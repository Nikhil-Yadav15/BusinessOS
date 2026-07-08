import { BaseOperation } from '../BaseOperation.js';
import { StockMovementRepository } from '../../../persistence/repositories/StockMovementRepository.js';

export class ListStockMovementsOperation extends BaseOperation {
  async perform(context, input) {
    const { businessId } = context;
    const { page = 1, limit = 50 } = input || {};

    const result = await StockMovementRepository.findList({
      filters: { businessId },
      page: parseInt(page),
      limit: parseInt(limit),
    }, context.tx);

    return result;
  }

  createEvents() { return []; }
}
