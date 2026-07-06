import { BaseOperation } from '../../BaseOperation.js';
import { BrandRepository } from '../../../../persistence/repositories/BrandRepository.js';
import { ValidationUtils, validateDto } from '../../../common/ValidationUtils.js';

export class ListBrandsOperation extends BaseOperation {
  async validate(context, input) {
    this.paginationParams = validateDto(ValidationUtils.pagination, input);
  }

  async perform(context, input, tx) {
    const filters = {
      businessId: context.businessId,
      ...input.filters
    };

    const records = await BrandRepository.findList({
      filters,
      page: this.paginationParams.page,
      limit: this.paginationParams.limit,
      sortBy: this.paginationParams.sortBy,
      sortOrder: this.paginationParams.sortOrder
    }, tx);

    return records;
  }
}
