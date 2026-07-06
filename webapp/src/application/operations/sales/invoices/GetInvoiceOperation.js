import { BaseOperation } from '../../BaseOperation.js';
import { InvoiceRepository } from '../../../../persistence/repositories/InvoiceRepository.js';

export class GetInvoiceOperation extends BaseOperation {
  async perform(context, input, tx) {
    if (!input.id) throw new Error('Invoice ID is required');

    const invoice = await InvoiceRepository.findById(input.id, tx);
    if (!invoice || invoice.businessId !== context.businessId) {
      const err = new Error('Invoice not found');
      err.code = 'NOT_FOUND';
      throw err;
    }

    return invoice;
  }
}
