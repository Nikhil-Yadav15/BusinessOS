DO $$
BEGIN
    -- 1. Application Role
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'atlas_app') THEN
        CREATE ROLE atlas_app WITH LOGIN PASSWORD 'atlas_app_dev';
    END IF;

    -- 2. Service Role
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'atlas_service') THEN
        CREATE ROLE atlas_service WITH LOGIN PASSWORD 'atlas_service_dev';
    END IF;

    -- 3. Admin Role
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'atlas_admin') THEN
        CREATE ROLE atlas_admin WITH LOGIN PASSWORD 'atlas_admin_dev';
    END IF;

    -- 4. Migration Role
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'atlas_migration') THEN
        CREATE ROLE atlas_migration WITH LOGIN PASSWORD 'atlas_migration_dev' CREATEROLE;
    END IF;
END
$$;

-- Grant schema usage to runtime roles
GRANT USAGE ON SCHEMA public TO atlas_app, atlas_service, atlas_admin;