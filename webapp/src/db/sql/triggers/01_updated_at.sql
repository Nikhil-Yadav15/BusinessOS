-- Create the universal trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to Identity Tables
CREATE TRIGGER update_user_updated_at
    BEFORE UPDATE ON "user"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply to Business Tables
CREATE TRIGGER update_business_updated_at
    BEFORE UPDATE ON business
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply to Sales Tables
CREATE TRIGGER update_invoice_updated_at
    BEFORE UPDATE ON invoice
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- (Note: You will apply this trigger mapping to every mutable table in the schema 
-- that includes an updated_at column).