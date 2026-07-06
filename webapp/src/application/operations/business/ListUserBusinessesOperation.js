import { BaseOperation } from '../BaseOperation.js';
import { BusinessRepository } from '../../../persistence/repositories/BusinessRepository.js';
import { ValidationError } from '../../errors/index.js';

export class ListUserBusinessesOperation extends BaseOperation {
  
  async validate(context) {
    if (!context.userId) {
      throw new ValidationError('User must be authenticated to list businesses.');
    }
  }

  async perform(context, input, tx) {
    const { userId } = context;

    // Fetch all active businesses where the user is a member
    const userBusinesses = await BusinessRepository.getBusinessesForUser(userId, tx);

    return {
      businesses: userBusinesses
    };
  }

}