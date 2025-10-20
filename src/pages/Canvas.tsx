import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { FlowCanvas } from '@/components/canvas/FlowCanvas';
import { InspectorPanel } from '@/components/canvas/InspectorPanel';
import { FunnelSummary } from '@/components/canvas/FunnelSummary';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Save, Undo, Redo, ZoomIn, ZoomOut, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Node, Edge } from '@xyflow/react';
import { useDebounce } from 'use-debounce';

export default function Canvas() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showInspector, setShowInspector] = useState(false);
  const [debouncedNodes] = useDebounce(nodes, 1000);
  const [debouncedEdges] = useDebounce(edges, 1000);
  const [saving, setSaving] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (projectId && user) {
      loadProject();
    }
  }, [projectId, user]);

  // Autosave
  useEffect(() => {
    if (project && nodes.length > 0) {
      saveCanvas();
    }
  }, [debouncedNodes, debouncedEdges]);

  const loadProject = async () => {
    if (!projectId) return;

    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError) {
      toast({
        variant: 'destructive',
        title: 'Error loading project',
        description: projectError.message,
      });
      navigate('/dashboard');
      return;
    }

    setProject(projectData);

    // Load nodes
    const { data: nodesData, error: nodesError } = await supabase
      .from('nodes')
      .select('*')
      .eq('project_id', projectId);

    if (!nodesError && nodesData) {
      const loadedNodes: Node[] = nodesData.map((node) => ({
        id: node.id,
        type: node.type,
        position: { x: node.position_x, y: node.position_y },
        data: {
          label: node.label || 'Untitled',
          ...(node.data as Record<string, any> || {}),
        },
      }));
      setNodes(loadedNodes);
    }

    // Load edges
    const { data: edgesData, error: edgesError } = await supabase
      .from('edges')
      .select('*')
      .eq('project_id', projectId);

    if (!edgesError && edgesData) {
      const loadedEdges: Edge[] = edgesData.map((edge) => ({
        id: edge.id,
        source: edge.source_id,
        target: edge.target_id,
        label: edge.label || '',
        data: edge.data as Record<string, any> || {},
      }));
      setEdges(loadedEdges);
    }

    setLoading(false);
  };

  const saveCanvas = async () => {
    if (!projectId || saving) return;
    
    setSaving(true);

    try {
      // Delete existing nodes and edges
      await supabase.from('nodes').delete().eq('project_id', projectId);
      await supabase.from('edges').delete().eq('project_id', projectId);

      // Insert new nodes
      if (nodes.length > 0) {
        const nodesToInsert = nodes.map((node) => ({
          id: node.id,
          project_id: projectId,
          type: node.type || 'traffic',
          position_x: node.position.x,
          position_y: node.position.y,
          label: (node.data as any)?.label || 'Untitled',
          data: (node.data || {}) as any,
        }));

        await supabase.from('nodes').insert(nodesToInsert);
      }

      // Insert new edges
      if (edges.length > 0) {
        const edgesToInsert = edges.map((edge) => ({
          id: edge.id,
          project_id: projectId,
          source_id: edge.source,
          target_id: edge.target,
          label: (edge.label as string) || '',
          data: (edge.data || {}) as any,
        }));

        await supabase.from('edges').insert(edgesToInsert);
      }

      // Update project timestamp
      await supabase
        .from('projects')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', projectId);

    } catch (error: any) {
      console.error('Error saving canvas:', error);
      toast({
        variant: 'destructive',
        title: 'Error saving',
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNodesChange = useCallback((newNodes: Node[]) => {
    setNodes(newNodes);
  }, []);

  const handleEdgesChange = useCallback((newEdges: Edge[]) => {
    setEdges(newEdges);
  }, []);

  const handleNodeClick = useCallback((node: Node) => {
    setSelectedNode(node);
    setShowInspector(true);
  }, []);

  const handleUpdateNode = useCallback((nodeId: string, updates: Partial<Node['data']>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                ...updates,
              },
            }
          : node
      )
    );
    // Update selected node if it's the one being edited
    setSelectedNode((current) =>
      current?.id === nodeId
        ? {
            ...current,
            data: {
              ...current.data,
              ...updates,
            },
          }
        : current
    );
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = dropRef.current?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const { type: nodeType, label } = JSON.parse(type);
      const position = {
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top - 50,
      };

      const newNode: Node = {
        id: `${nodeType}-${Date.now()}`,
        type: nodeType,
        position,
        data: { label, visits: 1000, conversionRate: 10 },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    []
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <div className="h-6 w-px bg-border" />
          <h1 className="text-lg font-semibold">{project?.name}</h1>
          {saving && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" disabled>
            <Redo className="h-4 w-4" />
          </Button>
          <div className="h-6 w-px bg-border" />
          <Button
            variant={showInspector ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowInspector(!showInspector)}
          >
            <Info className="h-4 w-4 mr-2" />
            Inspector
          </Button>
          <Button variant="default" size="sm" onClick={saveCanvas} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div 
          ref={dropRef}
          className="flex-1"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <FlowCanvas
            projectId={projectId!}
            initialNodes={nodes}
            initialEdges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onNodeClick={handleNodeClick}
          />
        </div>

        {showInspector && (
          <div className="border-l">
            <InspectorPanel
              selectedNode={selectedNode}
              onUpdateNode={handleUpdateNode}
              onClose={() => setShowInspector(false)}
            />
          </div>
        )}
      </div>

      <FunnelSummary nodes={nodes} />
    </div>
  );
}
