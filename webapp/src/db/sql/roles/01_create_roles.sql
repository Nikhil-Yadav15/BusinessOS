-- 1. Application Role: Handles normal HTTP requests subject to RLS
CREATE ROLE atlas_app WITH LOGIN PASSWORD 'atlas_app_dev';

-- 2. Service Role: Handles background jobs, AI, and workflows subject to RLS
CREATE ROLE atlas_service WITH LOGIN PASSWORD 'atlas_service_dev';

-- 3. Admin Role: Performs cross-tenant administrative tasks
CREATE ROLE atlas_admin WITH LOGIN PASSWORD 'atlas_admin_dev';

-- 4. Migration Role: Manages schema changes, indexes, and RLS definitions
CREATE ROLE atlas_migration WITH LOGIN PASSWORD 'atlas_migration_dev' CREATEROLE;

-- Grant schema usage to runtime roles
GRANT USAGE ON SCHEMA public TO atlas_app, atlas_service, atlas_admin;