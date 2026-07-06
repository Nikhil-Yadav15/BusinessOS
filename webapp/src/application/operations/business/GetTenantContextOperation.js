import { BaseOperation } from '../BaseOperation.js';
import { BusinessRepository } from '../../../persistence/repositories/BusinessRepository.js';
import { BusinessMemberRepository } from '../../../persistence/repositories/BusinessMemberRepository.js';
import { RoleRepository } from '../../../persistence/repositories/RoleRepository.js';
import { SecurityEventRepository } from '../../../persistence/repositories/SecurityEventRepository.js';
import { AuthorizationError, ValidationError } from '../../errors/index.js';
import { AuthorizationService } from '../../security/AuthorizationService.js';
export class GetTenantContextOperation extends BaseOperation {
  
  async validate(context, input) {
    if (!context.userId) throw new ValidationError('User must be authenticated.');
    if (!input.businessId) throw new ValidationError('Business ID is required.');
  }

  async perform(context, input, tx) {
    const { userId } = context;
    const { ipAddress } = context.metadata;
    const { businessId } = input;

    // 1. Validate Business Exists & Is Active
    const business = await BusinessRepository.findById(businessId, tx);
    if (!business || business.status !== 'ACTIVE') {
      throw new AuthorizationError('Business not found or inactive.');
    }

    // 2. Validate Membership
    const member = await BusinessMemberRepository.findByBusinessAndUser(businessId, userId, tx);
    if (!member || member.status !== 'ACTIVE') {
      throw new AuthorizationError('You do not have active access to this business.');
    }

    // 3. Fetch raw RBAC assignments
    const rawData = await RoleRepository.getRawMemberData(member.id, tx);

    // Resolve effective permissions
    const permissions = AuthorizationService.resolveEffectivePermissions(
    rawData.permissions
    );

    // 4. Audit the Tenant Access
    await SecurityEventRepository.logEvent({
    userId,
    businessId,
    eventType: 'TENANT_ACCESSED',
    severity: 'LOW',
    ipAddress,
    details: {
        memberId: member.id,
        roles: rawData.roles.map(r => r.name)
    }
    }, tx);

    return {
    business: {
        id: business.id,
        name: business.name,
        businessType: business.businessType,
    },
    member: {
        id: member.id,
        joinedAt: member.joinedAt,
    },
    roles: rawData.roles,
    permissions
    };
  }
}