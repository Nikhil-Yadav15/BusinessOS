import { BaseRepository } from './BaseRepository.js';
import { ledgerAccounts } from '../../db/schema/ledger.js';

export class LedgerAccountRepository extends BaseRepository {
  static get table() {
    return ledgerAccounts;
  }
}
