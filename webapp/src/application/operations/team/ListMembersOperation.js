import { BaseOperation } from '../BaseOperation.js';
import { BusinessMemberRepository } from '../../../persistence/repositories/BusinessMemberRepository.js';
import { ValidationError } from '../../errors/index.js';

export class ListMembersOperation extends BaseOperation {

  async validate(context) {
    if (!context.businessId) {
      throw new ValidationError(
        'Active business context is required.'
      );
    }
  }

  async perform(context, input, tx) {
    const members = await BusinessMemberRepository.findByBusiness(
      context.businessId,
      tx
    ) || [];

    return {
      success: true,
      count: members.length,
      members
    };
  }

  createEvents() {
    return [];
  }

}