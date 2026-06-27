-- Migration to ensure proper SaaS multi-tenant isolation constraints

-- 1. Create a default business if it doesn't exist to populate legacy records
INSERT INTO businesses (id, business_name, gst_number, address, contact_number, email, business_type, subscription_plan, is_subscription_active, created_at)
SELECT 1, 'Default Business', '00AAAAA0000A1Z0', 'Kalamboli', '1234567890', 'info@defaultbusiness.com', 'Spare Parts Shop', 'TRIAL', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM businesses WHERE id = 1);

-- 2. Populate business_id for any null rows in tenant-specific tables to prevent constraint failures
UPDATE products SET business_id = 1 WHERE business_id IS NULL;
UPDATE customers SET business_id = 1 WHERE business_id IS NULL;
UPDATE bills SET business_id = 1 WHERE business_id IS NULL;
UPDATE payments SET business_id = 1 WHERE business_id IS NULL;
UPDATE purchases SET business_id = 1 WHERE business_id IS NULL;
UPDATE suppliers SET business_id = 1 WHERE business_id IS NULL;
UPDATE warranties SET business_id = 1 WHERE business_id IS NULL;
UPDATE emis SET business_id = 1 WHERE business_id IS NULL;
UPDATE users SET business_id = 1 WHERE business_id IS NULL AND role != 'SUPER_MANAGER';

-- 3. Set NOT NULL constraints on business_id where required
ALTER TABLE products ALTER COLUMN business_id SET NOT NULL;
ALTER TABLE customers ALTER COLUMN business_id SET NOT NULL;
ALTER TABLE bills ALTER COLUMN business_id SET NOT NULL;
ALTER TABLE payments ALTER COLUMN business_id SET NOT NULL;
ALTER TABLE purchases ALTER COLUMN business_id SET NOT NULL;
ALTER TABLE suppliers ALTER COLUMN business_id SET NOT NULL;
ALTER TABLE warranties ALTER COLUMN business_id SET NOT NULL;
ALTER TABLE emis ALTER COLUMN business_id SET NOT NULL;

-- 4. Create foreign key constraints (safely checking or adding)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_products_business') THEN
        ALTER TABLE products ADD CONSTRAINT fk_products_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_customers_business') THEN
        ALTER TABLE customers ADD CONSTRAINT fk_customers_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_bills_business') THEN
        ALTER TABLE bills ADD CONSTRAINT fk_bills_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_payments_business') THEN
        ALTER TABLE payments ADD CONSTRAINT fk_payments_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_purchases_business') THEN
        ALTER TABLE purchases ADD CONSTRAINT fk_purchases_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_suppliers_business') THEN
        ALTER TABLE suppliers ADD CONSTRAINT fk_suppliers_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_warranties_business') THEN
        ALTER TABLE warranties ADD CONSTRAINT fk_warranties_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_emis_business') THEN
        ALTER TABLE emis ADD CONSTRAINT fk_emis_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_users_business') THEN
        ALTER TABLE users ADD CONSTRAINT fk_users_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 5. Build indexes on business_id (indexes might already exist, so using CREATE INDEX IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_products_business_id ON products(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON customers(business_id);
CREATE INDEX IF NOT EXISTS idx_bills_business_id ON bills(business_id);
CREATE INDEX IF NOT EXISTS idx_purchases_business_id ON purchases(business_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_business_id ON suppliers(business_id);
CREATE INDEX IF NOT EXISTS idx_payments_business_id ON payments(business_id);
CREATE INDEX IF NOT EXISTS idx_emis_business_id ON emis(business_id);
CREATE INDEX IF NOT EXISTS idx_warranties_business_id ON warranties(business_id);
CREATE INDEX IF NOT EXISTS idx_feature_permissions_business_id ON feature_permissions(business_id);
CREATE INDEX IF NOT EXISTS idx_users_business_id ON users(business_id);
