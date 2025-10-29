-- Guest access helper RPCs to fetch project, nodes, and edges by token
CREATE OR REPLACE FUNCTION public.get_guest_project(_project_id uuid, _token text)
RETURNS TABLE (id uuid, name text, description text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT p.id, p.name, p.description
  FROM public.projects p
  WHERE p.id = _project_id
    AND EXISTS (
      SELECT 1 FROM public.guest_access ga
      WHERE ga.project_id = _project_id AND ga.token = _token
    );
$$;

CREATE OR REPLACE FUNCTION public.get_guest_nodes(_project_id uuid, _token text)
RETURNS SETOF public.nodes
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT n.*
  FROM public.nodes n
  WHERE n.project_id = _project_id
    AND EXISTS (
      SELECT 1 FROM public.guest_access ga
      WHERE ga.project_id = _project_id AND ga.token = _token
    );
$$;

CREATE OR REPLACE FUNCTION public.get_guest_edges(_project_id uuid, _token text)
RETURNS SETOF public.edges
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT e.*
  FROM public.edges e
  WHERE e.project_id = _project_id
    AND EXISTS (
      SELECT 1 FROM public.guest_access ga
      WHERE ga.project_id = _project_id AND ga.token = _token
    );
$$;