-- ==============================================================================
-- 1. Setter: Binds the execution context to the current database transaction
-- ==============================================================================
CREATE OR REPLACE FUNCTION set_execution_context(
    p_user_id UUID,
    p_session_id UUID,
    p_business_id UUID,
    p_business_member_id UUID
) RETURNS VOID AS $$
BEGIN
    -- 'true' makes these settings local to the current transaction
    PERFORM set_config('atlas.current_user_id', p_user_id::TEXT, true);
    PERFORM set_config('atlas.current_session_id', p_session_id::TEXT, true);
    PERFORM set_config('atlas.current_business_id', p_business_id::TEXT, true);
    PERFORM set_config('atlas.current_business_member_id', p_business_member_id::TEXT, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==============================================================================
-- 2. Getters: Used by RLS Policies to evaluate permissions dynamically
-- ==============================================================================

-- Get Active Business ID
CREATE OR REPLACE FUNCTION current_business() RETURNS UUID AS $$
DECLARE
    bus_id TEXT;
BEGIN
    bus_id := current_setting('atlas.current_business_id', true);
    IF bus_id = '' OR bus_id IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN bus_id::UUID;
EXCEPTION
    WHEN undefined_object THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get Active User ID
CREATE OR REPLACE FUNCTION current_user_id() RETURNS UUID AS $$
DECLARE
    usr_id TEXT;
BEGIN
    usr_id := current_setting('atlas.current_user_id', true);
    IF usr_id = '' OR usr_id IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN usr_id::UUID;
EXCEPTION
    WHEN undefined_object THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get Active Session ID
CREATE OR REPLACE FUNCTION current_session_id() RETURNS UUID AS $$
DECLARE
    sess_id TEXT;
BEGIN
    sess_id := current_setting('atlas.current_session_id', true);
    IF sess_id = '' OR sess_id IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN sess_id::UUID;
EXCEPTION
    WHEN undefined_object THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get Active Business Member ID
CREATE OR REPLACE FUNCTION current_member_id() RETURNS UUID AS $$
DECLARE
    mem_id TEXT;
BEGIN
    mem_id := current_setting('atlas.current_business_member_id', true);
    IF mem_id = '' OR mem_id IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN mem_id::UUID;
EXCEPTION
    WHEN undefined_object THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;