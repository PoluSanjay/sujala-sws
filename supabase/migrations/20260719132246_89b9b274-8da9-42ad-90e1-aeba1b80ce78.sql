
DROP POLICY IF EXISTS "Anyone can submit complaints" ON public.complaints;
CREATE POLICY "Anyone can submit complaints" ON public.complaints FOR INSERT TO anon, authenticated
  WITH CHECK (
    name IS NOT NULL AND length(name) > 0
    AND phone IS NOT NULL AND length(phone) >= 6
    AND category IS NOT NULL
    AND description IS NOT NULL AND length(description) > 0
    AND address IS NOT NULL
  );
