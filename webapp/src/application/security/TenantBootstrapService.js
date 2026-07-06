import { RoleRepository } from '../../persistence/repositories/RoleRepository.js';

export class TenantBootstrapService {
  static async bootstrap(businessId, memberId, assignedByUserId, tx) {
    
    // 1. Provision the system roles
    const systemRoles = [
      { businessId, name: 'OWNER', description: 'Full administrative access', isSystem: true },
      { businessId, name: 'ADMIN', description: 'Can manage business settings and team', isSystem: true },
      { businessId, name: 'MANAGER', description: 'Can manage daily operations', isSystem: true },
      { businessId, name: 'STAFF', description: 'Standard operational access', isSystem: true },
      { businessId, name: 'VIEWER', description: 'Read-only access', isSystem: true }
    ];

    const createdRoles = await RoleRepository.createRoles(systemRoles, tx);
    const allPermissions = await RoleRepository.getAllPermissions(tx);

    if (allPermissions.length > 0) {
      const mappings = [];

      for (const role of createdRoles) {
        let rolePerms = [];

        switch (role.name) {
          case 'OWNER':
          case 'ADMIN':
            // OWNER and ADMIN get everything by default in V1
            rolePerms = allPermissions;
            break;
          case 'MANAGER':
            // Managers get everything except core system/billing/security actions
            rolePerms = allPermissions.filter(p => 
              !p.code.startsWith('system.') && 
              !p.code.startsWith('security.') &&
              !p.code.startsWith('billing.')
            );
            break;
          case 'STAFF':
            // Staff get operational access but no destructive actions or settings
            rolePerms = allPermissions.filter(p => 
              !p.code.includes('.delete') && 
              !p.code.startsWith('system.') &&
              !p.code.startsWith('settings.')
            );
            break;
          case 'VIEWER':
            // Viewers only get read/view permissions
            rolePerms = allPermissions.filter(p => 
              p.code.includes('.read') || 
              p.code.includes('.view') || 
              p.code.includes('.list')
            );
            break;
        }

        // Add to batch insert array
        rolePerms.forEach(p => {
          mappings.push({ roleId: role.id, permissionId: p.id });
        });
      }

      await RoleRepository.createRolePermissions(mappings, tx);
    }

    // 2. Assign the OWNER role to the creator
    const ownerRole = createdRoles.find(r => r.name === 'OWNER');
    await RoleRepository.assignMemberRole({
      businessMemberId: memberId,
      roleId: ownerRole.id,
      assignedBy: assignedByUserId
    }, tx);
  }
}