import { BaseOperation } from '../BaseOperation.js';
import { BusinessMemberRepository } from '../../../persistence/repositories/BusinessMemberRepository.js';
import { ValidationError } from '../../errors/index.js';

export class GetMemberOperation extends BaseOperation {

  async validate(context, input) {
    if (!context.businessId) {
      throw new ValidationError(
        'Active business context is required.'
      );
    }

    if (!input.memberId) {
      throw new ValidationError(
        'memberId is required.'
      );
    }
  }

  async perform(context, input, tx) {

    const member = await BusinessMemberRepository.findByBusinessAndId(
      context.businessId,
      input.memberId,
      tx
    );

    if (!member) {
      throw new ValidationError(
        'Member not found.'
      );
    }

    return {
      success: true,
      member
    };
  }

  createEvents() {
    return [];
  }

}