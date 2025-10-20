-- Create workspace invitations table
CREATE TABLE public.workspace_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role workspace_role NOT NULL DEFAULT 'viewer',
  token TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, email)
);

-- Enable RLS
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;

-- Admins can manage invitations
CREATE POLICY "Admins can manage invitations"
ON public.workspace_invitations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = workspace_invitations.workspace_id
    AND has_workspace_role(w.id, 'admin'::workspace_role)
  )
);

-- Users can view invitations sent to their email
CREATE POLICY "Users can view their invitations"
ON public.workspace_invitations
FOR SELECT
USING (
  email = (SELECT email FROM public.profiles WHERE id = auth.uid())
);

-- Create index for token lookups
CREATE INDEX idx_workspace_invitations_token ON public.workspace_invitations(token);
CREATE INDEX idx_workspace_invitations_email ON public.workspace_invitations(email);

-- Function to accept invitation
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
  -- Get current user's email
  SELECT email INTO user_email
  FROM public.profiles
  WHERE id = auth.uid();

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