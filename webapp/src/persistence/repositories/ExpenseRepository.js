import { BaseRepository } from './BaseRepository.js';
import { expenses } from '../../db/schema/ledger.js';

export class ExpenseRepository extends BaseRepository {
  static get table() {
    return expenses;
  }
}
