-- ==============================================================================
-- Backfill Catalog permissions for existing installations.
-- Safe to run multiple times.
-- ==============================================================================

INSERT INTO permission (id, code, name, description) VALUES
-- Categories
(gen_random_uuid(), 'catalog.category.read', 'Read Categories', 'Allow viewing product categories'),
(gen_random_uuid(), 'catalog.category.write', 'Write Categories', 'Allow creating and updating categories'),
(gen_random_uuid(), 'catalog.category.delete', 'Delete Categories', 'Allow deleting categories'),
-- Brands
(gen_random_uuid(), 'catalog.brand.read', 'Read Brands', 'Allow viewing product brands'),
(gen_random_uuid(), 'catalog.brand.write', 'Write Brands', 'Allow creating and updating brands'),
(gen_random_uuid(), 'catalog.brand.delete', 'Delete Brands', 'Allow deleting brands'),
-- Units
(gen_random_uuid(), 'catalog.unit.read', 'Read Units', 'Allow viewing measurement units'),
(gen_random_uuid(), 'catalog.unit.write', 'Write Units', 'Allow creating and updating units'),
(gen_random_uuid(), 'catalog.unit.delete', 'Delete Units', 'Allow deleting units'),
-- Products
(gen_random_uuid(), 'catalog.product.read', 'Read Products', 'Allow viewing products'),
(gen_random_uuid(), 'catalog.product.write', 'Write Products', 'Allow creating and updating products'),
(gen_random_uuid(), 'catalog.product.delete', 'Delete Products', 'Allow deleting products')
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
    'catalog.category.read', 'catalog.category.write', 'catalog.category.delete',
    'catalog.brand.read', 'catalog.brand.write', 'catalog.brand.delete',
    'catalog.unit.read', 'catalog.unit.write', 'catalog.unit.delete',
    'catalog.product.read', 'catalog.product.write', 'catalog.product.delete'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;
