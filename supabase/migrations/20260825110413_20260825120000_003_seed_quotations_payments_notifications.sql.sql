-- Seed quotations, payments, notifications, conversations, and additional portfolio items

-- ============ QUOTATIONS ============
INSERT INTO quotations (custom_order_id, price, fabric_cost, estimated_completion_date, delivery_estimate, notes, status) VALUES
('b0000000-0000-4000-8000-000000000004', 120000, 25000, '2026-09-05', '5-7 days after payment', 'I can create this dress with premium lace fabric. The beading will take extra time but will be worth it.', 'pending');

-- ============ PAYMENTS ============
INSERT INTO payments (custom_order_id, customer_id, amount, method, status, reference) VALUES
('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 55000, 'card', 'success', 'ref_001'),
('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000017', 35000, 'bank_transfer', 'success', 'ref_002'),
('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000020', 28000, 'card', 'success', 'ref_006'),
('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 45000, 'card', 'success', 'ref_005');

-- ============ ADDITIONAL PORTFOLIO ITEMS ============
INSERT INTO portfolio_items (tailor_id, image_url, title, sort_order) VALUES
('ce0a44c0-1ba8-4bf1-8526-572d3b4724dc', 'https://images.pexels.com/photos/38250931/pexels-photo-38250931.jpeg?auto=compress&cs=tinysrgb&w=600', 'Black Senator', 4),
('9fa0a7ac-fdf4-47ad-969f-c168c664b26c', 'https://images.pexels.com/photos/38250931/pexels-photo-38250931.jpeg?auto=compress&cs=tinysrgb&w=600', 'Evening Wear', 4),
('e1942e88-fa3f-4e14-960d-c18a06df63c0', 'https://images.pexels.com/photos/20009925/pexels-photo-20009925.jpeg?auto=compress&cs=tinysrgb&w=600', 'Traditional Wear', 4),
('117c2798-c048-430b-ada9-f22a5d482110', 'https://images.pexels.com/photos/38250931/pexels-photo-38250931.jpeg?auto=compress&cs=tinysrgb&w=600', 'Ceremonial Dress', 4),
('8ebc9646-21c9-47cf-b177-752817de2658', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600', 'Office Senator', 3),
('1f51a407-523b-494c-b0a0-b91996488594', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600', 'Birthday Style', 3),
('0ebe2a7d-e8c5-4579-b270-4814039bd035', 'https://images.pexels.com/photos/38250931/pexels-photo-38250931.jpeg?auto=compress&cs=tinysrgb&w=600', 'Ceremonial Agbada', 3);

-- ============ NOTIFICATIONS ============
INSERT INTO notifications (user_id, type, title, body, data, is_read) VALUES
('a0000000-0000-4000-8000-000000000001', 'order_update', 'Your order is now in cutting', 'Your Senator order has entered the cutting stage.', '{"custom_order_id":"b0000000-0000-4000-8000-000000000001"}', false),
('a0000000-0000-4000-8000-000000000001', 'order_completed', 'Order completed', 'Your Shirt order has been completed. Please leave a review.', '{"custom_order_id":"b0000000-0000-4000-8000-000000000005"}', true),
('a0000000-0000-4000-8000-000000000017', 'order_update', 'Your order is now in sewing', 'Your Dress order has entered the sewing stage.', '{"custom_order_id":"b0000000-0000-4000-8000-000000000002"}', false),
('a0000000-0000-4000-8000-000000000019', 'quotation_ready', 'Your quotation is ready', 'Amara Couture has sent a quotation for your Dress order.', '{"custom_order_id":"b0000000-0000-4000-8000-000000000004"}', false),
('a0000000-0000-4000-8000-000000000018', 'order_received', 'Order request sent', 'Your Agbada request has been sent to Kunle Atelier.', '{"custom_order_id":"b0000000-0000-4000-8000-000000000003"}', true),
('a0000000-0000-4000-8000-000000000020', 'order_completed', 'Order completed', 'Your Kaftan order has been completed. Please leave a review.', '{"custom_order_id":"b0000000-0000-4000-8000-000000000006"}', false),
('a0000000-0000-4000-8000-000000000002', 'new_order', 'New custom order', 'You received a new Senator custom order request.', '{"custom_order_id":"b0000000-0000-4000-8000-000000000001"}', true),
('a0000000-0000-4000-8000-000000000003', 'new_order', 'New custom order', 'You received a new Dress custom order request.', '{"custom_order_id":"b0000000-0000-4000-8000-000000000002"}', false),
('a0000000-0000-4000-8000-000000000013', 'new_order', 'New custom order', 'You received a new Dress custom order request.', '{"custom_order_id":"b0000000-0000-4000-8000-000000000004"}', true);

-- ============ ORDER STATUS HISTORY ============
INSERT INTO order_status_history (custom_order_id, status, note) VALUES
('b0000000-0000-4000-8000-000000000001', 'requested', 'Order request submitted'),
('b0000000-0000-4000-8000-000000000001', 'quoted', 'Quotation sent by tailor'),
('b0000000-0000-4000-8000-000000000001', 'accepted', 'Customer accepted quotation'),
('b0000000-0000-4000-8000-000000000001', 'paid', 'Payment confirmed'),
('b0000000-0000-4000-8000-000000000001', 'measurements_confirmed', 'Measurements confirmed'),
('b0000000-0000-4000-8000-000000000001', 'fabric_confirmed', 'Fabric confirmed'),
('b0000000-0000-4000-8000-000000000001', 'cutting', 'Order entered cutting stage'),
('b0000000-0000-4000-8000-000000000002', 'requested', 'Order request submitted'),
('b0000000-0000-4000-8000-000000000002', 'quoted', 'Quotation sent by tailor'),
('b0000000-0000-4000-8000-000000000002', 'accepted', 'Customer accepted quotation'),
('b0000000-0000-4000-8000-000000000002', 'paid', 'Payment confirmed'),
('b0000000-0000-4000-8000-000000000002', 'measurements_confirmed', 'Measurements confirmed'),
('b0000000-0000-4000-8000-000000000002', 'fabric_confirmed', 'Fabric confirmed'),
('b0000000-0000-4000-8000-000000000002', 'cutting', 'Order entered cutting stage'),
('b0000000-0000-4000-8000-000000000002', 'sewing', 'Order entered sewing stage'),
('b0000000-0000-4000-8000-000000000005', 'requested', 'Order request submitted'),
('b0000000-0000-4000-8000-000000000005', 'quoted', 'Quotation sent by tailor'),
('b0000000-0000-4000-8000-000000000005', 'accepted', 'Customer accepted quotation'),
('b0000000-0000-4000-8000-000000000005', 'paid', 'Payment confirmed'),
('b0000000-0000-4000-8000-000000000005', 'completed', 'Order completed'),
('b0000000-0000-4000-8000-000000000006', 'requested', 'Order request submitted'),
('b0000000-0000-4000-8000-000000000006', 'quoted', 'Quotation sent by tailor'),
('b0000000-0000-4000-8000-000000000006', 'accepted', 'Customer accepted quotation'),
('b0000000-0000-4000-8000-000000000006', 'paid', 'Payment confirmed'),
('b0000000-0000-4000-8000-000000000006', 'completed', 'Order completed'),
('b0000000-0000-4000-8000-000000000004', 'requested', 'Order request submitted'),
('b0000000-0000-4000-8000-000000000004', 'quoted', 'Quotation sent by tailor');

-- ============ CONVERSATIONS & MESSAGES ============
INSERT INTO conversations (id, customer_id, tailor_id, custom_order_id) VALUES
('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001'),
('c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000017', 'a0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002'),
('c0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000019', 'a0000000-0000-4000-8000-000000000013', 'b0000000-0000-4000-8000-000000000004');

INSERT INTO messages (conversation_id, sender_id, body) VALUES
('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Hi Ade, I would like a navy blue senator with subtle gold embroidery on the collar.'),
('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'Hello! That sounds great. I can definitely do that. What is your budget range?'),
('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Around 50-60k. When can you deliver?'),
('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'I can deliver within 10 days after payment. Let me send you a quotation.'),
('c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000017', 'Hi Ngozi, I love your portfolio. I need a dress for a wedding.'),
('c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000003', 'Thank you! What style are you thinking? I can work with ankara or lace.'),
('c0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000019', 'Hi Amara, I received your quotation. The price is a bit high, can we discuss?'),
('c0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000013', 'Hello! The beading work is quite detailed which takes time. I can offer a small discount if you provide the fabric.');

UPDATE conversations SET last_message_at = now();
