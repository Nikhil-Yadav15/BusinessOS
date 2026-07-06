-- ==============================================================================
-- Backfill Sales permissions for existing installations.
-- Safe to run multiple times.
-- ==============================================================================

INSERT INTO permission (id, code, name, description) VALUES
(gen_random_uuid(), 'sales.invoice.read', 'Read Invoices', 'Allow viewing sales invoices'),
(gen_random_uuid(), 'sales.invoice.write', 'Write Invoices', 'Allow creating and updating invoices'),
(gen_random_uuid(), 'sales.invoice.delete', 'Delete Invoices', 'Allow deleting or cancelling invoices'),
(gen_random_uuid(), 'sales.payment.read', 'Read Payments', 'Allow viewing payment receipts'),
(gen_random_uuid(), 'sales.payment.write', 'Record Payments', 'Allow manually recording payments received')
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permission (id, role_id, permission_id)
SELECT
  gen_random_uuid(),
  r.id,
  p.id
FROM role r
CROSS JOIN permission p
WHERE r.name IN ('OWNER', 'ADMIN', 'MANAGER', 'STAFF')
  AND p.code IN (
    'sales.invoice.read', 
    'sales.invoice.write',
    'sales.payment.read',
    'sales.payment.write'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Only managers and above can delete/cancel invoices
INSERT INTO role_permission (id, role_id, permission_id)
SELECT
  gen_random_uuid(),
  r.id,
  p.id
FROM role r
CROSS JOIN permission p
WHERE r.name IN ('OWNER', 'ADMIN', 'MANAGER')
  AND p.code = 'sales.invoice.delete'
ON CONFLICT (role_id, permission_id) DO NOTHING;
