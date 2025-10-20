import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { FlowCanvas } from '@/components/canvas/FlowCanvas';
import { InspectorPanel } from '@/components/canvas/InspectorPanel';
import { FunnelSummary } from '@/components/canvas/FunnelSummary';
import { TemplateDialog } from '@/components/canvas/TemplateDialog';
import { ProjectCollaborators } from '@/components/canvas/ProjectCollaborators';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Save, Info, Sparkles, Trash2, Download, Share2, Undo2, Redo2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Node, Edge } from '@xyflow/react';
import { useDebounce } from 'use-debounce';
import { createNodesFromTemplate, FunnelTemplate } from '@/lib/templates/funnelTemplates';
import { ExportDialog } from '@/components/canvas/ExportDialog';
import { ShareDialog } from '@/components/canvas/ShareDialog';
import { CanvasContextMenu } from '@/components/canvas/CanvasContextMenu';
import { useHistory } from '@/hooks/useHistory';

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
  const [showTemplates, setShowTemplates] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [debouncedNodes] = useDebounce(nodes, 1000);
  const [debouncedEdges] = useDebounce(edges, 1000);
  const [saving, setSaving] = useState(false);
  const { pushHistory, undo, redo, canUndo, canRedo } = useHistory([], []);

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
    
    // Show templates on first load if no nodes
    if (!nodesData || nodesData.length === 0) {
      setShowTemplates(true);
    }
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
    pushHistory(newNodes, edges);
  }, [pushHistory, edges]);

  const handleEdgesChange = useCallback((newEdges: Edge[]) => {
    setEdges(newEdges);
    pushHistory(nodes, newEdges);
  }, [pushHistory, nodes]);

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

  const handleSelectTemplate = useCallback((template: FunnelTemplate) => {
    const { nodes: templateNodes, edges: templateEdges } = createNodesFromTemplate(template);
    setNodes(templateNodes);
    setEdges(templateEdges);
    toast({
      title: 'Template loaded',
      description: `${template.name} has been added to your canvas.`,
    });
  }, [toast]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedNode) {
      const updatedNodes = nodes.filter((n) => n.id !== selectedNode.id);
      const updatedEdges = edges.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id);
      
      setNodes(updatedNodes);
      setEdges(updatedEdges);
      setSelectedNode(null);
      setShowInspector(false);
      
      toast({
        title: 'Node törölve',
        description: 'A kiválasztott node el lett távolítva.',
      });
    }
  }, [selectedNode, nodes, edges, toast]);

  const handleUndo = useCallback(() => {
    const state = undo();
    if (state) {
      setNodes(state.nodes);
      setEdges(state.edges);
      toast({
        title: 'Visszavonva',
        description: 'Az előző műveletet visszavontad.',
      });
    }
  }, [undo, toast]);

  const handleRedo = useCallback(() => {
    const state = redo();
    if (state) {
      setNodes(state.nodes);
      setEdges(state.edges);
      toast({
        title: 'Újra',
        description: 'A művelet újra alkalmazva.',
      });
    }
  }, [redo, toast]);

  const handleDuplicateNode = useCallback((node: Node) => {
    const newNode: Node = {
      ...node,
      id: crypto.randomUUID(),
      position: {
        x: node.position.x + 20,
        y: node.position.y + 20,
      },
    };
    setNodes((nds) => [...nds, newNode]);
    toast({
      title: 'Node másolva',
      description: 'Az új node 20px-el lejjebb és jobbra került.',
    });
  }, [toast]);

  const handleAddNodeFromContext = useCallback((type: string, x = 100, y = 100) => {
    const labels: Record<string, string> = {
      traffic: 'Traffic Source',
      email: 'Email Campaign',
      landing: 'Landing Page',
      checkout: 'Checkout',
      thankyou: 'Thank You',
      condition: 'Condition',
    };

    const newNode: Node = {
      id: crypto.randomUUID(),
      type,
      position: { x, y },
      data: { label: labels[type] || 'New Node', visits: 1000, conversionRate: 10 },
    };
    setNodes((nds) => [...nds, newNode]);
  }, []);

  const handleAlignNodes = useCallback((direction: 'left' | 'right' | 'center' | 'vertical') => {
    if (nodes.length === 0) return;

    const positions = nodes.map(n => n.position.x);
    let targetX: number;

    switch (direction) {
      case 'left':
        targetX = Math.min(...positions);
        break;
      case 'right':
        targetX = Math.max(...positions);
        break;
      case 'center':
        targetX = (Math.min(...positions) + Math.max(...positions)) / 2;
        break;
      default:
        return;
    }

    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        position: { ...node.position, x: targetX },
      }))
    );

    toast({
      title: 'Node-ok igazítva',
      description: `A node-ok ${direction === 'left' ? 'balra' : direction === 'right' ? 'jobbra' : 'középre'} lettek igazítva.`,
    });
  }, [nodes, toast]);

  const handleClearCanvas = useCallback(() => {
    if (confirm('Biztosan törölni szeretnéd az összes node-ot?')) {
      setNodes([]);
      setEdges([]);
      toast({
        title: 'Canvas törölve',
        description: 'Az összes node és kapcsolat el lett távolítva.',
      });
    }
  }, [toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
      // Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedNode) {
        e.preventDefault();
        handleDuplicateNode(selectedNode);
      }
      // Delete selected node
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNode) {
        e.preventDefault();
        handleDeleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, handleDeleteSelected, handleUndo, handleRedo, handleDuplicateNode]);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = canvasRef.current?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const { type: nodeType, label } = JSON.parse(type);
      
      // Calculate exact position where mouse is
      const position = {
        x: event.clientX - reactFlowBounds.left - 90, // Node width/2
        y: event.clientY - reactFlowBounds.top - 40,   // Node height/2
      };

      const newNode: Node = {
        id: crypto.randomUUID(),
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
          {project && (
            <ProjectCollaborators 
              workspaceId={project.workspace_id} 
              projectId={projectId!}
            />
          )}
          {saving && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={!canUndo}
          >
            <Undo2 className="h-4 w-4 mr-2" />
            Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRedo}
            disabled={!canRedo}
          >
            <Redo2 className="h-4 w-4 mr-2" />
            Redo
          </Button>
          <div className="h-6 w-px bg-border" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShare(true)}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <div className="h-6 w-px bg-border" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExport(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <div className="h-6 w-px bg-border" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplates(true)}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Templates
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
          {selectedNode && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteSelected}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          <Button variant="default" size="sm" onClick={saveCanvas} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <CanvasContextMenu
          onClearCanvas={handleClearCanvas}
          hasNodes={nodes.length > 0}
        >
          <div 
            ref={canvasRef}
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
        </CanvasContextMenu>

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

      <TemplateDialog
        open={showTemplates}
        onOpenChange={setShowTemplates}
        onSelectTemplate={handleSelectTemplate}
      />

      <ExportDialog
        open={showExport}
        onOpenChange={setShowExport}
        nodes={nodes}
        edges={edges}
        projectName={project?.name}
        canvasRef={canvasRef}
      />

      {project && (
        <ShareDialog
          open={showShare}
          onOpenChange={setShowShare}
          workspaceId={project.workspace_id}
          projectId={projectId!}
          projectName={project.name}
        />
      )}
    </div>
  );
}
