-- ==============================================================================
-- 1. USER-OWNED DATA (Identity Module)
-- Rule: Users can only access their own identity records.
-- Applies to: "user", session, device, otp
-- ==============================================================================

ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user" FORCE ROW LEVEL SECURITY;
CREATE POLICY user_isolation_policy ON "user"
    FOR ALL TO atlas_app, atlas_service
    USING (id = current_user_id());

ALTER TABLE session ENABLE ROW LEVEL SECURITY;
ALTER TABLE session FORCE ROW LEVEL SECURITY;
CREATE POLICY session_isolation_policy ON session
    FOR ALL TO atlas_app, atlas_service
    USING (user_id = current_user_id());

-- ==============================================================================
-- 2. BUSINESS-OWNED DATA (Core Operations)
-- Rule: Access is strictly isolated to the currently active business_id.
-- Applies to: invoice, party, product, purchase, inventory, etc.
-- ==============================================================================

-- Example: Invoices
ALTER TABLE invoice ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice FORCE ROW LEVEL SECURITY;
CREATE POLICY invoice_business_isolation ON invoice
    FOR ALL TO atlas_app, atlas_service
    USING (business_id = current_business())
    WITH CHECK (business_id = current_business());

-- Example: Products
ALTER TABLE product ENABLE ROW LEVEL SECURITY;
ALTER TABLE product FORCE ROW LEVEL SECURITY;
CREATE POLICY product_business_isolation ON product
    FOR ALL TO atlas_app, atlas_service
    USING (business_id = current_business())
    WITH CHECK (business_id = current_business());

-- Example: Parties (CRM)
ALTER TABLE party ENABLE ROW LEVEL SECURITY;
ALTER TABLE party FORCE ROW LEVEL SECURITY;
CREATE POLICY party_business_isolation ON party
    FOR ALL TO atlas_app, atlas_service
    USING (business_id = current_business())
    WITH CHECK (business_id = current_business());

-- (Note: You will apply this exact same block to ALL business-owned tables: 
-- purchase, ledger_account, journal_entry, expense, workflow, ai_memory, etc.)

-- ==============================================================================
-- 3. SYSTEM-OWNED DATA (Infrastructure & Audit)
-- Rule: Application users cannot query these directly. Only internal services.
-- Applies to: event, event_outbox, audit_log, background_job
-- ==============================================================================

ALTER TABLE event_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_outbox FORCE ROW LEVEL SECURITY;
-- Notice we ONLY grant this to atlas_service, not atlas_app
CREATE POLICY outbox_service_policy ON event_outbox
    FOR ALL TO atlas_service
    USING (true); 

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log FORCE ROW LEVEL SECURITY;
CREATE POLICY audit_service_policy ON audit_log
    FOR ALL TO atlas_service
    USING (true);

-- ==============================================================================
-- 4. PLATFORM-OWNED DATA (Global Config)
-- Rule: Shared across all businesses. Readable by apps, writable only by migrations.
-- Applies to: permission, feature_flag, system_setting
-- ==============================================================================

ALTER TABLE permission ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission FORCE ROW LEVEL SECURITY;
CREATE POLICY permission_read_policy ON permission
    FOR SELECT TO atlas_app, atlas_service
    USING (true); -- Everyone can read permissions, nobody can write them at runtime