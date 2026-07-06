import { BaseRepository } from './BaseRepository.js';
import { invoiceItems } from '../../db/schema/sales.js';

export class InvoiceItemRepository extends BaseRepository {
  static get table() {
    return invoiceItems;
  }
}
