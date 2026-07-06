import { BaseOperation } from '../../BaseOperation.js';
import { LedgerAccountRepository } from '../../../../persistence/repositories/LedgerAccountRepository.js';

export class ListLedgerAccountsOperation extends BaseOperation {
  async perform(context, input) {
    const { businessId } = context;
    const { page = 1, limit = 50 } = input || {};

    const result = await LedgerAccountRepository.findAll({
      businessId,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    return result;
  }

  createEvents() { return []; }
}
