CREATE TABLE IF NOT EXISTS public.custom_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  company TEXT DEFAULT '',
  product TEXT DEFAULT '',
  quantity INTEGER DEFAULT 0,
  moq TEXT DEFAULT '',
  colors TEXT DEFAULT '',
  delivery_time TEXT DEFAULT '',
  design_details TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.custom_orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_orders TO authenticated;
GRANT ALL ON public.custom_orders TO service_role;

ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a custom order"
  ON public.custom_orders FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can look up an order"
  ON public.custom_orders FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Staff can update orders"
  ON public.custom_orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'developer'))
  WITH CHECK (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'developer'));

CREATE POLICY "Staff can delete orders"
  ON public.custom_orders FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'developer'));

CREATE INDEX IF NOT EXISTS custom_orders_created_at_idx ON public.custom_orders (created_at DESC);