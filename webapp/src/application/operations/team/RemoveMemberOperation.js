import { BaseOperation } from '../BaseOperation.js';
import { BusinessMemberRepository } from '../../../persistence/repositories/BusinessMemberRepository.js';
import { RoleRepository } from '../../../persistence/repositories/RoleRepository.js';
import { SecurityEventRepository } from '../../../persistence/repositories/SecurityEventRepository.js';
import { DomainEvent } from '../../../infrastructure/events/DomainEvent.js';

import {
  ValidationError,
  AuthorizationError,
} from '../../errors/index.js';

export class RemoveMemberOperation extends BaseOperation {

  async validate(context, input) {
    if (!context.businessId) {
      throw new ValidationError('Business context is required.');
    }

    if (!context.userId) {
      throw new ValidationError('User must be authenticated.');
    }

    if (!input.memberId) {
      throw new ValidationError('Member ID is required.');
    }
  }

  async perform(context, input, tx) {
    const { businessId, userId } = context;
    const { ipAddress } = context.metadata;

    // 1. Fetch target member
    const member = await BusinessMemberRepository.findByBusinessAndId(
      businessId,
      input.memberId,
      tx
    );

    if (!member) {
      throw new ValidationError('Member not found.');
    }

    // 2. Prevent self-removal
    if (member.userId === userId) {
      throw new AuthorizationError(
        'You cannot remove yourself from the business.'
      );
    }

    // 3. Protect system roles
    const hasSystemRole = await RoleRepository.memberHasSystemRole(
      member.id,
      tx
    );

    if (hasSystemRole) {
      throw new AuthorizationError(
        'System members cannot be removed.'
      );
    }

    // 4. Remove role mappings
    await RoleRepository.removeMemberRoles(
      member.id,
      tx
    );

    // 5. Remove business membership
    await BusinessMemberRepository.remove(
      member.id,
      tx
    );

    // 6. Audit
    await SecurityEventRepository.logEvent({
      userId,
      businessId,
      eventType: 'MEMBER_REMOVED',
      severity: 'HIGH',
      ipAddress,
      details: {
        removedMemberId: member.id,
        removedUserId: member.userId,
      }
    }, tx);

    return {
      success: true,
      memberId: member.id,
    };
  }

  createEvents(context, result) {
    return [
      DomainEvent.create(
        'team.member.removed',
        {
          memberId: result.memberId,
        },
        context
      )
    ];
  }
}