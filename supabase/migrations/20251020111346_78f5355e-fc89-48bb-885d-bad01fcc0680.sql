-- Fix the accept_workspace_invitation function to use JWT email instead of profiles table
CREATE OR REPLACE FUNCTION public.accept_workspace_invitation(_token TEXT)
RETURNS public.workspace_invitations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invitation public.workspace_invitations;
  user_email TEXT;
BEGIN
  -- Get current user's email from JWT (always available, even for new users)
  user_email := (auth.jwt()->>'email')::text;

  -- If email is null in JWT, try to get it from profiles as fallback
  IF user_email IS NULL THEN
    SELECT email INTO user_email
    FROM public.profiles
    WHERE id = auth.uid();
  END IF;

  -- Ensure we have an email
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'Unable to determine user email';
  END IF;

  -- Find valid invitation
  SELECT * INTO invitation
  FROM public.workspace_invitations
  WHERE token = _token
    AND email = user_email
    AND expires_at > now()
    AND accepted_at IS NULL;

  IF invitation IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invitation';
  END IF;

  -- Check if already a member
  IF EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = invitation.workspace_id
    AND user_id = auth.uid()
  ) THEN
    -- Mark as accepted but don't add again
    UPDATE public.workspace_invitations
    SET accepted_at = now()
    WHERE id = invitation.id;
    
    RETURN invitation;
  END IF;

  -- Add user to workspace
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (invitation.workspace_id, auth.uid(), invitation.role);

  -- Mark invitation as accepted
  UPDATE public.workspace_invitations
  SET accepted_at = now()
  WHERE id = invitation.id
  RETURNING * INTO invitation;

  RETURN invitation;
END;
$$;