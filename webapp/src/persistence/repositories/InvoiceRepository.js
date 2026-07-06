import { BaseRepository } from './BaseRepository.js';
import { invoices } from '../../db/schema/sales.js';

export class InvoiceRepository extends BaseRepository {
  static get table() {
    return invoices;
  }
}
