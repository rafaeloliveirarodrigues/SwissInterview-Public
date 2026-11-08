CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE public.interview_credits (
  user_id uuid PRIMARY KEY,
  remaining integer NOT NULL DEFAULT 3,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.interview_credits TO authenticated;
GRANT ALL ON public.interview_credits TO service_role;
ALTER TABLE public.interview_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own credits readable" ON public.interview_credits FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  grants integer NOT NULL DEFAULT 6,
  max_uses integer,
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_codes TO authenticated;
GRANT ALL ON public.promo_codes TO service_role;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage codes" ON public.promo_codes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.promo_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id uuid NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code_id, user_id)
);
GRANT SELECT ON public.promo_redemptions TO authenticated;
GRANT ALL ON public.promo_redemptions TO service_role;
ALTER TABLE public.promo_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read redemptions" ON public.promo_redemptions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

CREATE TABLE public.coffee_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL UNIQUE,
  email text,
  matched_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.coffee_payments TO service_role;
ALTER TABLE public.coffee_payments ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.consume_interview_credit()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _left integer;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  INSERT INTO public.interview_credits (user_id) VALUES (_uid) ON CONFLICT (user_id) DO NOTHING;
  UPDATE public.interview_credits SET remaining = remaining - 1, updated_at = now()
    WHERE user_id = _uid AND remaining > 0 RETURNING remaining INTO _left;
  IF _left IS NULL THEN RETURN -1; END IF;
  RETURN _left;
END $$;

CREATE OR REPLACE FUNCTION public.refund_interview_credit()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.interview_credits SET remaining = remaining + 1, updated_at = now() WHERE user_id = auth.uid();
END $$;

CREATE OR REPLACE FUNCTION public.get_interview_credits()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _r integer;
BEGIN
  IF auth.uid() IS NULL THEN RETURN 0; END IF;
  INSERT INTO public.interview_credits (user_id) VALUES (auth.uid()) ON CONFLICT (user_id) DO NOTHING;
  SELECT remaining INTO _r FROM public.interview_credits WHERE user_id = auth.uid();
  RETURN _r;
END $$;

CREATE OR REPLACE FUNCTION public.redeem_promo(_code text)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _c public.promo_codes; _used integer; _r integer;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  SELECT * INTO _c FROM public.promo_codes WHERE upper(code) = upper(trim(_code)) FOR UPDATE;
  IF _c.id IS NULL OR NOT _c.active OR (_c.expires_at IS NOT NULL AND _c.expires_at < now()) THEN
    RAISE EXCEPTION 'This code is not valid.';
  END IF;
  IF EXISTS (SELECT 1 FROM public.promo_redemptions WHERE code_id = _c.id AND user_id = _uid) THEN
    RAISE EXCEPTION 'You already used this code.';
  END IF;
  SELECT count(*) INTO _used FROM public.promo_redemptions WHERE code_id = _c.id;
  IF _c.max_uses IS NOT NULL AND _used >= _c.max_uses THEN RAISE EXCEPTION 'This code has been used up.'; END IF;
  INSERT INTO public.promo_redemptions (code_id, user_id) VALUES (_c.id, _uid);
  INSERT INTO public.interview_credits (user_id, remaining) VALUES (_uid, 3) ON CONFLICT (user_id) DO NOTHING;
  UPDATE public.interview_credits SET remaining = remaining + _c.grants, updated_at = now()
    WHERE user_id = _uid RETURNING remaining INTO _r;
  RETURN _r;
END $$;

REVOKE EXECUTE ON FUNCTION public.consume_interview_credit() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.refund_interview_credit() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_interview_credits() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.redeem_promo(text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.consume_interview_credit() TO authenticated;
GRANT EXECUTE ON FUNCTION public.refund_interview_credit() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_interview_credits() TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_promo(text) TO authenticated;

ALTER TABLE public.preps ADD COLUMN language text NOT NULL DEFAULT 'en';
ALTER TABLE public.interview_sessions ADD COLUMN session_kind text NOT NULL DEFAULT 'interview';