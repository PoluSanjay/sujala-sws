ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.complaints REPLICA IDENTITY FULL;