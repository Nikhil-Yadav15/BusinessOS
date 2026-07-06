import { BaseOperation } from '../../BaseOperation.js';
import { CategoryRepository } from '../../../../persistence/repositories/CategoryRepository.js';

export class GetCategoryOperation extends BaseOperation {
  async perform(context, input, tx) {
    if (!input.id) throw new Error('Category ID is required');

    const category = await CategoryRepository.findById(input.id, tx);
    if (!category || category.businessId !== context.businessId) {
      const err = new Error('Category not found');
      err.code = 'NOT_FOUND';
      throw err;
    }

    return category;
  }
}
