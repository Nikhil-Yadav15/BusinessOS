-- ==============================================================================
-- 1. System Settings
-- ==============================================================================
INSERT INTO system_setting (key, value, description) VALUES
('maintenance_mode', 'false', 'Is the platform currently down for maintenance?'),
('max_login_attempts', '5', 'Number of failed logins before account lockout'),
('jwt_expiry_hours', '24', 'Default expiration time for access tokens'),
('default_currency', 'INR', 'Default currency for new businesses')
ON CONFLICT (key) DO NOTHING;

-- ==============================================================================
-- 2. Feature Flags
-- ==============================================================================
INSERT INTO feature_flag (id, feature_name, is_enabled, description) VALUES
(gen_random_uuid(), 'ai_enabled', true, 'Enable AI conversational features'),
(gen_random_uuid(), 'whatsapp_integration', false, 'Enable WhatsApp notification delivery'),
(gen_random_uuid(), 'workflow_engine', true, 'Enable automated business workflows')
ON CONFLICT (feature_name) DO NOTHING;

-- ==============================================================================
-- 3. Global Permissions (The Atlas Permission Catalog)
-- ==============================================================================
INSERT INTO permission (id, code, name, description) VALUES
(gen_random_uuid(), 'sales.create_invoice', 'Create Invoice', 'Allow creating new sales invoices'),
(gen_random_uuid(), 'sales.receive_payment', 'Receive Payment', 'Allow receiving payments against invoices'),
(gen_random_uuid(), 'inventory.adjust_stock', 'Adjust Stock', 'Allow manual inventory adjustments'),
(gen_random_uuid(), 'catalog.manage_products', 'Manage Products', 'Allow creating and updating products'),
(gen_random_uuid(), 'ledger.view_reports', 'View Financials', 'Allow viewing P&L and Balance Sheet')
ON CONFLICT (code) DO NOTHING;

-- ==============================================================================
-- 4. Analytics Snapshot Types
-- ==============================================================================
INSERT INTO analytics_snapshot_type (id, code, name, refresh_strategy, is_active) VALUES
(gen_random_uuid(), 'BUSINESS_SUMMARY', 'Business Summary', 'EVENT', true),
(gen_random_uuid(), 'SALES_SUMMARY', 'Sales Summary', 'EVENT', true),
(gen_random_uuid(), 'INVENTORY_SUMMARY', 'Inventory Summary', 'EVENT', true),
(gen_random_uuid(), 'FINANCIAL_SUMMARY', 'Financial Summary', 'EVENT', true)
ON CONFLICT (code) DO NOTHING;