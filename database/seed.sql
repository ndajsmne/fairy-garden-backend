-- Sample seed data for testing
-- Run this after fairy_garden.sql to populate test data

-- Insert test users
INSERT INTO users (first_name, last_name, email, password, phone_number, role) VALUES
('Admin', 'User', 'admin@fairygarden.com', '$2b$10$YOUR_HASHED_PASSWORD', '081234567890', 'admin'),
('John', 'Doe', 'customer@example.com', '$2b$10$YOUR_HASHED_PASSWORD', '081234567891', 'customer');

-- Insert categories
INSERT INTO categories (name, slug) VALUES
('Birthday', 'birthday'),
('Mother''s Day', 'mothers-day'),
('Just Because', 'just-because'),
('Anniversary', 'anniversary'),
('Graduation', 'graduation');

-- Insert sample products
INSERT INTO products (name, slug, description, price, stock, image_url, category_id) VALUES
('Red Rose Bouquet', 'red-rose-bouquet', 'Beautiful bouquet of fresh red roses', 299000, 10, 'https://example.com/roses.jpg', 1),
('Sunflower Surprise', 'sunflower-surprise', 'Bright and cheerful sunflower arrangement', 249000, 15, 'https://example.com/sunflowers.jpg', 3),
('Pink Paradise', 'pink-paradise', 'Mixed pink flowers with baby''s breath', 349000, 8, 'https://example.com/pink.jpg', 2),
('Graduation Glory', 'graduation-glory', 'Elegant arrangement for graduation', 399000, 12, 'https://example.com/grad.jpg', 5),
('Anniversary Romance', 'anniversary-romance', 'Premium red and white roses', 499000, 5, 'https://example.com/anniversary.jpg', 4);

-- Insert sample order (paid, completed)
INSERT INTO orders (
    user_id, order_number, status, delivery_method, delivery_date, delivery_time,
    recipient_name, recipient_phone, sender_name, sender_phone,
    delivery_address, province, postal_code,
    card_message, card_from, card_to,
    subtotal, delivery_fee, handling_fee, total_amount,
    payment_method, payment_status
) VALUES (
    2, 'ORD-2025001', 'selesai', 'delivery', '2025-12-25', '14:00:00',
    'Jane Doe', '081234567892', 'John Doe', '081234567891',
    '123 Main Street', 'DKI Jakarta', '12345',
    'Happy Birthday!', 'John', 'Jane',
    299000, 20000, 5000, 324000,
    'qris', 'paid'
);

-- Insert order items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 299000);

-- Insert payment record
INSERT INTO payments (order_id, amount, status, transaction_id) VALUES
(1, 324000, 'completed', 'MIDTRANS-TEST-001');

-- Insert sample cart item
INSERT INTO cart_items (user_id, product_id, quantity) VALUES
(2, 2, 1);

-- Update product total_sold
UPDATE products SET total_sold = total_sold + 1 WHERE id = 1;