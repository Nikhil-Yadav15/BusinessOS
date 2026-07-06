import { BaseOperation } from '../../BaseOperation.js';
import { PurchaseRepository } from '../../../../persistence/repositories/PurchaseRepository.js';

export class GetPurchaseOperation extends BaseOperation {
  async perform(context, input, tx) {
    if (!input.id) throw new Error('Purchase ID is required');

    const purchase = await PurchaseRepository.findById(input.id, tx);
    if (!purchase || purchase.businessId !== context.businessId) {
      const err = new Error('Purchase not found');
      err.code = 'NOT_FOUND';
      throw err;
    }

    return purchase;
  }
}
