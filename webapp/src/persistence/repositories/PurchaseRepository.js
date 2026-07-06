import { BaseRepository } from './BaseRepository.js';
import { purchases } from '../../db/schema/purchasing.js';

export class PurchaseRepository extends BaseRepository {
  static get table() {
    return purchases;
  }
}
