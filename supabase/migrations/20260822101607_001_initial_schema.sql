/*
# yoorfit — Fashion Marketplace Initial Schema (retry)

Fixes a typo in the previous attempt: "CREATE POLICY IF EXISTS" → "DROP POLICY IF EXISTS".
Idempotent — safe to re-run.
*/

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'tailor', 'admin')),
  full_name text NOT NULL DEFAULT '',
  phone text,
  avatar_url text,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_profiles" ON profiles;
CREATE POLICY "select_profiles" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ TAILOR PROFILES ============
CREATE TABLE IF NOT EXISTS tailor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tailor_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  bio text,
  specialties text[] DEFAULT '{}',
  years_experience int DEFAULT 0,
  starting_price numeric DEFAULT 0,
  avg_delivery_days int DEFAULT 7,
  verification_status text NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended')),
  rating numeric DEFAULT 0,
  completed_orders int DEFAULT 0,
  cancellation_rate numeric DEFAULT 0,
  avg_delivery_time numeric DEFAULT 0,
  is_featured boolean DEFAULT false,
  cover_image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE tailor_profiles ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_tailor_profiles_verification ON tailor_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_tailor_profiles_featured ON tailor_profiles(is_featured);
CREATE INDEX IF NOT EXISTS idx_tailor_profiles_rating ON tailor_profiles(rating DESC);

DROP POLICY IF EXISTS "select_tailor_profiles" ON tailor_profiles;
CREATE POLICY "select_tailor_profiles" ON tailor_profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_tailor_profile" ON tailor_profiles;
CREATE POLICY "insert_own_tailor_profile" ON tailor_profiles FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = tailor_id AND p.user_id = auth.uid() AND p.role = 'tailor')
  );

DROP POLICY IF EXISTS "update_own_tailor_profile" ON tailor_profiles;
CREATE POLICY "update_own_tailor_profile" ON tailor_profiles FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = tailor_id AND p.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = tailor_id AND p.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_update_tailor_profiles" ON tailor_profiles;
CREATE POLICY "admin_update_tailor_profiles" ON tailor_profiles FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')
  );

-- ============ CATEGORIES ============
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  type text NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'ready_to_wear', 'custom')),
  icon text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_categories" ON categories;
CREATE POLICY "select_categories" ON categories FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories" ON categories FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories" ON categories FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')
  );

-- ============ PORTFOLIO ITEMS ============
CREATE TABLE IF NOT EXISTS portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tailor_id uuid NOT NULL REFERENCES tailor_profiles(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  title text,
  description text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_portfolio_tailor ON portfolio_items(tailor_id);

DROP POLICY IF EXISTS "select_portfolio" ON portfolio_items;
CREATE POLICY "select_portfolio" ON portfolio_items FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_portfolio" ON portfolio_items;
CREATE POLICY "insert_own_portfolio" ON portfolio_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM tailor_profiles tp
      JOIN profiles p ON p.id = tp.tailor_id
      WHERE tp.id = portfolio_items.tailor_id AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_portfolio" ON portfolio_items;
CREATE POLICY "update_own_portfolio" ON portfolio_items FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM tailor_profiles tp
      JOIN profiles p ON p.id = tp.tailor_id
      WHERE tp.id = portfolio_items.tailor_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tailor_profiles tp
      JOIN profiles p ON p.id = tp.tailor_id
      WHERE tp.id = portfolio_items.tailor_id AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_portfolio" ON portfolio_items;
CREATE POLICY "delete_own_portfolio" ON portfolio_items FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM tailor_profiles tp
      JOIN profiles p ON p.id = tp.tailor_id
      WHERE tp.id = portfolio_items.tailor_id AND p.user_id = auth.uid()
    )
  );

-- ============ PRODUCTS ============
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tailor_id uuid NOT NULL REFERENCES tailor_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  compare_at_price numeric,
  images text[] NOT NULL DEFAULT '{}',
  sizes text[] DEFAULT '{}',
  colors text[] DEFAULT '{}',
  stock int DEFAULT 0,
  category_id uuid REFERENCES categories(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_products_tailor ON products(tailor_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

DROP POLICY IF EXISTS "select_products" ON products;
CREATE POLICY "select_products" ON products FOR SELECT
  TO authenticated USING (is_active = true OR EXISTS (
    SELECT 1 FROM tailor_profiles tp JOIN profiles p ON p.id = tp.tailor_id
    WHERE tp.id = products.tailor_id AND p.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "insert_own_products" ON products;
CREATE POLICY "insert_own_products" ON products FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM tailor_profiles tp
      JOIN profiles p ON p.id = tp.tailor_id
      WHERE tp.id = products.tailor_id AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_products" ON products;
CREATE POLICY "update_own_products" ON products FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM tailor_profiles tp
      JOIN profiles p ON p.id = tp.tailor_id
      WHERE tp.id = products.tailor_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tailor_profiles tp
      JOIN profiles p ON p.id = tp.tailor_id
      WHERE tp.id = products.tailor_id AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_products" ON products;
CREATE POLICY "delete_own_products" ON products FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM tailor_profiles tp
      JOIN profiles p ON p.id = tp.tailor_id
      WHERE tp.id = products.tailor_id AND p.user_id = auth.uid()
    )
  );

-- ============ SERVICES ============
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tailor_id uuid NOT NULL REFERENCES tailor_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  base_price numeric NOT NULL DEFAULT 0,
  turnaround_days int DEFAULT 7,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_services_tailor ON services(tailor_id);

DROP POLICY IF EXISTS "select_services" ON services;
CREATE POLICY "select_services" ON services FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_services" ON services;
CREATE POLICY "insert_own_services" ON services FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM tailor_profiles tp
      JOIN profiles p ON p.id = tp.tailor_id
      WHERE tp.id = services.tailor_id AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_services" ON services;
CREATE POLICY "update_own_services" ON services FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM tailor_profiles tp
      JOIN profiles p ON p.id = tp.tailor_id
      WHERE tp.id = services.tailor_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tailor_profiles tp
      JOIN profiles p ON p.id = tp.tailor_id
      WHERE tp.id = services.tailor_id AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_services" ON services;
CREATE POLICY "delete_own_services" ON services FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM tailor_profiles tp
      JOIN profiles p ON p.id = tp.tailor_id
      WHERE tp.id = services.tailor_id AND p.user_id = auth.uid()
    )
  );

-- ============ MEASUREMENT PROFILES ============
CREATE TABLE IF NOT EXISTS measurement_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  measurements jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE measurement_profiles ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_measurements_user ON measurement_profiles(user_id);

DROP POLICY IF EXISTS "select_own_measurements" ON measurement_profiles;
CREATE POLICY "select_own_measurements" ON measurement_profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_measurements" ON measurement_profiles;
CREATE POLICY "insert_own_measurements" ON measurement_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_measurements" ON measurement_profiles;
CREATE POLICY "update_own_measurements" ON measurement_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_measurements" ON measurement_profiles;
CREATE POLICY "delete_own_measurements" ON measurement_profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ ADDRESSES ============
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  label text,
  recipient_name text,
  phone text,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

DROP POLICY IF EXISTS "select_own_addresses" ON addresses;
CREATE POLICY "select_own_addresses" ON addresses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_addresses" ON addresses;
CREATE POLICY "insert_own_addresses" ON addresses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_addresses" ON addresses;
CREATE POLICY "update_own_addresses" ON addresses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_addresses" ON addresses;
CREATE POLICY "delete_own_addresses" ON addresses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ CUSTOM ORDERS ============
CREATE TABLE IF NOT EXISTS custom_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  tailor_id uuid NOT NULL REFERENCES tailor_profiles(id) ON DELETE CASCADE,
  clothing_type text NOT NULL,
  inspiration_images text[] DEFAULT '{}',
  notes text,
  fabric_option text DEFAULT 'tailor_provides' CHECK (fabric_option IN ('customer_provides', 'tailor_provides')),
  fabric_preference text,
  measurement_profile_id uuid REFERENCES measurement_profiles(id) ON DELETE SET NULL,
  manual_measurements jsonb,
  needs_measurement_assistance boolean DEFAULT false,
  preferences jsonb DEFAULT '{}',
  budget_min numeric,
  budget_max numeric,
  status text NOT NULL DEFAULT 'requested' CHECK (status IN (
    'requested', 'quoted', 'accepted', 'payment_pending', 'paid',
    'measurements_confirmed', 'fabric_confirmed', 'cutting', 'sewing',
    'quality_check', 'ready_for_dispatch', 'dispatched', 'delivered',
    'completed', 'cancelled', 'disputed'
  )),
  final_price numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE custom_orders ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_custom_orders_customer ON custom_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_custom_orders_tailor ON custom_orders(tailor_id);
CREATE INDEX IF NOT EXISTS idx_custom_orders_status ON custom_orders(status);

DROP POLICY IF EXISTS "select_custom_orders" ON custom_orders;
CREATE POLICY "select_custom_orders" ON custom_orders FOR SELECT
  TO authenticated USING (
    auth.uid() = customer_id OR EXISTS (
      SELECT 1 FROM tailor_profiles tp JOIN profiles p ON p.id = tp.tailor_id
      WHERE tp.id = custom_orders.tailor_id AND p.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "insert_custom_orders" ON custom_orders;
CREATE POLICY "insert_custom_orders" ON custom_orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "update_custom_orders" ON custom_orders;
CREATE POLICY "update_custom_orders" ON custom_orders FOR UPDATE
  TO authenticated USING (
    auth.uid() = customer_id OR EXISTS (
      SELECT 1 FROM tailor_profiles tp JOIN profiles p ON p.id = tp.tailor_id
      WHERE tp.id = custom_orders.tailor_id AND p.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = customer_id OR EXISTS (
      SELECT 1 FROM tailor_profiles tp JOIN profiles p ON p.id = tp.tailor_id
      WHERE tp.id = custom_orders.tailor_id AND p.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============ QUOTATIONS ============
CREATE TABLE IF NOT EXISTS quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_order_id uuid NOT NULL REFERENCES custom_orders(id) ON DELETE CASCADE,
  price numeric NOT NULL,
  fabric_cost numeric DEFAULT 0,
  estimated_completion_date date,
  delivery_estimate text,
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'revision_requested')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_quotations_order ON quotations(custom_order_id);

DROP POLICY IF EXISTS "select_quotations" ON quotations;
CREATE POLICY "select_quotations" ON quotations FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM custom_orders co WHERE co.id = quotations.custom_order_id AND co.customer_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM custom_orders co
      JOIN tailor_profiles tp ON tp.id = co.tailor_id
      JOIN profiles p ON p.id = tp.tailor_id
      WHERE co.id = quotations.custom_order_id AND p.user_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "insert_quotations" ON quotations;
CREATE POLICY "insert_quotations" ON quotations FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM custom_orders co
      JOIN tailor_profiles tp ON tp.id = co.tailor_id
      JOIN profiles p ON p.id = tp.tailor_id
      WHERE co.id = quotations.custom_order_id AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_quotations" ON quotations;
CREATE POLICY "update_quotations" ON quotations FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM custom_orders co WHERE co.id = quotations.custom_order_id AND co.customer_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM custom_orders co
      JOIN tailor_profiles tp ON tp.id = co.tailor_id
      JOIN profiles p ON p.id = tp.tailor_id
      WHERE co.id = quotations.custom_order_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM custom_orders co WHERE co.id = quotations.custom_order_id AND co.customer_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM custom_orders co
      JOIN tailor_profiles tp ON tp.id = co.tailor_id
      JOIN profiles p ON p.id = tp.tailor_id
      WHERE co.id = quotations.custom_order_id AND p.user_id = auth.uid()
    )
  );

-- ============ ORDERS ============
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  tailor_id uuid REFERENCES tailor_profiles(id) ON DELETE SET NULL,
  custom_order_id uuid REFERENCES custom_orders(id) ON DELETE SET NULL,
  order_type text NOT NULL CHECK (order_type IN ('custom', 'ready_to_wear')),
  total numeric NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'ready_for_dispatch', 'dispatched', 'delivered',
    'completed', 'cancelled', 'disputed'
  )),
  shipping_address jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_tailor ON orders(tailor_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

DROP POLICY IF EXISTS "select_orders" ON orders;
CREATE POLICY "select_orders" ON orders FOR SELECT
  TO authenticated USING (
    auth.uid() = customer_id OR EXISTS (
      SELECT 1 FROM tailor_profiles tp JOIN profiles p ON p.id = tp.tailor_id
      WHERE tp.id = orders.tailor_id AND p.user_id = auth.uid()
    ) OR EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "insert_orders" ON orders;
CREATE POLICY "insert_orders" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "update_orders" ON orders;
CREATE POLICY "update_orders" ON orders FOR UPDATE
  TO authenticated USING (
    auth.uid() = customer_id OR EXISTS (
      SELECT 1 FROM tailor_profiles tp JOIN profiles p ON p.id = tp.tailor_id
      WHERE tp.id = orders.tailor_id AND p.user_id = auth.uid()
    ) OR EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    auth.uid() = customer_id OR EXISTS (
      SELECT 1 FROM tailor_profiles tp JOIN profiles p ON p.id = tp.tailor_id
      WHERE tp.id = orders.tailor_id AND p.user_id = auth.uid()
    ) OR EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')
  );

-- ============ ORDER ITEMS ============
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  name text NOT NULL,
  image_url text,
  size text,
  color text,
  quantity int NOT NULL DEFAULT 1,
  price numeric NOT NULL DEFAULT 0
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

DROP POLICY IF EXISTS "select_order_items" ON order_items;
CREATE POLICY "select_order_items" ON order_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND o.customer_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM orders o
      JOIN tailor_profiles tp ON tp.id = o.tailor_id
      JOIN profiles p ON p.id = tp.tailor_id
      WHERE o.id = order_items.order_id AND p.user_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "insert_order_items" ON order_items;
CREATE POLICY "insert_order_items" ON order_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND o.customer_id = auth.uid())
  );

-- ============ ORDER STATUS HISTORY ============
CREATE TABLE IF NOT EXISTS order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  custom_order_id uuid REFERENCES custom_orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  note text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_status_history_order ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_status_history_custom ON order_status_history(custom_order_id);

DROP POLICY IF EXISTS "select_status_history" ON order_status_history;
CREATE POLICY "select_status_history" ON order_status_history FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_status_history.order_id AND o.customer_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM orders o
      JOIN tailor_profiles tp ON tp.id = o.tailor_id
      JOIN profiles p ON p.id = tp.tailor_id
      WHERE o.id = order_status_history.order_id AND p.user_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM custom_orders co WHERE co.id = order_status_history.custom_order_id AND co.customer_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM custom_orders co
      JOIN tailor_profiles tp ON tp.id = co.tailor_id
      JOIN profiles p ON p.id = tp.tailor_id
      WHERE co.id = order_status_history.custom_order_id AND p.user_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "insert_status_history" ON order_status_history;
CREATE POLICY "insert_status_history" ON order_status_history FOR INSERT
  TO authenticated WITH CHECK (true);

-- ============ CONVERSATIONS ============
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tailor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  custom_order_id uuid REFERENCES custom_orders(id) ON DELETE SET NULL,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_tailor ON conversations(tailor_id);

DROP POLICY IF EXISTS "select_conversations" ON conversations;
CREATE POLICY "select_conversations" ON conversations FOR SELECT
  TO authenticated USING (auth.uid() = customer_id OR auth.uid() = tailor_id);

DROP POLICY IF EXISTS "insert_conversations" ON conversations;
CREATE POLICY "insert_conversations" ON conversations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = customer_id OR auth.uid() = tailor_id);

DROP POLICY IF EXISTS "update_conversations" ON conversations;
CREATE POLICY "update_conversations" ON conversations FOR UPDATE
  TO authenticated USING (auth.uid() = customer_id OR auth.uid() = tailor_id)
  WITH CHECK (auth.uid() = customer_id OR auth.uid() = tailor_id);

-- ============ MESSAGES ============
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text,
  image_url text,
  order_reference uuid,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

DROP POLICY IF EXISTS "select_messages" ON messages;
CREATE POLICY "select_messages" ON messages FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id AND (c.customer_id = auth.uid() OR c.tailor_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "insert_messages" ON messages;
CREATE POLICY "insert_messages" ON messages FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = sender_id AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id AND (c.customer_id = auth.uid() OR c.tailor_id = auth.uid())
    )
  );

-- ============ REVIEWS ============
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  tailor_id uuid NOT NULL REFERENCES tailor_profiles(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  custom_order_id uuid REFERENCES custom_orders(id) ON DELETE SET NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  images text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_reviews_tailor ON reviews(tailor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON reviews(customer_id);

DROP POLICY IF EXISTS "select_reviews" ON reviews;
CREATE POLICY "select_reviews" ON reviews FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_reviews" ON reviews;
CREATE POLICY "insert_own_reviews" ON reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "update_own_reviews" ON reviews;
CREATE POLICY "update_own_reviews" ON reviews FOR UPDATE
  TO authenticated USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "delete_own_reviews" ON reviews;
CREATE POLICY "delete_own_reviews" ON reviews FOR DELETE
  TO authenticated USING (auth.uid() = customer_id);

-- ============ PAYMENTS ============
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  custom_order_id uuid REFERENCES custom_orders(id) ON DELETE SET NULL,
  customer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  method text NOT NULL DEFAULT 'card' CHECK (method IN ('card', 'bank_transfer', 'ussd')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  reference text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);

DROP POLICY IF EXISTS "select_payments" ON payments;
CREATE POLICY "select_payments" ON payments FOR SELECT
  TO authenticated USING (
    auth.uid() = customer_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "insert_payments" ON payments;
CREATE POLICY "insert_payments" ON payments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "update_payments" ON payments;
CREATE POLICY "update_payments" ON payments FOR UPDATE
  TO authenticated USING (
    auth.uid() = customer_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    auth.uid() = customer_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')
  );

-- ============ FAVORITES ============
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  tailor_id uuid REFERENCES tailor_profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CHECK (tailor_id IS NOT NULL OR product_id IS NOT NULL)
);
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

DROP POLICY IF EXISTS "select_own_favorites" ON favorites;
CREATE POLICY "select_own_favorites" ON favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_favorites" ON favorites;
CREATE POLICY "insert_own_favorites" ON favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_favorites" ON favorites;
CREATE POLICY "delete_own_favorites" ON favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ DISPUTES ============
CREATE TABLE IF NOT EXISTS disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  custom_order_id uuid REFERENCES custom_orders(id) ON DELETE SET NULL,
  raised_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  resolution text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);

DROP POLICY IF EXISTS "select_disputes" ON disputes;
CREATE POLICY "select_disputes" ON disputes FOR SELECT
  TO authenticated USING (
    auth.uid() = raised_by OR EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')
    OR EXISTS (
      SELECT 1 FROM orders o
      JOIN tailor_profiles tp ON tp.id = o.tailor_id
      JOIN profiles p ON p.id = tp.tailor_id
      WHERE o.id = disputes.order_id AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_disputes" ON disputes;
CREATE POLICY "insert_disputes" ON disputes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = raised_by);

DROP POLICY IF EXISTS "update_disputes" ON disputes;
CREATE POLICY "update_disputes" ON disputes FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')
  );

-- ============ NOTIFICATIONS ============
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ TRIGGERS ============
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_updated_at_profiles ON profiles;
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_tailor_profiles ON tailor_profiles;
CREATE TRIGGER set_updated_at_tailor_profiles BEFORE UPDATE ON tailor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_products ON products;
CREATE TRIGGER set_updated_at_products BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_custom_orders ON custom_orders;
CREATE TRIGGER set_updated_at_custom_orders BEFORE UPDATE ON custom_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_orders ON orders;
CREATE TRIGGER set_updated_at_orders BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_quotations ON quotations;
CREATE TRIGGER set_updated_at_quotations BEFORE UPDATE ON quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_disputes ON disputes;
CREATE TRIGGER set_updated_at_disputes BEFORE UPDATE ON disputes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_measurement_profiles ON measurement_profiles;
CREATE TRIGGER set_updated_at_measurement_profiles BEFORE UPDATE ON measurement_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_addresses ON addresses;
CREATE TRIGGER set_updated_at_addresses BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============ AUTO-PROFILE ON SIGNUP ============
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', COALESCE(NEW.raw_user_meta_data->>'role', 'customer'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
