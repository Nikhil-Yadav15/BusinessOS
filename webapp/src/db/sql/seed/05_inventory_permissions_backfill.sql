-- ==============================================================================
-- Backfill Inventory permissions for existing installations.
-- Safe to run multiple times.
-- ==============================================================================

INSERT INTO permission (id, code, name, description) VALUES
(gen_random_uuid(), 'inventory.read', 'Read Inventory', 'Allow viewing product stock levels'),
(gen_random_uuid(), 'inventory.adjust', 'Adjust Inventory', 'Allow manual stock movement / ledger entries')
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
    'inventory.read', 
    'inventory.adjust'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;
