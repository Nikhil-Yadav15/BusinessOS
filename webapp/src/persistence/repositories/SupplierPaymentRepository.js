import { BaseRepository } from './BaseRepository.js';
import { supplierPayments } from '../../db/schema/purchasing.js';

export class SupplierPaymentRepository extends BaseRepository {
  static get table() {
    return supplierPayments;
  }
}
