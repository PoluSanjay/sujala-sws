
-- ORDERS
CREATE TYPE public.order_status AS ENUM ('pending','confirmed','processing','shipped','delivered','cancelled');
CREATE TYPE public.payment_method AS ENUM ('cod','bank_transfer');
CREATE TYPE public.payment_status AS ENUM ('unpaid','awaiting_verification','paid','refunded');

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE DEFAULT ('SWS-' || to_char(now(),'YYMMDD') || '-' || lpad((floor(random()*100000))::text,5,'0')),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text,
  address text NOT NULL,
  city text,
  pincode text,
  notes text,
  items jsonb NOT NULL,
  subtotal numeric(10,2) NOT NULL,
  payment_method public.payment_method NOT NULL,
  payment_status public.payment_status NOT NULL DEFAULT 'unpaid',
  payment_reference text,
  status public.order_status NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT SELECT, INSERT ON public.orders TO anon;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can place an order" ON public.orders
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(customer_name) BETWEEN 2 AND 100
    AND length(phone) BETWEEN 6 AND 20
    AND length(address) BETWEEN 5 AND 500
    AND jsonb_typeof(items) = 'array'
    AND subtotal >= 0
    AND (user_id IS NULL OR user_id = auth.uid())
  );

CREATE POLICY "Customers view own orders" ON public.orders
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Staff view all orders" ON public.orders
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'technician'));

CREATE POLICY "Staff update all orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'technician'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'technician'));

CREATE POLICY "Admins delete orders" ON public.orders
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER orders_set_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Public lookup by order number (guest tracking)
CREATE OR REPLACE FUNCTION public.get_order_by_number(_order_number text)
RETURNS TABLE(
  order_number text, customer_name text, phone text, city text,
  items jsonb, subtotal numeric, payment_method public.payment_method,
  payment_status public.payment_status, status public.order_status,
  created_at timestamptz, updated_at timestamptz
) LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT order_number, customer_name, phone, city, items, subtotal, payment_method, payment_status, status, created_at, updated_at
  FROM public.orders WHERE order_number = _order_number LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_order_by_number(text) TO anon, authenticated;

-- PAYMENT SETTINGS (bank details shown at checkout)
CREATE TABLE public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name text,
  account_name text,
  account_number text,
  ifsc text,
  upi_id text,
  instructions text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.payment_settings TO anon, authenticated;
GRANT ALL ON public.payment_settings TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.payment_settings TO authenticated;

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view payment settings" ON public.payment_settings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage payment settings" ON public.payment_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.payment_settings (bank_name, account_name, account_number, ifsc, upi_id, instructions)
VALUES ('Your Bank', 'Sujala Water Solutions', 'XXXXXXXXXXXX', 'XXXX0000000', 'sujala@upi', 'After transfer, share the transaction reference on WhatsApp +91 9949792248.');

CREATE TRIGGER payment_settings_set_updated_at BEFORE UPDATE ON public.payment_settings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Product admin policy: allow admins to insert/update/delete products (was Shopify-managed before)
DROP POLICY IF EXISTS "Admins manage products" ON public.products;
CREATE POLICY "Admins manage products" ON public.products
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
