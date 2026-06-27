-- Migration to add Multi-Branch support in Stock Pilot 2.0

-- 1. Create branches table
CREATE TABLE IF NOT EXISTS branches (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    contact_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_branches_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- 2. Populate default branch (id = 1) for the default business (id = 1)
INSERT INTO branches (id, business_id, name, address, contact_number, created_at)
SELECT 1, 1, 'Main Branch', 'Kalamboli', '1234567890', NOW()
WHERE NOT EXISTS (SELECT 1 FROM branches WHERE id = 1);

-- 3. Add branch_id columns to all tenant-scoped tables
ALTER TABLE products ADD COLUMN IF NOT EXISTS branch_id BIGINT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS branch_id BIGINT;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS branch_id BIGINT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS branch_id BIGINT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS branch_id BIGINT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS branch_id BIGINT;
ALTER TABLE warranties ADD COLUMN IF NOT EXISTS branch_id BIGINT;
ALTER TABLE emis ADD COLUMN IF NOT EXISTS branch_id BIGINT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS branch_id BIGINT;

-- 4. Update existing records to link to Default Branch (id = 1)
UPDATE products SET branch_id = 1 WHERE branch_id IS NULL;
UPDATE customers SET branch_id = 1 WHERE branch_id IS NULL;
UPDATE bills SET branch_id = 1 WHERE branch_id IS NULL;
UPDATE purchases SET branch_id = 1 WHERE branch_id IS NULL;
UPDATE suppliers SET branch_id = 1 WHERE branch_id IS NULL;
UPDATE payments SET branch_id = 1 WHERE branch_id IS NULL;
UPDATE warranties SET branch_id = 1 WHERE branch_id IS NULL;
UPDATE emis SET branch_id = 1 WHERE branch_id IS NULL;
UPDATE users SET branch_id = 1 WHERE branch_id IS NULL AND role != 'SUPER_MANAGER';

-- 5. Add foreign key constraints safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_products_branch') THEN
        ALTER TABLE products ADD CONSTRAINT fk_products_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_customers_branch') THEN
        ALTER TABLE customers ADD CONSTRAINT fk_customers_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_bills_branch') THEN
        ALTER TABLE bills ADD CONSTRAINT fk_bills_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_purchases_branch') THEN
        ALTER TABLE purchases ADD CONSTRAINT fk_purchases_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_suppliers_branch') THEN
        ALTER TABLE suppliers ADD CONSTRAINT fk_suppliers_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_payments_branch') THEN
        ALTER TABLE payments ADD CONSTRAINT fk_payments_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_warranties_branch') THEN
        ALTER TABLE warranties ADD CONSTRAINT fk_warranties_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_emis_branch') THEN
        ALTER TABLE emis ADD CONSTRAINT fk_emis_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_users_branch') THEN
        ALTER TABLE users ADD CONSTRAINT fk_users_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 6. Create indexes for performance tuning
CREATE INDEX IF NOT EXISTS idx_products_branch_id ON products(branch_id);
CREATE INDEX IF NOT EXISTS idx_customers_branch_id ON customers(branch_id);
CREATE INDEX IF NOT EXISTS idx_bills_branch_id ON bills(branch_id);
CREATE INDEX IF NOT EXISTS idx_purchases_branch_id ON purchases(branch_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_branch_id ON suppliers(branch_id);
CREATE INDEX IF NOT EXISTS idx_payments_branch_id ON payments(branch_id);
CREATE INDEX IF NOT EXISTS idx_emis_branch_id ON emis(branch_id);
CREATE INDEX IF NOT EXISTS idx_warranties_branch_id ON warranties(branch_id);
CREATE INDEX IF NOT EXISTS idx_users_branch_id ON users(branch_id);
