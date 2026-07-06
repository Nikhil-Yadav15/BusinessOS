import { BaseOperation } from '../BaseOperation.js';
import { PartyRepository } from '../../../persistence/repositories/PartyRepository.js';
import { ValidationUtils, validateDto } from '../../common/ValidationUtils.js';

export class ListPartiesOperation extends BaseOperation {
  async validate(context, input) {
    this.paginationParams = validateDto(ValidationUtils.pagination, input);
  }

  async perform(context, input, tx) {
    // Tenant Isolation
    const filters = {
      businessId: context.businessId,
      ...input.filters
    };

    const records = await PartyRepository.findList({
      filters,
      page: this.paginationParams.page,
      limit: this.paginationParams.limit,
      sortBy: this.paginationParams.sortBy,
      sortOrder: this.paginationParams.sortOrder
    }, tx);

    return records;
  }
}
