-- Create function to set session config for guest access
CREATE OR REPLACE FUNCTION public.set_config(parameter text, value text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  PERFORM set_config(parameter, value, false);
END;
$$;