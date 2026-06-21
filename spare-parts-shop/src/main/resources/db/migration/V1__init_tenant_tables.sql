-- Ensure all tables have business_id column with proper constraints

-- Add indexes on business_id for better query performance
CREATE INDEX IF NOT EXISTS idx_products_business_id ON products(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON customers(business_id);
CREATE INDEX IF NOT EXISTS idx_bills_business_id ON bills(business_id);
CREATE INDEX IF NOT EXISTS idx_bill_items_business_id ON bill_items(bill_id);
CREATE INDEX IF NOT EXISTS idx_purchases_business_id ON purchases(business_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_business_id ON purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_business_id ON suppliers(business_id);
CREATE INDEX IF NOT EXISTS idx_payments_business_id ON payments(business_id);
CREATE INDEX IF NOT EXISTS idx_emis_business_id ON emis(business_id);
CREATE INDEX IF NOT EXISTS idx_warranties_business_id ON warranties(business_id);
CREATE INDEX IF NOT EXISTS idx_feature_permissions_business_id ON feature_permissions(business_id);
CREATE INDEX IF NOT EXISTS idx_users_business_id ON users(business_id);

-- Ensure existing data (if any) has business_id populated
-- For existing records without business_id, you may need to assign a default business
-- ALTER TABLE products ALTER COLUMN business_id SET NOT NULL;
-- ALTER TABLE customers ALTER COLUMN business_id SET NOT NULL;
-- ALTER TABLE bills ALTER COLUMN business_id SET NOT NULL;
-- ALTER TABLE purchases ALTER COLUMN business_id SET NOT NULL;
-- ALTER TABLE suppliers ALTER COLUMN business_id SET NOT NULL;
-- ALTER TABLE payments ALTER COLUMN business_id SET NOT NULL;
