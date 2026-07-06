import { BaseOperation } from '../../BaseOperation.js';
import { ProductRepository } from '../../../../persistence/repositories/ProductRepository.js';

export class GetProductOperation extends BaseOperation {
  async perform(context, input, tx) {
    if (!input.id) throw new Error('Product ID is required');

    const product = await ProductRepository.findById(input.id, tx);
    if (!product || product.businessId !== context.businessId) {
      const err = new Error('Product not found');
      err.code = 'NOT_FOUND';
      throw err;
    }

    return product;
  }
}
