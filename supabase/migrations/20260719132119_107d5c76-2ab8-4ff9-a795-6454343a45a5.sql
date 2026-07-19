
-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('admin', 'technician', 'customer');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users see own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins see all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  -- Default role: customer
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ CATEGORIES ============
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ PRODUCTS ============
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand TEXT,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_price NUMERIC(10,2),
  image_url TEXT,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  stock INT NOT NULL DEFAULT 0,
  warranty TEXT,
  rating NUMERIC(2,1) DEFAULT 4.5,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active products" ON public.products FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins read all products" ON public.products FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ COMPLAINTS ============
CREATE TYPE public.complaint_status AS ENUM ('open','assigned','in_progress','waiting_parts','resolved','closed','cancelled');
CREATE TYPE public.complaint_priority AS ENUM ('normal','high','emergency');

CREATE SEQUENCE public.complaint_ticket_seq START 1001;

CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT NOT NULL UNIQUE DEFAULT ('SWS-' || nextval('public.complaint_ticket_seq')::text),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  city TEXT,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  priority complaint_priority NOT NULL DEFAULT 'normal',
  status complaint_status NOT NULL DEFAULT 'open',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.complaints TO anon, authenticated;
GRANT SELECT, UPDATE ON public.complaints TO authenticated;
GRANT ALL ON public.complaints TO service_role;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Anyone (including guests) can submit
CREATE POLICY "Anyone can submit complaints" ON public.complaints FOR INSERT TO anon, authenticated WITH CHECK (true);
-- Users see own
CREATE POLICY "Users see own complaints" ON public.complaints FOR SELECT TO authenticated USING (auth.uid() = user_id);
-- Admins & technicians see all
CREATE POLICY "Staff see all complaints" ON public.complaints FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'technician'));
CREATE POLICY "Staff update complaints" ON public.complaints FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'technician')) WITH CHECK (true);

-- Public tracking by ticket number (security definer to bypass RLS for a single row lookup)
CREATE OR REPLACE FUNCTION public.get_complaint_by_ticket(_ticket text)
RETURNS TABLE (
  ticket_number text, name text, category text, priority complaint_priority,
  status complaint_status, description text, city text, created_at timestamptz, updated_at timestamptz, resolution_notes text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT ticket_number, name, category, priority, status, description, city, created_at, updated_at, resolution_notes
  FROM public.complaints WHERE ticket_number = _ticket LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_complaint_by_ticket(text) TO anon, authenticated;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql SET search_path=public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_complaints_updated BEFORE UPDATE ON public.complaints FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ SEED CATEGORIES & PRODUCTS ============
INSERT INTO public.categories (slug, name, description, icon, sort_order) VALUES
  ('ro-purifiers', 'RO Water Purifiers', 'Domestic RO water purifiers for homes and apartments', 'droplet', 1),
  ('commercial-ro', 'Commercial RO Plants', 'RO plants for offices, restaurants and buildings', 'building', 2),
  ('industrial-ro', 'Industrial RO Plants', 'Large scale RO water plants for industries', 'factory', 3),
  ('water-softeners', 'Water Softeners', 'Whole-house water softeners for hard water', 'waves', 4),
  ('spare-parts', 'RO Spare Parts', 'Membranes, filters, motors, and genuine spare parts', 'settings', 5),
  ('accessories', 'Accessories', 'Installation kits, taps, tanks and add-ons', 'package', 6);

INSERT INTO public.products (slug, name, brand, category_id, price, discount_price, description, image_url, features, specs, stock, warranty, is_featured) VALUES
  ('sujala-royal-10l', 'Sujala Royal 10L RO+UV+UF', 'Sujala', (SELECT id FROM public.categories WHERE slug='ro-purifiers'), 18999, 14499, 'Premium 10-litre RO with UV+UF+TDS controller. Ideal for families of 4-6.', null, '["RO+UV+UF+TDS","10 L storage","Auto shut-off","Made in India"]'::jsonb, '{"stages":"8","capacity":"10L","input_tds":"upto 2000 ppm"}'::jsonb, 25, '1 Year comprehensive', true),
  ('sujala-classic-8l', 'Sujala Classic 8L RO+UV', 'Sujala', (SELECT id FROM public.categories WHERE slug='ro-purifiers'), 13999, 10999, 'Compact 8-litre RO+UV purifier. Perfect for small families.', null, '["RO+UV","8 L storage","LED indicators"]'::jsonb, '{"stages":"7","capacity":"8L"}'::jsonb, 40, '1 Year', true),
  ('kent-grand-plus', 'Kent Grand Plus 8L', 'Kent', (SELECT id FROM public.categories WHERE slug='ro-purifiers'), 18500, 16999, 'Kent Grand Plus mineral RO water purifier.', null, '["RO+UV+UF","8 L","Mineral RO"]'::jsonb, '{"capacity":"8L"}'::jsonb, 15, '1 Year Kent', false),
  ('commercial-ro-100lph', 'Commercial RO Plant 100 LPH', 'Sujala Pro', (SELECT id FROM public.categories WHERE slug='commercial-ro'), 65000, 58000, '100 litres per hour commercial RO plant for offices and small businesses.', null, '["100 LPH output","Stainless steel","Digital TDS"]'::jsonb, '{"capacity":"100 LPH"}'::jsonb, 8, '2 Years', true),
  ('industrial-ro-1000lph', 'Industrial RO Plant 1000 LPH', 'Sujala Industrial', (SELECT id FROM public.categories WHERE slug='industrial-ro'), 285000, 259000, 'Heavy-duty 1000 LPH industrial RO plant for factories and hotels.', null, '["1000 LPH","SS 304","PLC controlled"]'::jsonb, '{"capacity":"1000 LPH"}'::jsonb, 3, '2 Years', false),
  ('softener-25l', 'Whole-House Water Softener 25L', 'Sujala Soft', (SELECT id FROM public.categories WHERE slug='water-softeners'), 22999, 18999, 'Automatic water softener for whole-house hard water treatment.', null, '["Automatic regeneration","25 L resin","Hard water"]'::jsonb, '{"capacity":"25L"}'::jsonb, 10, '18 months', true),
  ('ro-membrane-80gpd', 'RO Membrane 80 GPD', 'Genuine', (SELECT id FROM public.categories WHERE slug='spare-parts'), 1499, 1099, 'Original 80 GPD RO membrane, fits most domestic purifiers.', null, '["80 GPD","Long life","Universal fit"]'::jsonb, '{}'::jsonb, 120, '6 months', false),
  ('sediment-filter-set', 'Sediment + Carbon Filter Set', 'Sujala', (SELECT id FROM public.categories WHERE slug='spare-parts'), 799, 599, 'Complete pre-filter replacement set (sediment + carbon + post-carbon).', null, '["3 filters","Genuine","Easy fit"]'::jsonb, '{}'::jsonb, 200, null, false);
