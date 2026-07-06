-- ==============================================================================
-- Backfill Ledger permissions for existing installations.
-- Safe to run multiple times.
-- ==============================================================================

INSERT INTO permission (id, code, name, description) VALUES
(gen_random_uuid(), 'ledger.account.read', 'Read Chart of Accounts', 'Allow viewing the Chart of Accounts'),
(gen_random_uuid(), 'ledger.account.write', 'Write Chart of Accounts', 'Allow creating and updating Ledger Accounts'),
(gen_random_uuid(), 'ledger.journal.read', 'Read Journal Entries', 'Allow viewing Journal Entries and General Ledger'),
(gen_random_uuid(), 'ledger.journal.write', 'Write Journal Entries', 'Allow executing manual double-entry Journals')
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permission (id, role_id, permission_id)
SELECT
  gen_random_uuid(),
  r.id,
  p.id
FROM role r
CROSS JOIN permission p
WHERE r.name IN ('OWNER', 'ADMIN', 'MANAGER') -- Staff typically cannot perform manual Journal Entries
  AND p.code IN (
    'ledger.account.read', 
    'ledger.account.write',
    'ledger.journal.read',
    'ledger.journal.write'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;
