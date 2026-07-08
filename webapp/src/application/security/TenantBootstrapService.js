import { RoleRepository } from '../../persistence/repositories/RoleRepository.js';

export class TenantBootstrapService {
  static async bootstrap(businessId, memberId, assignedByUserId, tx) {
    // Fetch the global OWNER role (businessId = null)
    const ownerRole = await RoleRepository.findByNameAndBusiness('OWNER', null, tx);
    
    if (!ownerRole) {
      throw new Error('Global System Roles missing. Please seed the database.');
    }

    // Assign exactly 1 record to map the master role, scaling O(1).
    await RoleRepository.assignMemberRole({
      businessMemberId: memberId,
      roleId: ownerRole.id,
      assignedBy: assignedByUserId
    }, tx);
  }
}