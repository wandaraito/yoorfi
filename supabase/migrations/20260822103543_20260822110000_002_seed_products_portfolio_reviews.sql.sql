-- Seed products, portfolio items, and reviews for demo data

-- ============ PORTFOLIO ITEMS (50+) ============
INSERT INTO portfolio_items (tailor_id, image_url, title, sort_order) VALUES
-- Tailor 1: Ade Couture (Senator/Agbada)
('ce0a44c0-1ba8-4bf1-8526-572d3b4724dc', 'https://images.pexels.com/photos/35677043/pexels-photo-35677043.jpeg?auto=compress&cs=tinysrgb&w=600', 'Royal Blue Senator', 0),
('ce0a44c0-1ba8-4bf1-8526-572d3b4724dc', 'https://images.pexels.com/photos/20009925/pexels-photo-20009925.jpeg?auto=compress&cs=tinysrgb&w=600', 'Gold Embroidered Agbada', 1),
('ce0a44c0-1ba8-4bf1-8526-572d3b4724dc', 'https://images.pexels.com/photos/38250931/pexels-photo-38250931.jpeg?auto=compress&cs=tinysrgb&w=600', 'White Kaftan Senator', 2),
('ce0a44c0-1ba8-4bf1-8526-572d3b4724dc', 'https://images.pexels.com/photos/37283114/pexels-photo-37283114.jpeg?auto=compress&cs=tinysrgb&w=600', 'Navy Senator Set', 3),

-- Tailor 2: Nkechi Fashion (Dresses/Women)
('9fa0a7ac-fdf4-47ad-969f-c168c664b26c', 'https://images.pexels.com/photos/9849641/pexels-photo-9849641.jpeg?auto=compress&cs=tinysrgb&w=600', 'Ankara Maxi Dress', 0),
('9fa0a7ac-fdf4-47ad-969f-c168c664b26c', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600', 'Lace Evening Gown', 1),
('9fa0a7ac-fdf4-47ad-969f-c168c664b26c', 'https://images.pexels.com/photos/2703181/pexels-photo-2703181.jpeg?auto=compress&cs=tinysrgb&w=600', 'Printed Wrap Dress', 2),
('9fa0a7ac-fdf4-47ad-969f-c168c664b26c', 'https://images.pexels.com/photos/2065200/pexels-photo-2065200.jpeg?auto=compress&cs=tinysrgb&w=600', 'Native Print Two-piece', 3),

-- Tailor 3: Tunde Styles (Shirts/Trousers/Men)
('e1942e88-fa3f-4e14-960d-c18a06df63c0', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600', 'Slim Fit Oxford Shirt', 0),
('e1942e88-fa3f-4e14-960d-c18a06df63c0', 'https://images.pexels.com/photos/1666071/pexels-photo-1666071.jpeg?auto=compress&cs=tinysrgb&w=600', 'Tailored Chinos', 1),
('e1942e88-fa3f-4e14-960d-c18a06df63c0', 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=600', 'Linen Shirt', 2),
('e1942e88-fa3f-4e14-960d-c18a06df63c0', 'https://images.pexels.com/photos/2897531/pexels-photo-2897531.jpeg?auto=compress&cs=tinysrgb&w=600', 'Classic White Shirt', 3),

-- Tailor 4: Zainab Couture (Dresses/Kaftan/Women)
('117c2798-c048-430b-ada9-f22a5d482110', 'https://images.pexels.com/photos/2703181/pexels-photo-2703181.jpeg?auto=compress&cs=tinysrgb&w=600', 'Silk Kaftan Dress', 0),
('117c2798-c048-430b-ada9-f22a5d482110', 'https://images.pexels.com/photos/2065200/pexels-photo-2065200.jpeg?auto=compress&cs=tinysrgb&w=600', 'Floral Kaftan', 1),
('117c2798-c048-430b-ada9-f22a5d482110', 'https://images.pexels.com/photos/9849641/pexels-photo-9849641.jpeg?auto=compress&cs=tinysrgb&w=600', 'Beaded Evening Dress', 2),
('117c2798-c048-430b-ada9-f22a5d482110', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600', 'Native Print Dress', 3),

-- Tailor 5: Emeka Tailors (Senator/Agbada/Shirts)
('8ebc9646-21c9-47cf-b177-752817de2658', 'https://images.pexels.com/photos/35677043/pexels-photo-35677043.jpeg?auto=compress&cs=tinysrgb&w=600', 'Embroidered Senator', 0),
('8ebc9646-21c9-47cf-b177-752817de2658', 'https://images.pexels.com/photos/20009925/pexels-photo-20009925.jpeg?auto=compress&cs=tinysrgb&w=600', 'Three-piece Agbada', 1),
('8ebc9646-21c9-47cf-b177-752817de2658', 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=600', 'Cotton Senator', 2),

-- Tailor 6: Halima Designs (Kaftan/Women/Dresses)
('1f51a407-523b-494c-b0a0-b91996488594', 'https://images.pexels.com/photos/2703181/pexels-photo-2703181.jpeg?auto=compress&cs=tinysrgb&w=600', 'Elegant Kaftan', 0),
('1f51a407-523b-494c-b0a0-b91996488594', 'https://images.pexels.com/photos/9849641/pexels-photo-9849641.jpeg?auto=compress&cs=tinysrgb&w=600', 'Wedding Guest Dress', 1),
('1f51a407-523b-494c-b0a0-b91996488594', 'https://images.pexels.com/photos/2065200/pexels-photo-2065200.jpeg?auto=compress&cs=tinysrgb&w=600', 'Printed Native Dress', 2),

-- Tailor 7: Yusuf Atelier (Agbada/Senator/Men)
('0ebe2a7d-e8c5-4579-b270-4814039bd035', 'https://images.pexels.com/photos/20009925/pexels-photo-20009925.jpeg?auto=compress&cs=tinysrgb&w=600', 'Grand Agbada', 0),
('0ebe2a7d-e8c5-4579-b270-4814039bd035', 'https://images.pexels.com/photos/35677043/pexels-photo-35677043.jpeg?auto=compress&cs=tinysrgb&w=600', 'Royal Senator', 1),
('0ebe2a7d-e8c5-4579-b270-4814039bd035', 'https://images.pexels.com/photos/37283114/pexels-photo-37283114.jpeg?auto=compress&cs=tinysrgb&w=600', 'Classic Agbada', 2),

-- Tailor 8: Aisha Couture (Kaftan/Dresses/Women)
('d22a7158-bc8c-47a5-b08c-e50c3fc8a5a1', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600', 'Lace Kaftan', 0),
('d22a7158-bc8c-47a5-b08c-e50c3fc8a5a1', 'https://images.pexels.com/photos/2703181/pexels-photo-2703181.jpeg?auto=compress&cs=tinysrgb&w=600', 'Beaded Dress', 1),
('d22a7158-bc8c-47a5-b08c-e50c3fc8a5a1', 'https://images.pexels.com/photos/2065200/pexels-photo-2065200.jpeg?auto=compress&cs=tinysrgb&w=600', 'Ankara Gown', 2),

-- Tailor 9: Kingsley Wear (Shirts/Trousers/Men)
('9d31cd80-4dfc-4d62-9f8c-078effa43f2a', 'https://images.pexels.com/photos/1666071/pexels-photo-1666071.jpeg?auto=compress&cs=tinysrgb&w=600', 'Office Shirt', 0),
('9d31cd80-4dfc-4d62-9f8c-078effa43f2a', 'https://images.pexels.com/photos/2897531/pexels-photo-2897531.jpeg?auto=compress&cs=tinysrgb&w=600', 'Casual Shirt', 1),
('9d31cd80-4dfc-4d62-9f8c-078effa43f2a', 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=600', 'Formal Trousers', 2),

-- Tailor 10: Folake Fashion (Dresses/Women)
('44f254ce-0f54-4b76-8334-a88a5b1dd825', 'https://images.pexels.com/photos/9849641/pexels-photo-9849641.jpeg?auto=compress&cs=tinysrgb&w=600', 'Cocktail Dress', 0),
('44f254ce-0f54-4b76-8334-a88a5b1dd825', 'https://images.pexels.com/photos/2065200/pexels-photo-2065200.jpeg?auto=compress&cs=tinysrgb&w=600', 'Native Print Dress', 1),
('44f254ce-0f54-4b76-8334-a88a5b1dd825', 'https://images.pexels.com/photos/2703181/pexels-photo-2703181.jpeg?auto=compress&cs=tinysrgb&w=600', 'Evening Gown', 2),

-- Tailor 11: Mohammed Classic (Agbada/Kaftan/Men)
('9193d3fc-5acc-4128-ab1b-f2edc3921ee9', 'https://images.pexels.com/photos/20009925/pexels-photo-20009925.jpeg?auto=compress&cs=tinysrgb&w=600', 'Wedding Agbada', 0),
('9193d3fc-5acc-4128-ab1b-f2edc3921ee9', 'https://images.pexels.com/photos/35677043/pexels-photo-35677043.jpeg?auto=compress&cs=tinysrgb&w=600', 'Classic Kaftan', 1),

-- Tailor 12: Yetunde Styles (Dresses/Women)
('fb4a09bd-3632-4e28-8498-10d78e588245', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600', 'Birthday Dress', 0),
('fb4a09bd-3632-4e28-8498-10d78e588245', 'https://images.pexels.com/photos/9849641/pexels-photo-9849641.jpeg?auto=compress&cs=tinysrgb&w=600', 'Native Style', 1),

-- Tailor 13: Dami Couture (Shirts/Dresses/Ready to Wear)
('8950758f-4aef-47c7-b28a-42ea18e19376', 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=600', 'Ready-to-Wear Shirt', 0),
('8950758f-4aef-47c7-b28a-42ea18e19376', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600', 'Casual Dress', 1),

-- Tailor 14: Rabi Fashion (Kaftan/Dresses/Women)
('f692828d-325a-40bc-ac92-c395036b3baa', 'https://images.pexels.com/photos/2703181/pexels-photo-2703181.jpeg?auto=compress&cs=tinysrgb&w=600', 'Silk Kaftan', 0),
('f692828d-325a-40bc-ac92-c395036b3baa', 'https://images.pexels.com/photos/2065200/pexels-photo-2065200.jpeg?auto=compress&cs=tinysrgb&w=600', 'Native Dress', 1),

-- Tailor 15: Chidi Wear (Shirts/Trousers/Dresses/Ready to Wear)
('c40846ac-c7f8-472c-807c-9a6068fc752f', 'https://images.pexels.com/photos/1666071/pexels-photo-1666071.jpeg?auto=compress&cs=tinysrgb&w=600', 'Polo Shirt', 0),
('c40846ac-c7f8-472c-807c-9a6068fc752f', 'https://images.pexels.com/photos/2897531/pexels-photo-2897531.jpeg?auto=compress&cs=tinysrgb&w=600', 'Denim Trousers', 1),
('c40846ac-c7f8-472c-807c-9a6068fc752f', 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=600', 'Office Wear', 2),
('c40846ac-c7f8-472c-807c-9a6068fc752f', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600', 'Summer Dress', 3);

-- ============ PRODUCTS (30+) ============
INSERT INTO products (tailor_id, name, description, price, compare_at_price, images, sizes, colors, stock, is_active) VALUES
-- Tailor 1
('ce0a44c0-1ba8-4bf1-8526-572d3b4724dc', 'Royal Blue Senator Set', 'Premium senator outfit with gold embroidery. Includes top and trousers.', 65000, 80000, ARRAY['https://images.pexels.com/photos/35677043/pexels-photo-35677043.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['M','L','XL'], ARRAY['Blue','Black'], 5, true),
('ce0a44c0-1ba8-4bf1-8526-572d3b4724dc', 'Gold Embroidered Agbada', 'Three-piece agbada with intricate gold embroidery. Perfect for weddings.', 95000, NULL, ARRAY['https://images.pexels.com/photos/20009925/pexels-photo-20009925.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['M','L','XL','XXL'], ARRAY['White','Cream'], 3, true),

-- Tailor 2
('9fa0a7ac-fdf4-47ad-969f-c168c664b26c', 'Ankara Maxi Dress', 'Vibrant ankara print maxi dress. Comfortable and stylish.', 28000, 35000, ARRAY['https://images.pexels.com/photos/9849641/pexels-photo-9849641.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['S','M','L','XL'], ARRAY['Multi','Blue'], 8, true),
('9fa0a7ac-fdf4-47ad-969f-c168c664b26c', 'Lace Evening Gown', 'Elegant lace evening gown for special occasions.', 55000, NULL, ARRAY['https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['S','M','L'], ARRAY['Black','Burgundy'], 4, true),
('9fa0a7ac-fdf4-47ad-969f-c168c664b26c', 'Printed Wrap Dress', 'Versatile wrap dress in bold African print.', 22000, 28000, ARRAY['https://images.pexels.com/photos/2703181/pexels-photo-2703181.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['S','M','L','XL'], ARRAY['Yellow','Green'], 10, true),

-- Tailor 3
('e1942e88-fa3f-4e14-960d-c18a06df63c0', 'Slim Fit Oxford Shirt', 'Classic oxford cotton shirt. Perfect for office and casual wear.', 18000, NULL, ARRAY['https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['S','M','L','XL','XXL'], ARRAY['White','Blue','Pink'], 15, true),
('e1942e88-fa3f-4e14-960d-c18a06df63c0', 'Tailored Chinos', 'Slim-fit chinos in premium cotton twill.', 25000, 32000, ARRAY['https://images.pexels.com/photos/1666071/pexels-photo-1666071.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['30','32','34','36','38'], ARRAY['Khaki','Navy','Black'], 12, true),
('e1942e88-fa3f-4e14-960d-c18a06df63c0', 'Linen Casual Shirt', 'Breathable linen shirt for warm weather.', 20000, NULL, ARRAY['https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['S','M','L','XL'], ARRAY['White','Beige','Olive'], 8, true),

-- Tailor 4
('117c2798-c048-430b-ada9-f22a5d482110', 'Silk Kaftan Dress', 'Flowing silk kaftan with delicate beadwork.', 42000, NULL, ARRAY['https://images.pexels.com/photos/2703181/pexels-photo-2703181.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['S','M','L','XL'], ARRAY['Teal','Maroon'], 6, true),
('117c2798-c048-430b-ada9-f22a5d482110', 'Floral Kaftan Gown', 'Beautiful floral print kaftan gown.', 32000, 40000, ARRAY['https://images.pexels.com/photos/2065200/pexels-photo-2065200.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['S','M','L'], ARRAY['Multi'], 7, true),

-- Tailor 5
('8ebc9646-21c9-47cf-b177-752817de2658', 'Embroidered Senator', 'Premium senator with custom embroidery options.', 55000, NULL, ARRAY['https://images.pexels.com/photos/35677043/pexels-photo-35677043.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['M','L','XL','XXL'], ARRAY['Navy','Black','Grey'], 5, true),
('8ebc9646-21c9-47cf-b177-752817de2658', 'Three-piece Agbada', 'Complete agbada set with matching cap.', 85000, 100000, ARRAY['https://images.pexels.com/photos/20009925/pexels-photo-20009925.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['M','L','XL'], ARRAY['White','Cream','Brown'], 3, true),

-- Tailor 6
('1f51a407-523b-494c-b0a0-b91996488594', 'Elegant Kaftan', 'Soft fabric kaftan with elegant drape.', 35000, NULL, ARRAY['https://images.pexels.com/photos/2703181/pexels-photo-2703181.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['S','M','L','XL'], ARRAY['Purple','Blue','Green'], 6, true),
('1f51a407-523b-494c-b0a0-b91996488594', 'Wedding Guest Dress', 'Show-stopping dress for special events.', 48000, NULL, ARRAY['https://images.pexels.com/photos/9849641/pexels-photo-9849641.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['S','M','L'], ARRAY['Gold','Rose'], 4, true),

-- Tailor 7
('0ebe2a7d-e8c5-4579-b270-4814039bd035', 'Grand Agbada', 'Luxurious grand agbada for special occasions.', 110000, NULL, ARRAY['https://images.pexels.com/photos/20009925/pexels-photo-20009925.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['M','L','XL'], ARRAY['White','Cream'], 2, true),
('0ebe2a7d-e8c5-4579-b270-4814039bd035', 'Royal Senator', 'Classic senator outfit in premium fabric.', 60000, 75000, ARRAY['https://images.pexels.com/photos/35677043/pexels-photo-35677043.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['M','L','XL','XXL'], ARRAY['Blue','Black'], 4, true),

-- Tailor 8
('d22a7158-bc8c-47a5-b08c-e50c3fc8a5a1', 'Lace Kaftan', 'Delicate lace kaftan for elegant occasions.', 38000, NULL, ARRAY['https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['S','M','L','XL'], ARRAY['White','Black'], 5, true),
('d22a7158-bc8c-47a5-b08c-e50c3fc8a5a1', 'Ankara Gown', 'Stylish ankara print gown.', 26000, 32000, ARRAY['https://images.pexels.com/photos/2065200/pexels-photo-2065200.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['S','M','L','XL'], ARRAY['Multi'], 9, true),

-- Tailor 9
('9d31cd80-4dfc-4d62-9f8c-078effa43f2a', 'Office Shirt', 'Crisp office shirt in premium cotton.', 15000, NULL, ARRAY['https://images.pexels.com/photos/1666071/pexels-photo-1666071.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['S','M','L','XL','XXL'], ARRAY['White','Blue','Grey'], 20, true),
('9d31cd80-4dfc-4d62-9f8c-078effa43f2a', 'Casual Shirt', 'Relaxed fit casual shirt for everyday wear.', 16000, 20000, ARRAY['https://images.pexels.com/photos/2897531/pexels-photo-2897531.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['S','M','L','XL'], ARRAY['Olive','Navy','Burgundy'], 14, true),

-- Tailor 10
('44f254ce-0f54-4b76-8334-a88a5b1dd825', 'Cocktail Dress', 'Sleek cocktail dress for evening events.', 38000, NULL, ARRAY['https://images.pexels.com/photos/9849641/pexels-photo-9849641.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['S','M','L'], ARRAY['Black','Red'], 5, true),
('44f254ce-0f54-4b76-8334-a88a5b1dd825', 'Native Print Dress', 'Bold native print dress.', 24000, 30000, ARRAY['https://images.pexels.com/photos/2065200/pexels-photo-2065200.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['S','M','L','XL'], ARRAY['Multi','Yellow'], 8, true),

-- Tailor 11
('9193d3fc-5acc-4128-ab1b-f2edc3921ee9', 'Wedding Agbada', 'Premium wedding agbada with matching accessories.', 120000, NULL, ARRAY['https://images.pexels.com/photos/20009925/pexels-photo-20009925.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['M','L','XL'], ARRAY['White','Gold'], 2, true),
('9193d3fc-5acc-4128-ab1b-f2edc3921ee9', 'Classic Kaftan', 'Comfortable everyday kaftan.', 30000, 38000, ARRAY['https://images.pexels.com/photos/35677043/pexels-photo-35677043.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['M','L','XL','XXL'], ARRAY['Grey','Navy'], 6, true),

-- Tailor 12
('fb4a09bd-3632-4e28-8498-10d78e588245', 'Birthday Dress', 'Eye-catching birthday celebration dress.', 32000, NULL, ARRAY['https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['S','M','L'], ARRAY['Rose','Gold'], 4, true),

-- Tailor 13
('8950758f-4aef-47c7-b28a-42ea18e19376', 'Ready-to-Wear Shirt', 'Off-the-rack premium shirt. No waiting required.', 17000, 22000, ARRAY['https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['S','M','L','XL','XXL'], ARRAY['White','Blue','Black'], 25, true),
('8950758f-4aef-47c7-b28a-42ea18e19376', 'Casual Dress', 'Easy-wear casual dress in soft fabric.', 21000, NULL, ARRAY['https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['S','M','L','XL'], ARRAY['Blue','Green'], 12, true),

-- Tailor 14
('f692828d-325a-40bc-ac92-c395036b3baa', 'Silk Kaftan', 'Luxurious silk kaftan with subtle sheen.', 40000, NULL, ARRAY['https://images.pexels.com/photos/2703181/pexels-photo-2703181.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['S','M','L','XL'], ARRAY['Emerald','Plum'], 5, true),

-- Tailor 15
('c40846ac-c7f8-472c-807c-9a6068fc752f', 'Polo Shirt', 'Classic polo shirt for casual outings.', 12000, 15000, ARRAY['https://images.pexels.com/photos/1666071/pexels-photo-1666071.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['S','M','L','XL','XXL'], ARRAY['Navy','White','Green','Black'], 30, true),
('c40846ac-c7f8-472c-807c-9a6068fc752f', 'Denim Trousers', 'Durable denim trousers in classic cuts.', 18000, NULL, ARRAY['https://images.pexels.com/photos/2897531/pexels-photo-2897531.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['30','32','34','36','38'], ARRAY['Blue','Black'], 18, true),
('c40846ac-c7f8-472c-807c-9a6068fc752f', 'Summer Dress', 'Light and breezy summer dress.', 16000, 20000, ARRAY['https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['S','M','L','XL'], ARRAY['Yellow','Pink','White'], 15, true),
('c40846ac-c7f8-472c-807c-9a6068fc752f', 'Office Wear Set', 'Complete office wear set. Shirt and trousers.', 30000, NULL, ARRAY['https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=600'], ARRAY['S','M','L','XL'], ARRAY['Grey','Navy'], 8, true);

-- ============ REVIEWS (20) ============
INSERT INTO reviews (customer_id, tailor_id, rating, comment) VALUES
('a0000000-0000-4000-8000-000000000001', 'ce0a44c0-1ba8-4bf1-8526-572d3b4724dc', 5, 'Absolutely amazing work! My senator fit perfectly and the embroidery was stunning. Will definitely order again.'),
('a0000000-0000-4000-8000-000000000017', 'ce0a44c0-1ba8-4bf1-8526-572d3b4724dc', 4, 'Great quality and fast delivery. The agbada was beautiful, just needed minor adjustments on the sleeves.'),
('a0000000-0000-4000-8000-000000000018', '9fa0a7ac-fdf4-47ad-969f-c168c664b26c', 5, 'My lace gown was a showstopper at the wedding. Nkechi understood exactly what I wanted. Highly recommend!'),
('a0000000-0000-4000-8000-000000000019', '9fa0a7ac-fdf4-47ad-969f-c168c664b26c', 5, 'The ankara print dress was vibrant and well-tailored. Perfect fit and great customer service.'),
('a0000000-0000-4000-8000-000000000020', 'e1942e88-fa3f-4e14-960d-c18a06df63c0', 4, 'Good shirts, quality fabric. Delivery took a bit longer than expected but the work was excellent.'),
('a0000000-0000-4000-8000-000000000001', 'e1942e88-fa3f-4e14-960d-c18a06df63c0', 5, 'Best tailor for shirts in Lagos. The fit is always perfect and the fabric quality is top notch.'),
('a0000000-0000-4000-8000-000000000017', '117c2798-c048-430b-ada9-f22a5d482110', 5, 'Zainab made me the most beautiful kaftan dress. The beadwork was incredible. Thank you!'),
('a0000000-0000-4000-8000-000000000018', '117c2798-c048-430b-ada9-f22a5d482110', 4, 'Lovely dress, good quality. Would have liked more color options but the work was great.'),
('a0000000-0000-4000-8000-000000000019', '8ebc9646-21c9-47cf-b177-752817de2658', 5, 'Emeka is a master at agbada. The embroidery was exactly as I described. Very professional.'),
('a0000000-0000-4000-8000-000000000020', '1f51a407-523b-494c-b0a0-b91996488594', 5, 'My wedding guest dress was perfect. Halima has an amazing eye for detail. Highly recommend!'),
('a0000000-0000-4000-8000-000000000001', '0ebe2a7d-e8c5-4579-b270-4814039bd035', 4, 'Good agbada, well made. Took a week longer than promised but the quality made up for it.'),
('a0000000-0000-4000-8000-000000000017', 'd22a7158-bc8c-47a5-b08c-e50c3fc8a5a1', 5, 'The lace kaftan was breathtaking. Aisha is truly talented. I received so many compliments.'),
('a0000000-0000-4000-8000-000000000018', '9d31cd80-4dfc-4d62-9f8c-078effa43f2a', 4, 'Solid office shirts. Good fit and nice fabric selection. Will order again.'),
('a0000000-0000-4000-8000-000000000019', '44f254ce-0f54-4b76-8334-a88a5b1dd825', 5, 'Folake made me the perfect cocktail dress. The attention to detail was incredible. So happy!'),
('a0000000-0000-4000-8000-000000000020', '9193d3fc-5acc-4128-ab1b-f2edc3921ee9', 5, 'The wedding agbada was beyond my expectations. Mohammed is a true craftsman. Worth every naira.'),
('a0000000-0000-4000-8000-000000000001', 'fb4a09bd-3632-4e28-8498-10d78e588245', 4, 'Beautiful birthday dress. Yetunde was very patient with my requests. Great experience overall.'),
('a0000000-0000-4000-8000-000000000017', '8950758f-4aef-47c7-b28a-42ea18e19376', 5, 'Love the ready-to-wear shirts! Quick delivery and excellent quality. My go-to for casual shirts now.'),
('a0000000-0000-4000-8000-000000000018', 'f692828d-325a-40bc-ac92-c395036b3baa', 4, 'The silk kaftan was beautiful and soft. Good communication throughout the process.'),
('a0000000-0000-4000-8000-000000000019', 'c40846ac-c7f8-472c-807c-9a6068fc752f', 5, 'Great polo shirts at a good price. The fit is consistent and the fabric holds up well after washing.'),
('a0000000-0000-4000-8000-000000000020', 'c40846ac-c7f8-472c-807c-9a6068fc752f', 4, 'Good denim trousers. Nice cut and durable. Would have liked more size options but satisfied.');

-- ============ UPDATE TAILOR RATINGS ============
UPDATE tailor_profiles tp SET
  rating = sub.avg_rating,
  completed_orders = sub.review_count
FROM (
  SELECT tailor_id, AVG(rating) as avg_rating, COUNT(*) as review_count
  FROM reviews
  GROUP BY tailor_id
) sub
WHERE tp.id = sub.tailor_id;

-- Also set completed_orders to at least the review count + some
UPDATE tailor_profiles SET completed_orders = GREATEST(completed_orders, 5) WHERE completed_orders = 0;
