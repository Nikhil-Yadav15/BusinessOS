import { BaseOperation } from '../BaseOperation.js';
import { InventoryRepository } from '../../../persistence/repositories/InventoryRepository.js';
import { ValidationUtils, validateDto } from '../../common/ValidationUtils.js';

export class ListInventoryOperation extends BaseOperation {
  async validate(context, input) {
    this.paginationParams = validateDto(ValidationUtils.pagination, input);
  }

  async perform(context, input, tx) {
    // We can filter by productId if we only want stock for a specific group of products
    const filters = {
      businessId: context.businessId,
      ...input.filters
    };

    const records = await InventoryRepository.findList({
      filters,
      page: this.paginationParams.page,
      limit: this.paginationParams.limit,
      // Default to sorting by most recently updated
      sortBy: this.paginationParams.sortBy || 'updatedAt',
      sortOrder: this.paginationParams.sortOrder || 'desc'
    }, tx);

    return records;
  }
}
