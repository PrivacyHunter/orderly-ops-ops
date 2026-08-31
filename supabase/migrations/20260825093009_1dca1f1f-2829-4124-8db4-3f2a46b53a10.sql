CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  email_status text NOT NULL DEFAULT 'pending',
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT newsletter_subscribers_email_key UNIQUE (email),
  CONSTRAINT newsletter_subscribers_status_check CHECK (status IN ('active', 'unsubscribed')),
  CONSTRAINT newsletter_subscribers_email_status_check CHECK (email_status IN ('pending', 'sent', 'failed'))
);

GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visitors can subscribe"
ON public.newsletter_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'active');

CREATE POLICY "Staff can view newsletter subscribers"
ON public.newsletter_subscribers
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update newsletter subscribers"
ON public.newsletter_subscribers
FOR UPDATE
TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete newsletter subscribers"
ON public.newsletter_subscribers
FOR DELETE
TO authenticated
USING (public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.set_newsletter_subscriber_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_newsletter_subscriber_updated_at
BEFORE UPDATE ON public.newsletter_subscribers
FOR EACH ROW
EXECUTE FUNCTION public.set_newsletter_subscriber_updated_at();