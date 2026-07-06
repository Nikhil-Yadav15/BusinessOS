-- ==============================================================================
-- Backfill CRM permissions for existing installations.
-- Safe to run multiple times.
-- ==============================================================================

INSERT INTO permission (id, code, name, description) VALUES
(gen_random_uuid(), 'crm.party.read', 'Read CRM Parties', 'Allow viewing parties (customers/suppliers)'),
(gen_random_uuid(), 'crm.party.write', 'Write CRM Parties', 'Allow creating and updating parties'),
(gen_random_uuid(), 'crm.party.delete', 'Delete CRM Parties', 'Allow deleting parties')
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permission (id, role_id, permission_id)
SELECT
  gen_random_uuid(),
  r.id,
  p.id
FROM role r
CROSS JOIN permission p
WHERE r.name IN ('OWNER', 'ADMIN', 'MANAGER')
  AND p.code IN (
    'crm.party.read',
    'crm.party.write',
    'crm.party.delete'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;
