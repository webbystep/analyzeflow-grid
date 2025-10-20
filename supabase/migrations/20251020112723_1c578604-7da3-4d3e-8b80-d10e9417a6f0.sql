-- Create guest_access table for view-only project sharing
CREATE TABLE public.guest_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid NOT NULL
);

-- Extend workspace_invitations table
ALTER TABLE public.workspace_invitations
ADD COLUMN invitation_type text DEFAULT 'member' 
  CHECK (invitation_type IN ('member', 'guest')),
ADD COLUMN email_sent_at timestamptz,
ADD COLUMN project_id uuid REFERENCES public.projects(id);

-- Create indexes for performance
CREATE INDEX idx_guest_access_token ON public.guest_access(token);
CREATE INDEX idx_guest_access_workspace ON public.guest_access(workspace_id);
CREATE INDEX idx_guest_access_project ON public.guest_access(project_id);

-- Enable RLS on guest_access table
ALTER TABLE public.guest_access ENABLE ROW LEVEL SECURITY;

-- Admins can manage guest access
CREATE POLICY "Admins can manage guest access"
ON public.guest_access FOR ALL
USING (has_workspace_role(workspace_id, 'admin'::workspace_role));

-- Anyone can view guest access with valid token (public read)
CREATE POLICY "Anyone can view guest access"
ON public.guest_access FOR SELECT
USING (true);

-- Guest can view nodes with valid token
CREATE POLICY "Guest can view nodes with token"
ON public.nodes FOR SELECT
USING (
  project_id IN (
    SELECT project_id 
    FROM public.guest_access 
    WHERE token = current_setting('app.guest_token', true)
  )
);

-- Guest can view edges with valid token
CREATE POLICY "Guest can view edges with token"
ON public.edges FOR SELECT
USING (
  project_id IN (
    SELECT project_id 
    FROM public.guest_access 
    WHERE token = current_setting('app.guest_token', true)
  )
);