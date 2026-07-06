import { BaseOperation } from '../BaseOperation.js';
import { UserRepository } from '../../../persistence/repositories/UserRepository.js';
import { BusinessMemberRepository } from '../../../persistence/repositories/BusinessMemberRepository.js';
import { RoleRepository } from '../../../persistence/repositories/RoleRepository.js';
import { SecurityEventRepository } from '../../../persistence/repositories/SecurityEventRepository.js';
import { ValidationError } from '../../errors/index.js';
import { DomainEvent } from '../../../infrastructure/events/DomainEvent.js';

export class InviteMemberOperation extends BaseOperation {
  
  async validate(context, input) {
    if (!context.businessId) {
      throw new ValidationError('Active business context is required to invite members.');
    }
    if (!input.email || !input.roleId) {
      throw new ValidationError('Email and roleName are required.');
    }
  }

  async perform(context, input, tx) {
    const { businessId, userId: inviterId } = context;
    const { ipAddress } = context.metadata;
    const { email, roleId } = input;

    // 1. Verify User Exists (V1 constraint)
    const userToInvite = await UserRepository.findByEmail(email, tx);
    if (!userToInvite) {
      throw new ValidationError('User not found. In V1, users must register before being invited.');
    }

    if (userToInvite.id === inviterId) {
      throw new ValidationError('You cannot invite yourself.');
    }

    // 2. Prevent Duplicate Memberships
    const existingMember = await BusinessMemberRepository.findByBusinessAndUser(businessId, userToInvite.id, tx);
    if (existingMember) {
      throw new ValidationError('User is already a member of this business.');
    }

    // 3. Verify Requested Role Exists in Tenant
    const role = await RoleRepository.findByIdAndBusiness(
        roleId,
        businessId,
        tx
      );

      if (!role) {
        throw new ValidationError(
          'Role not found.'
        );
      }

    // 4. Create Membership
    // Defaulting to ACTIVE. If you add an invite acceptance flow later, change this to 'INVITED'.
    const member = await BusinessMemberRepository.create({
      businessId,
      userId: userToInvite.id,
      status: 'ACTIVE' 
    }, tx);

    // 5. Assign Role
    await RoleRepository.assignMemberRole({
      businessMemberId: member.id,
      roleId: role.id,
      assignedBy: inviterId
    }, tx);

    // 6. Audit Log
    await SecurityEventRepository.logEvent({
      userId: inviterId,
      eventType: 'MEMBER_INVITED',
      severity: 'MEDIUM',
      ipAddress,
      details: { businessId, invitedUserId: userToInvite.id, assignedRole: role.name }
    }, tx);

    return {
      success: true,
      memberId: member.id,
      userId: userToInvite.id,
      role: role.name
    };
  }

  createEvents(context, result) {
    return [
      DomainEvent.create('team.member_invited', {
        businessId: context.businessId,
        memberId: result.memberId,
        invitedUserId: result.userId,
        role: result.role
      }, context)
    ];
  }
}