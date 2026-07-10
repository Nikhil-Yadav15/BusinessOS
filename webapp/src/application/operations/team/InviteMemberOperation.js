import { BaseOperation } from '../BaseOperation.js';
import { UserRepository } from '../../../persistence/repositories/UserRepository.js';
import { BusinessMemberRepository } from '../../../persistence/repositories/BusinessMemberRepository.js';
import { RoleRepository } from '../../../persistence/repositories/RoleRepository.js';
import { SecurityEventRepository } from '../../../persistence/repositories/SecurityEventRepository.js';
import { ValidationError } from '../../errors/index.js';
import { DomainEvent } from '../../../infrastructure/events/DomainEvent.js';
import { notifications } from '../../../db/schema/notification.js';
import { generateId } from '../../../infrastructure/id/uuid.js';

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

    // 5.5 Send Email Invite to new staff member via Notifications Queue
    await tx.insert(notifications).values({
      id: generateId(),
      businessId,
      recipientType: 'USER',
      recipientId: userToInvite.id,
      channel: 'EMAIL',
      title: 'You have been invited to Atlas BusinessOS',
      message: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
         <h2 style="color:#0f172a;margin-bottom:8px;">Welcome to Atlas BusinessOS</h2>
         <p style="color:#475569;font-size:14px;">You have been invited to join a business as <strong>${role.name}</strong>.</p>
         <p style="color:#94a3b8;font-size:12px;margin-top:24px;">Log in to the Atlas BusinessOS dashboard using this email to accept your role.</p>
       </div>`,
      status: 'PENDING'
    });

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