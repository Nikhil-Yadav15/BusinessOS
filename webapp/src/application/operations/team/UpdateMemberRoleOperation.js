import { BaseOperation } from '../BaseOperation.js';
import { BusinessMemberRepository } from '../../../persistence/repositories/BusinessMemberRepository.js';
import { RoleRepository } from '../../../persistence/repositories/RoleRepository.js';
import { SecurityEventRepository } from '../../../persistence/repositories/SecurityEventRepository.js';
import { ValidationError } from '../../errors/index.js';
import { DomainEvent } from '../../../infrastructure/events/DomainEvent.js';

export class UpdateMemberRoleOperation extends BaseOperation {

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

    if (!input.roleId) {
      throw new ValidationError(
        'roleId is required.'
      );
    }
  }

  async perform(context, input, tx) {

    const {
      businessId,
      userId: actorId
    } = context;

    const {
      memberId,
      roleId
    } = input;

    const { ipAddress } = context.metadata;

    // Verify member exists in current tenant
    const member =
      await BusinessMemberRepository.findByBusinessAndId(
        businessId,
        memberId,
        tx
      );

    if (!member) {
      throw new ValidationError(
        'Member not found.'
      );
    }

    // Verify target role belongs to current tenant
    const role =
      await RoleRepository.findByIdAndBusiness(
        roleId,
        businessId,
        tx
      );

    if (!role) {
      throw new ValidationError(
        'Role not found.'
      );
    }

    // Protect system roles
    const memberHasSystemRole =
      await RoleRepository.memberHasSystemRole(
        member.id,
        tx
      );

    if (memberHasSystemRole) {
      throw new ValidationError(
        'System roles cannot be modified.'
      );
    }

    // Replace existing assignment
    await RoleRepository.replaceMemberRole(
      {
        businessMemberId: member.id,
        roleId: role.id,
        assignedBy: actorId
      },
      tx
    );

    // Audit
    await SecurityEventRepository.logEvent(
      {
        userId: actorId,
        eventType: 'MEMBER_ROLE_UPDATED',
        severity: 'MEDIUM',
        ipAddress,
        details: {
          businessId,
          memberId: member.id,
          roleId: role.id,
          roleName: role.name
        }
      },
      tx
    );

    return {
      success: true,
      memberId: member.id,
      roleId: role.id,
      roleName: role.name
    };
  }

  createEvents(context, result) {
    return [
      DomainEvent.create(
        'team.member_role_updated',
        {
          businessId: context.businessId,
          memberId: result.memberId,
          roleId: result.roleId,
          roleName: result.roleName
        },
        context
      )
    ];
  }

}