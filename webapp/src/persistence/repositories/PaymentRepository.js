import { BaseRepository } from './BaseRepository.js';
import { payments } from '../../db/schema/sales.js';

export class PaymentRepository extends BaseRepository {
  static get table() {
    return payments;
  }
}
