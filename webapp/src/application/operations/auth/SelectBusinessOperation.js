import { BaseOperation } from '../BaseOperation.js';
import { BusinessRepository } from '../../../persistence/repositories/BusinessRepository.js';
import { AuthenticationError, AuthorizationError } from '../../errors/index.js';

export class SelectBusinessOperation extends BaseOperation {
  
  async validate(context) {
    if (!context.userId) {
      throw new AuthenticationError('User must be authenticated to select a business.');
    }
    // businessId is established authoritatively by the Gateway (buildContext)
    if (!context.businessId || !context.memberId) {
      throw new AuthorizationError('Invalid or unauthorized business selection.');
    }
  }

  async perform(context, input, tx) {
    const business = await BusinessRepository.findById(context.businessId, tx);

    if (!business || business.status !== 'ACTIVE') {
      throw new AuthorizationError('This business is inactive or unavailable.');
    }

    return {
      business: {
        id: business.id,
        name: business.name,
        type: business.businessType,
      },
      memberId: context.memberId,
    };
  }

  createEvents() {
    return [];
  }
}