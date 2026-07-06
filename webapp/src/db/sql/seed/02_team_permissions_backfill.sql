-- ==============================================================================
-- Backfill team permissions for existing installations.
-- Safe to run multiple times.
-- ==============================================================================

INSERT INTO permission (id, code, name, description) VALUES
(gen_random_uuid(), 'team.invite', 'Invite Team Members', 'Allow inviting users to a business team'),
(gen_random_uuid(), 'team.read', 'Read Team Members', 'Allow viewing business team members'),
(gen_random_uuid(), 'team.update_role', 'Update Team Roles', 'Allow changing team member roles'),
(gen_random_uuid(), 'team.remove', 'Remove Team Members', 'Allow removing users from a business team')
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permission (id, role_id, permission_id)
SELECT
  gen_random_uuid(),
  r.id,
  p.id
FROM role r
CROSS JOIN permission p
WHERE r.name IN ('OWNER', 'ADMIN')
  AND p.code IN (
    'team.invite',
    'team.read',
    'team.update_role',
    'team.remove'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;
