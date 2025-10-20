-- Create helper function to safely create a workspace as the current user
CREATE OR REPLACE FUNCTION public.create_workspace(_name text)
RETURNS public.workspaces
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_ws public.workspaces;
BEGIN
  -- Ensure profile exists for FK
  INSERT INTO public.profiles (id, email)
  SELECT auth.uid(), COALESCE((auth.jwt()->>'email')::text, NULL)
  WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid());

  -- Create workspace owned by current user
  INSERT INTO public.workspaces (name, owner_id)
  VALUES (_name, auth.uid())
  RETURNING * INTO new_ws;

  RETURN new_ws;
END;
$$;

-- Restrict and grant execute to authenticated users
REVOKE ALL ON FUNCTION public.create_workspace(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_workspace(text) TO authenticated;