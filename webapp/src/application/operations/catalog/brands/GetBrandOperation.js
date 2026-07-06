import { BaseOperation } from '../../BaseOperation.js';
import { BrandRepository } from '../../../../persistence/repositories/BrandRepository.js';

export class GetBrandOperation extends BaseOperation {
  async perform(context, input, tx) {
    if (!input.id) throw new Error('Brand ID is required');

    const brand = await BrandRepository.findById(input.id, tx);
    if (!brand || brand.businessId !== context.businessId) {
      const err = new Error('Brand not found');
      err.code = 'NOT_FOUND';
      throw err;
    }

    return brand;
  }
}
