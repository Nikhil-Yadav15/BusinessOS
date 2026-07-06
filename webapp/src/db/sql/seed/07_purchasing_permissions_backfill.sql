-- ==============================================================================
-- Backfill Purchasing permissions for existing installations.
-- Safe to run multiple times.
-- ==============================================================================

INSERT INTO permission (id, code, name, description) VALUES
(gen_random_uuid(), 'purchasing.purchase.read', 'Read Purchases', 'Allow viewing purchase orders and invoices'),
(gen_random_uuid(), 'purchasing.purchase.write', 'Write Purchases', 'Allow creating and updating purchase records'),
(gen_random_uuid(), 'purchasing.purchase.delete', 'Delete Purchases', 'Allow deleting or cancelling purchase records'),
(gen_random_uuid(), 'purchasing.payment.read', 'Read Supplier Payments', 'Allow viewing supplier payment records'),
(gen_random_uuid(), 'purchasing.payment.write', 'Record Supplier Payments', 'Allow manually recording payments made to suppliers')
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
    'purchasing.purchase.read', 
    'purchasing.purchase.write',
    'purchasing.payment.read',
    'purchasing.payment.write'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Only managers and above can delete/cancel purchases
INSERT INTO role_permission (id, role_id, permission_id)
SELECT
  gen_random_uuid(),
  r.id,
  p.id
FROM role r
CROSS JOIN permission p
WHERE r.name IN ('OWNER', 'ADMIN', 'MANAGER')
  AND p.code = 'purchasing.purchase.delete'
ON CONFLICT (role_id, permission_id) DO NOTHING;
