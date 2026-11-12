CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  first_name TEXT NOT NULL DEFAULT '',
  surname TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  mobile TEXT NOT NULL DEFAULT '',
  move_date TEXT NOT NULL DEFAULT '',
  residential_status TEXT NOT NULL DEFAULT '',
  postcode TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  bedrooms TEXT NOT NULL DEFAULT '',
  property_type TEXT NOT NULL DEFAULT '',
  occupants TEXT NOT NULL DEFAULT '',
  services JSONB NOT NULL DEFAULT '{"energy":false,"broadband":false,"council":false,"water":false}'::jsonb,
  chosen_plan TEXT,
  chosen_broadband TEXT,
  council TEXT NOT NULL DEFAULT 'Tower Hamlets Borough Council',
  water TEXT NOT NULL DEFAULT 'Thames Water',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own profile" ON public.profiles
  FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.silli_touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_touch_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.silli_touch_updated_at();

CREATE OR REPLACE FUNCTION public.silli_handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, COALESCE(NEW.email, ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.silli_handle_new_user();