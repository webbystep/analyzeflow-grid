import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { FlowCanvas } from '@/components/canvas/FlowCanvas';
import { FlowNode, FlowEdge } from '@/lib/types/canvas';
import { ArrowLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

export default function GuestCanvas() {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [project, setProject] = useState<any>(null);
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [validToken, setValidToken] = useState(false);

  useEffect(() => {
    if (!token || !projectId) {
      toast({
        title: 'Érvénytelen link',
        description: 'A guest token vagy projekt ID hiányzik.',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    const validateAndLoad = async () => {
      try {
        // Validate guest token
        const { data: guestAccess, error: guestError } = await supabase
          .from('guest_access')
          .select('*')
          .eq('token', token)
          .eq('project_id', projectId)
          .maybeSingle();

        if (guestError || !guestAccess) {
          toast({
            title: 'Érvénytelen token',
            description: 'Ez a guest link nem létezik vagy lejárt.',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }

        setValidToken(true);

        // Load project
        const { data: projectData } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        setProject(projectData);

        // Load nodes
        const { data: nodesData } = await supabase
          .from('nodes')
          .select('*')
          .eq('project_id', projectId);

        if (nodesData) {
          setNodes(
            nodesData.map((node) => ({
              id: node.id,
              type: node.type as any,
              position: { x: node.position_x, y: node.position_y },
              data: {
                label: node.label || '',
                icon: node.icon,
                color: node.color,
                ...(typeof node.data === 'object' && node.data !== null ? node.data : {}),
              },
            }))
          );
        }

        // Load edges
        const { data: edgesData } = await supabase
          .from('edges')
          .select('*')
          .eq('project_id', projectId);

        if (edgesData) {
          setEdges(
            edgesData.map((edge) => ({
              id: edge.id,
              source: edge.source_id,
              target: edge.target_id,
              label: edge.label || undefined,
              data: typeof edge.data === 'object' && edge.data !== null ? edge.data as any : undefined,
            }))
          );
        }
      } catch (error) {
        console.error('Error loading guest canvas:', error);
        toast({
          title: 'Hiba',
          description: 'Nem sikerült betölteni a projektet.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    validateAndLoad();
  }, [token, projectId, navigate]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Betöltés...</p>
        </div>
      </div>
    );
  }

  if (!validToken) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">{project?.name}</h1>
            <Badge variant="secondary" className="gap-1">
              <Eye className="h-3 w-3" />
              Csak megtekintés
            </Badge>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <FlowCanvas
          initialNodes={nodes}
          initialEdges={edges}
          onNodesChange={() => {}}
          onEdgesChange={() => {}}
          onNodeClick={() => {}}
          readonly={true}
        />
      </main>
    </div>
  );
}
