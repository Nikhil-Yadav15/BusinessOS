import { BaseOperation } from '../../BaseOperation.js';
import { ProductRepository } from '../../../../persistence/repositories/ProductRepository.js';
import { ValidationUtils, validateDto } from '../../../common/ValidationUtils.js';

export class ListProductsOperation extends BaseOperation {
  async validate(context, input) {
    this.paginationParams = validateDto(ValidationUtils.pagination, input);
  }

  async perform(context, input, tx) {
    const filters = {
      businessId: context.businessId,
      ...input.filters
    };

    const records = await ProductRepository.findList({
      filters,
      page: this.paginationParams.page,
      limit: this.paginationParams.limit,
      sortBy: this.paginationParams.sortBy,
      sortOrder: this.paginationParams.sortOrder
    }, tx);

    return records;
  }
}
