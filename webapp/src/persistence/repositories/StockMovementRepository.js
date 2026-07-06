import { BaseRepository } from './BaseRepository.js';
import { stockMovements } from '../../db/schema/inventory.js';

export class StockMovementRepository extends BaseRepository {
  static get table() {
    return stockMovements;
  }
}
