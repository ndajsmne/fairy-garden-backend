-- Check products table structure
DESCRIBE products;

-- Check if category_id column exists
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'products' AND TABLE_SCHEMA = DATABASE();

-- Try simple query
SELECT * FROM products LIMIT 1;
