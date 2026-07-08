import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  const { db } = await import('../src/db/index.js');
  const { RoleRepository } = await import('../src/persistence/repositories/RoleRepository.js');
  console.log('Seeding Global System Roles...');

  // 1. Provision the system roles with businessId = null
  const systemRoles = [
    { businessId: null, name: 'OWNER', description: 'Full administrative access', isSystem: true },
    { businessId: null, name: 'ADMIN', description: 'Can manage business settings and team', isSystem: true },
    { businessId: null, name: 'MANAGER', description: 'Can manage daily operations', isSystem: true },
    { businessId: null, name: 'STAFF', description: 'Standard operational access', isSystem: true },
    { businessId: null, name: 'VIEWER', description: 'Read-only access', isSystem: true }
  ];

  const createdRoles = await RoleRepository.createRoles(systemRoles);
  const allPermissions = await RoleRepository.getAllPermissions();

  if (allPermissions.length > 0) {
    const mappings = [];

    for (const role of createdRoles) {
      let rolePerms = [];

      switch (role.name) {
        case 'OWNER':
        case 'ADMIN':
          rolePerms = allPermissions;
          break;
        case 'MANAGER':
          rolePerms = allPermissions.filter(p => 
            !p.code.startsWith('system.') && 
            !p.code.startsWith('security.') &&
            !p.code.startsWith('billing.')
          );
          break;
        case 'STAFF':
          rolePerms = allPermissions.filter(p => 
            !p.code.includes('.delete') && 
            !p.code.startsWith('system.') &&
            !p.code.startsWith('settings.')
          );
          break;
        case 'VIEWER':
          rolePerms = allPermissions.filter(p => 
            p.code.includes('.read') || 
            p.code.includes('.view') || 
            p.code.includes('.list')
          );
          break;
      }

      rolePerms.forEach(p => {
        mappings.push({ roleId: role.id, permissionId: p.id });
      });
    }

    await RoleRepository.createRolePermissions(mappings);
  }

  console.log('Successfully seeded global roles and permissions!');
  process.exit(0);
}

run().catch(console.error);
