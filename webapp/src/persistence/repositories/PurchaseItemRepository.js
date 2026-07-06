import { BaseRepository } from './BaseRepository.js';
import { purchaseItems } from '../../db/schema/purchasing.js';

export class PurchaseItemRepository extends BaseRepository {
  static get table() {
    return purchaseItems;
  }
}
