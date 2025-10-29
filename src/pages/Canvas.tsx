import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { FlowCanvas } from '@/components/canvas/FlowCanvas';
import { InspectorPanel } from '@/components/canvas/InspectorPanel';
import { ProjectCollaborators } from '@/components/canvas/ProjectCollaborators';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Save, Info, Trash2, Download, Share2, Undo2, Redo2, PanelRightOpen, PanelRightClose } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { Node, Edge, ReactFlowInstance } from '@xyflow/react';
import { useDebounce } from 'use-debounce';
import { ExportDialog } from '@/components/canvas/ExportDialog';
import { ShareDialog } from '@/components/canvas/ShareDialog';
import { CanvasContextMenu } from '@/components/canvas/CanvasContextMenu';
import { useHistory } from '@/hooks/useHistory';
import { InsertNodeDialog, NodeType } from '@/components/canvas/InsertNodeDialog';
import { getDefaultDescription } from '@/lib/nodeSchemas';
import type { NodeType as CanvasNodeType } from '@/lib/types/canvas';
export default function Canvas() {
  const {
    projectId
  } = useParams<{
    projectId: string;
  }>();
  const {
    user,
    loading: authLoading
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [showShare, setShowShare] = useState(false);
  const [showInsertDialog, setShowInsertDialog] = useState(false);
  const [pendingInsertData, setPendingInsertData] = useState<{
    edgeId: string;
    position: {
      x: number;
      y: number;
    };
  } | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [highlightedElements, setHighlightedElements] = useState<{
    nodes: Set<string>;
    edges: Set<string>;
  }>({
    nodes: new Set(),
    edges: new Set()
  });
  const canvasRef = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance>(null as any);
  const [debouncedNodes] = useDebounce(nodes, 1000);
  const [debouncedEdges] = useDebounce(edges, 1000);
  const [saving, setSaving] = useState(false);
  const {
    pushHistory,
    undo,
    redo,
    canUndo,
    canRedo
  } = useHistory([], []);
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
    const {
      data: projectData,
      error: projectError
    } = await supabase.from('projects').select('*').eq('id', projectId).single();
    if (projectError) {
      toast({
        variant: 'destructive',
        title: 'Projekt betöltési hiba',
        description: projectError.message
      });
      navigate('/dashboard');
      return;
    }
    setProject(projectData);

    // Load nodes
    const {
      data: nodesData,
      error: nodesError
    } = await supabase.from('nodes').select('*').eq('project_id', projectId);
    if (!nodesError && nodesData) {
      const loadedNodes: Node[] = nodesData.map(node => {
        // Migration: Convert old 'traffic' nodes to 'source'
        const nodeType = node.type === 'traffic' ? 'source' : node.type;
        const nodeData = node.data as Record<string, any> || {};

        // Migration: If converting from traffic to source
        if (node.type === 'traffic') {
          return {
            id: node.id,
            type: nodeType,
            position: {
              x: node.position_x,
              y: node.position_y
            },
            data: {
              label: node.label || 'Forrás',
              description: nodeData.description || nodeData.customText,
              platform: nodeData.sourceName || nodeData.platform || '',
              ...nodeData
            }
          };
        }
        return {
          id: node.id,
          type: nodeType,
          position: {
            x: node.position_x,
            y: node.position_y
          },
          data: {
            label: node.label || 'Untitled',
            ...nodeData
          }
        };
      });
      setNodes(loadedNodes);
    }

    // Load edges
    const {
      data: edgesData,
      error: edgesError
    } = await supabase.from('edges').select('*').eq('project_id', projectId);
    if (!edgesError && edgesData) {
      const loadedEdges: Edge[] = edgesData.map(edge => ({
        id: edge.id,
        source: edge.source_id,
        target: edge.target_id,
        type: 'floating',
        label: edge.label || '',
        data: edge.data as Record<string, any> || {}
      }));
      setEdges(loadedEdges);
    }
    setLoading(false);
  };
  const saveCanvas = async () => {
    if (!projectId || saving) return;
    setSaving(true);
    try {
      // Upsert nodes (insert or update)
      if (nodes.length > 0) {
        const nodesToUpsert = nodes.map(node => ({
          id: node.id,
          project_id: projectId,
          type: node.type || 'source',
          position_x: node.position.x,
          position_y: node.position.y,
          label: (node.data as any)?.label || 'Untitled',
          data: (node.data || {}) as any
        }));
        await supabase.from('nodes').upsert(nodesToUpsert);
      }

      // Get current node IDs
      const currentNodeIds = new Set(nodes.map(n => n.id));

      // Delete nodes that no longer exist
      const {
        data: existingNodes
      } = await supabase.from('nodes').select('id').eq('project_id', projectId);
      if (existingNodes) {
        const nodesToDelete = existingNodes.filter(n => !currentNodeIds.has(n.id)).map(n => n.id);
        if (nodesToDelete.length > 0) {
          await supabase.from('nodes').delete().in('id', nodesToDelete);
        }
      }

      // Upsert edges (insert or update)
      let normalizedEdgeIds: string[] = [];
      if (edges.length > 0) {
        const idMap = new Map<string, string>();
        const edgesToUpsert = edges.map(edge => {
          // Ensure valid, stable UUID for edge id
          let edgeId = edge.id;
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(edgeId);
          if (!isUuid) {
            const newId = crypto.randomUUID();
            idMap.set(edgeId, newId);
            edgeId = newId;
          }
          return {
            id: edgeId,
            project_id: projectId,
            source_id: edge.source,
            target_id: edge.target,
            label: edge.label as string || '',
            data: (edge.data || {}) as any
          };
        });
        normalizedEdgeIds = edgesToUpsert.map(e => e.id);
        await supabase.from('edges').upsert(edgesToUpsert);

        // If any ids changed, reflect them in local state to keep parity with DB
        if (idMap.size > 0) {
          setEdges(prev => prev.map(e => idMap.has(e.id) ? {
            ...e,
            id: idMap.get(e.id)!
          } : e));
        }
      }

      // Delete edges that no longer exist (compare against normalized ids we just saved)
      const {
        data: existingEdges
      } = await supabase.from('edges').select('id').eq('project_id', projectId);
      if (existingEdges) {
        const keepIds = new Set(normalizedEdgeIds.length > 0 ? normalizedEdgeIds : edges.map(e => e.id));
        const edgesToDelete = existingEdges.filter(e => !keepIds.has(e.id)).map(e => e.id);
        if (edgesToDelete.length > 0) {
          await supabase.from('edges').delete().in('id', edgesToDelete);
        }
      }

      // Update project timestamp
      await supabase.from('projects').update({
        updated_at: new Date().toISOString()
      }).eq('id', projectId);
    } catch (error: any) {
      console.error('Error saving canvas:', error);
      toast({
        variant: 'destructive',
        title: 'Mentési hiba',
        description: error.message
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
  }, []);
  const handleUpdateNode = useCallback((nodeId: string, updates: Partial<Node['data']>) => {
    setNodes(nds => nds.map(node => node.id === nodeId ? {
      ...node,
      data: {
        ...node.data,
        ...updates
      }
    } : node));

    // Update selected node if it's the one being edited
    setSelectedNode(current => current?.id === nodeId ? {
      ...current,
      data: {
        ...current.data,
        ...updates
      }
    } : current);
  }, []);
  const handleLabelChange = useCallback((nodeId: string, newLabel: string) => {
    handleUpdateNode(nodeId, {
      label: newLabel
    });
  }, [handleUpdateNode]);
  const handleSelectionChange = useCallback((selected: Node[]) => {
    setSelectedNodes(selected);
    // If only one node selected, also set it as selectedNode for inspector
    if (selected.length === 1) {
      setSelectedNode(selected[0]);
    } else if (selected.length === 0) {
      setSelectedNode(null);
    }
  }, []);
  const handleBulkDelete = useCallback(() => {
    if (selectedNodes.length === 0) return;
    const selectedIds = new Set(selectedNodes.map(n => n.id));
    const updatedNodes = nodes.filter(n => !selectedIds.has(n.id));
    const updatedEdges = edges.filter(e => !selectedIds.has(e.source) && !selectedIds.has(e.target));
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    setSelectedNodes([]);
    setSelectedNode(null);
    pushHistory(updatedNodes, updatedEdges);
    toast({
      title: 'Node-ok törölve',
      description: `${selectedNodes.length} node el lett távolítva.`
    });
  }, [selectedNodes, nodes, edges, toast, pushHistory]);
  const handleBulkDuplicate = useCallback(() => {
    if (selectedNodes.length === 0) return;
    const newNodes = selectedNodes.map(node => ({
      ...node,
      id: crypto.randomUUID(),
      position: {
        x: node.position.x + 40,
        y: node.position.y + 40
      }
    }));
    const updatedNodes = [...nodes, ...newNodes];
    setNodes(updatedNodes);
    pushHistory(updatedNodes, edges);
    toast({
      title: 'Node-ok másolva',
      description: `${selectedNodes.length} node duplikálva lett.`
    });
  }, [selectedNodes, nodes, edges, toast, pushHistory]);
  const handleBulkAlign = useCallback((alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedNodes.length < 2) return;
    const selectedIds = new Set(selectedNodes.map(n => n.id));
    let targetValue: number;
    if (alignment === 'left' || alignment === 'center' || alignment === 'right') {
      const positions = selectedNodes.map(n => n.position.x);
      switch (alignment) {
        case 'left':
          targetValue = Math.min(...positions);
          break;
        case 'right':
          targetValue = Math.max(...positions);
          break;
        case 'center':
          targetValue = (Math.min(...positions) + Math.max(...positions)) / 2;
          break;
      }
      const updatedNodes = nodes.map(node => selectedIds.has(node.id) ? {
        ...node,
        position: {
          ...node.position,
          x: targetValue
        }
      } : node);
      setNodes(updatedNodes);
      pushHistory(updatedNodes, edges);
    } else {
      const positions = selectedNodes.map(n => n.position.y);
      switch (alignment) {
        case 'top':
          targetValue = Math.min(...positions);
          break;
        case 'bottom':
          targetValue = Math.max(...positions);
          break;
        case 'middle':
          targetValue = (Math.min(...positions) + Math.max(...positions)) / 2;
          break;
      }
      const updatedNodes = nodes.map(node => selectedIds.has(node.id) ? {
        ...node,
        position: {
          ...node.position,
          y: targetValue
        }
      } : node);
      setNodes(updatedNodes);
      pushHistory(updatedNodes, edges);
    }
    toast({
      title: 'Node-ok igazítva',
      description: `${selectedNodes.length} node igazítva.`
    });
  }, [selectedNodes, nodes, edges, toast, pushHistory]);
  const handleNodeHover = useCallback((nodeId: string | null) => {
    setHoveredNodeId(nodeId);
    if (!nodeId) {
      setHighlightedElements({
        nodes: new Set(),
        edges: new Set()
      });
      return;
    }
    const connectedNodes = new Set<string>();
    const connectedEdges = new Set<string>();
    edges.forEach(edge => {
      if (edge.source === nodeId || edge.target === nodeId) {
        connectedEdges.add(edge.id);
        connectedNodes.add(edge.source);
        connectedNodes.add(edge.target);
      }
    });
    setHighlightedElements({
      nodes: connectedNodes,
      edges: connectedEdges
    });
  }, [edges]);
  const handleDeleteSelected = useCallback(() => {
    if (selectedNode) {
      const updatedNodes = nodes.filter(n => n.id !== selectedNode.id);
      const updatedEdges = edges.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id);
      setNodes(updatedNodes);
      setEdges(updatedEdges);
      setSelectedNode(null);
      toast({
        title: 'Node törölve',
        description: 'A kiválasztott node el lett távolítva.'
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
        description: 'Az előző műveletet visszavontad.'
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
        description: 'A művelet újra alkalmazva.'
      });
    }
  }, [redo, toast]);
  const handleDuplicateNode = useCallback((node: Node) => {
    const newNode: Node = {
      ...node,
      id: crypto.randomUUID(),
      position: {
        x: node.position.x + 20,
        y: node.position.y + 20
      }
    };
    setNodes(nds => [...nds, newNode]);
    toast({
      title: 'Node másolva',
      description: 'Az új node 20px-el lejjebb és jobbra került.'
    });
  }, [toast]);
  const handleAddNodeFromContext = useCallback((type: string, x = 100, y = 100) => {
    const labels: Record<string, string> = {
      source: 'Forrás',
      email: 'Email Campaign',
      landing: 'Landing Page',
      checkout: 'Checkout',
      thankyou: 'Thank You',
      condition: 'Condition'
    };
    const nodeData: any = {
      label: labels[type] || 'New Node',
      visits: 1000,
      conversionRate: 10
    };

    // Add type-specific defaults
    if (type === 'source') {
      nodeData.description = 'Hirdetések, kampányok és források, amelyek a látogatókat a tölcsér elejére irányítják.';
      nodeData.platform = '';
    } else {
      nodeData.customText = getDefaultDescription(type as CanvasNodeType);
    }
    const newNode: Node = {
      id: crypto.randomUUID(),
      type,
      position: {
        x,
        y
      },
      data: nodeData
    };
    setNodes(nds => [...nds, newNode]);
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
    setNodes(nds => nds.map(node => ({
      ...node,
      position: {
        ...node.position,
        x: targetX
      }
    })));
    toast({
      title: 'Node-ok igazítva',
      description: `A node-ok ${direction === 'left' ? 'balra' : direction === 'right' ? 'jobbra' : 'középre'} lettek igazítva.`
    });
  }, [nodes, toast]);
  const handleAutoLayout = useCallback(() => {
    if (nodes.length === 0) return;

    // Simple hierarchical layout
    const NODE_SPACING_X = 250;
    const NODE_SPACING_Y = 150;

    // Find source nodes (nodes with no incoming edges)
    const sourceNodes = nodes.filter(node => !edges.some(edge => edge.target === node.id));

    // Build adjacency list for BFS
    const adjacencyList = new Map<string, string[]>();
    nodes.forEach(node => adjacencyList.set(node.id, []));
    edges.forEach(edge => {
      const targets = adjacencyList.get(edge.source) || [];
      targets.push(edge.target);
      adjacencyList.set(edge.source, targets);
    });

    // BFS to assign levels
    const levels = new Map<string, number>();
    const queue: Array<{
      id: string;
      level: number;
    }> = [];
    const visited = new Set<string>();
    sourceNodes.forEach(node => {
      queue.push({
        id: node.id,
        level: 0
      });
      visited.add(node.id);
    });
    while (queue.length > 0) {
      const {
        id,
        level
      } = queue.shift()!;
      levels.set(id, level);
      const targets = adjacencyList.get(id) || [];
      targets.forEach(targetId => {
        if (!visited.has(targetId)) {
          visited.add(targetId);
          queue.push({
            id: targetId,
            level: level + 1
          });
        }
      });
    }

    // Organize nodes by level
    const nodesByLevel = new Map<number, string[]>();
    levels.forEach((level, nodeId) => {
      if (!nodesByLevel.has(level)) {
        nodesByLevel.set(level, []);
      }
      nodesByLevel.get(level)!.push(nodeId);
    });

    // Position nodes
    const updatedNodes = nodes.map(node => {
      const level = levels.get(node.id) ?? 0;
      const nodesInLevel = nodesByLevel.get(level) || [];
      const indexInLevel = nodesInLevel.indexOf(node.id);
      return {
        ...node,
        position: {
          x: level * NODE_SPACING_X,
          y: indexInLevel * NODE_SPACING_Y
        }
      };
    });
    setNodes(updatedNodes);
    pushHistory(updatedNodes, edges);
    toast({
      title: 'Node-ok rendezve',
      description: 'A node-ok hierarchikusan lettek elrendezve.'
    });
  }, [nodes, edges, toast, pushHistory]);
  const handleDagreLayout = useCallback((direction: 'TB' | 'LR' = 'TB') => {
    if (nodes.length === 0) return;

    // Dynamic import for dagre
    import('@dagrejs/dagre').then(({
      default: dagre
    }) => {
      const dagreGraph = new dagre.graphlib.Graph();
      dagreGraph.setDefaultEdgeLabel(() => ({}));
      dagreGraph.setGraph({
        rankdir: direction,
        nodesep: 100,
        ranksep: 150
      });
      const nodeWidth = 220;
      const nodeHeight = 120;
      nodes.forEach(node => {
        dagreGraph.setNode(node.id, {
          width: nodeWidth,
          height: nodeHeight
        });
      });
      edges.forEach(edge => {
        dagreGraph.setEdge(edge.source, edge.target);
      });
      dagre.layout(dagreGraph);
      const layoutedNodes = nodes.map(node => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
          ...node,
          position: {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2
          },
          sourcePosition: direction === 'LR' ? 'right' : 'bottom',
          targetPosition: direction === 'LR' ? 'left' : 'top'
        };
      });
      setNodes(layoutedNodes as any);
      pushHistory(layoutedNodes as any, edges);
      reactFlowInstance.current?.fitView({
        padding: 0.2
      });
      toast({
        title: 'Node-ok rendezve',
        description: `Dagre ${direction === 'TB' ? 'függőleges' : 'vízszintes'} elrendezés alkalmazva.`
      });
    });
  }, [nodes, edges, toast, pushHistory, reactFlowInstance]);
  const handleGridLayout = useCallback(() => {
    if (nodes.length === 0) return;
    const columns = Math.ceil(Math.sqrt(nodes.length));
    const spacing = {
      x: 300,
      y: 200
    };
    const layoutedNodes = nodes.map((node, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      return {
        ...node,
        position: {
          x: col * spacing.x,
          y: row * spacing.y
        }
      };
    });
    setNodes(layoutedNodes);
    pushHistory(layoutedNodes, edges);
    reactFlowInstance.current?.fitView({
      padding: 0.2
    });
    toast({
      title: 'Node-ok rendezve',
      description: 'Rács elrendezés alkalmazva.'
    });
  }, [nodes, edges, toast, pushHistory, reactFlowInstance]);
  const handleCircularLayout = useCallback(() => {
    if (nodes.length === 0) return;
    const radius = Math.max(300, nodes.length * 40);
    const center = {
      x: 0,
      y: 0
    };
    const angleStep = 2 * Math.PI / nodes.length;
    const layoutedNodes = nodes.map((node, index) => {
      const angle = index * angleStep - Math.PI / 2; // Start from top
      return {
        ...node,
        position: {
          x: center.x + radius * Math.cos(angle),
          y: center.y + radius * Math.sin(angle)
        }
      };
    });
    setNodes(layoutedNodes);
    pushHistory(layoutedNodes, edges);
    reactFlowInstance.current?.fitView({
      padding: 0.2
    });
    toast({
      title: 'Node-ok rendezve',
      description: 'Kör alakú elrendezés alkalmazva.'
    });
  }, [nodes, edges, toast, pushHistory, reactFlowInstance]);
  const handleClearCanvas = useCallback(() => {
    if (confirm('Biztosan törölni szeretnéd az összes node-ot?')) {
      setNodes([]);
      setEdges([]);
      toast({
        title: 'Canvas törölve',
        description: 'Az összes node és kapcsolat el lett távolítva.'
      });
    }
  }, [toast]);
  const handleInsertNodeBetweenEdges = useCallback((edgeId: string, position: {
    x: number;
    y: number;
  }) => {
    setPendingInsertData({
      edgeId,
      position
    });
    setShowInsertDialog(true);
  }, []);
  const handleNodeTypeSelected = useCallback((type: NodeType) => {
    if (!pendingInsertData) return;
    const {
      edgeId,
      position
    } = pendingInsertData;
    const edge = edges.find(e => e.id === edgeId);
    if (!edge) return;

    // Create new node at edge midpoint
    const nodeData: any = {
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      visits: 1000,
      conversionRate: 10
    };

    // Add type-specific defaults
    if (type === 'source') {
      nodeData.description = 'Hirdetések, kampányok és források, amelyek a látogatókat a tölcsér elejére irányítják.';
      nodeData.platform = '';
    } else {
      nodeData.customText = getDefaultDescription(type as CanvasNodeType);
    }
    const newNode: Node = {
      id: crypto.randomUUID(),
      type,
      position: {
        x: position.x - 90,
        // Node width / 2
        y: position.y - 40 // Node height / 2
      },
      data: nodeData
    };

    // Remove original edge and create two new ones
    const newEdges = edges.filter(e => e.id !== edgeId);
    newEdges.push({
      id: `edge-${edge.source}-${newNode.id}`,
      source: edge.source,
      target: newNode.id,
      data: edge.data // Preserve original edge data (e.g., drop-off rate)
    });
    newEdges.push({
      id: `edge-${newNode.id}-${edge.target}`,
      source: newNode.id,
      target: edge.target,
      data: {
        dropOffRate: 0
      }
    });
    setNodes(nds => [...nds, newNode]);
    setEdges(newEdges);
    pushHistory([...nodes, newNode], newEdges);
    setPendingInsertData(null);
    toast({
      title: 'Node beszúrva',
      description: 'Új node sikeresen hozzáadva az edge közepére.'
    });
  }, [edges, nodes, pushHistory, toast, pendingInsertData]);
  const handleDeleteEdge = useCallback((edgeId: string) => {
    const edgeToDelete = edges.find(e => e.id === edgeId);
    if (!edgeToDelete) return;
    const updatedEdges = edges.filter(e => e.id !== edgeId);
    setEdges(updatedEdges);
    pushHistory(nodes, updatedEdges);
    toast({
      title: 'Összekötés törölve',
      description: 'Az összekötés sikeresen törölve.',
      action: <Button variant="outline" size="sm" onClick={() => {
        setEdges(eds => [...eds, edgeToDelete]);
        toast({
          title: 'Visszavonva',
          description: 'Az összekötés visszaállítva.'
        });
      }}>
          Visszavonás
        </Button>
    });
  }, [edges, nodes, pushHistory, toast]);
  const handleReactFlowInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  }, []);
  const handleFitView = useCallback(() => {
    if (reactFlowInstance.current) {
      reactFlowInstance.current.fitView({
        padding: 0.2,
        duration: 500
      });
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when editing text
      const target = e.target as HTMLElement;
      const isEditable = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (isEditable) return;

      // Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        handleRedo();
      }
      // Duplicate - works for both single and multi-select
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedNodes.length > 0) {
          handleBulkDuplicate();
        } else if (selectedNode) {
          handleDuplicateNode(selectedNode);
        }
      }
      // Delete - works for both single and multi-select (only Delete key)
      if (e.key === 'Delete') {
        e.preventDefault();
        if (selectedNodes.length > 0) {
          handleBulkDelete();
        } else if (selectedNode) {
          handleDeleteSelected();
        }
      }
      // Clear selection
      if (e.key === 'Escape') {
        setSelectedNodes([]);
        setSelectedNode(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, selectedNodes, handleDeleteSelected, handleBulkDelete, handleBulkDuplicate, handleUndo, handleRedo, handleDuplicateNode]);
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const reactFlowBounds = canvasRef.current?.getBoundingClientRect();
    if (!reactFlowBounds) return;
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;
    const {
      type: nodeType,
      label
    } = JSON.parse(type);

    // Calculate exact position where mouse is
    const position = {
      x: event.clientX - reactFlowBounds.left - 90,
      // Node width/2
      y: event.clientY - reactFlowBounds.top - 40 // Node height/2
    };
    const nodeData: any = {
      label,
      visits: 1000,
      conversionRate: 10
    };

    // Add type-specific defaults
    if (nodeType === 'source') {
      nodeData.description = 'Hirdetések, kampányok és források, amelyek a látogatókat a tölcsér elejére irányítják.';
      nodeData.platform = '';
    } else {
      nodeData.customText = getDefaultDescription(nodeType as CanvasNodeType);
    }
    const newNode: Node = {
      id: crypto.randomUUID(),
      type: nodeType,
      position,
      data: nodeData
    };
    setNodes(nds => [...nds, newNode]);
  }, []);
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>;
  }
  return <div className="h-screen flex flex-col">
      <header className="border-b bg-[#222526] flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <div className="h-6 w-px bg-border" />
          <h1 className="text-lg font-semibold">{project?.name}</h1>
          {project && <ProjectCollaborators workspaceId={project.workspace_id} projectId={projectId!} />}
          {saving && <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Mentés...
            </div>}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleUndo} disabled={!canUndo} className="header-btn-secondary">
            <Undo2 className="h-4 w-4" />
          </button>
          <button onClick={handleRedo} disabled={!canRedo} className="header-btn-secondary">
            <Redo2 className="h-4 w-4" />
          </button>
          <div className="h-6 w-px bg-border" />
          <button className="header-btn-primary" onClick={() => setShowShare(true)}>
            <Share2 className="h-4 w-4 mr-2" />
            Megosztás
          </button>
          
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
            <CanvasContextMenu onClearCanvas={handleClearCanvas} onFitView={handleFitView} onAutoLayout={handleAutoLayout} onDagreLayoutTB={() => handleDagreLayout('TB')} onDagreLayoutLR={() => handleDagreLayout('LR')} onGridLayout={handleGridLayout} onCircularLayout={handleCircularLayout} hasNodes={nodes.length > 0}>
          <div ref={canvasRef} className="flex-1" onDrop={handleDrop} onDragOver={handleDragOver}>
            <FlowCanvas projectId={projectId!} initialNodes={nodes.map(node => ({
            ...node,
            data: {
              ...node.data,
              onNodeHover: handleNodeHover,
              onLabelChange: handleLabelChange,
              onDeleteNode: (nodeId: string) => {
                const updatedNodes = nodes.filter(n => n.id !== nodeId);
                const updatedEdges = edges.filter(e => e.source !== nodeId && e.target !== nodeId);
                setNodes(updatedNodes);
                setEdges(updatedEdges);
                pushHistory(updatedNodes, updatedEdges);
              },
              onDuplicateNode: (nodeId: string) => {
                const node = nodes.find(n => n.id === nodeId);
                if (node) {
                  const newNode = {
                    ...node,
                    id: crypto.randomUUID(),
                    position: {
                      x: node.position.x + 20,
                      y: node.position.y + 20
                    }
                  };
                  const updatedNodes = [...nodes, newNode];
                  setNodes(updatedNodes);
                  pushHistory(updatedNodes, edges);
                }
              },
              isConnectedHighlighted: highlightedElements.nodes.has(node.id)
            }
          }))} initialEdges={edges.map(edge => ({
            ...edge,
            data: {
              ...edge.data,
              isHighlighted: highlightedElements.edges.has(edge.id),
              cardinality: {
                source: '1',
                target: 'N'
              },
              onInsertNode: handleInsertNodeBetweenEdges,
              onDeleteEdge: handleDeleteEdge
            }
          }))} onNodesChange={handleNodesChange} onEdgesChange={handleEdgesChange} onNodeClick={handleNodeClick} onInsertNode={handleInsertNodeBetweenEdges} onDeleteEdge={handleDeleteEdge} onSelectionChange={handleSelectionChange} onInit={handleReactFlowInit} />
          </div>
        </CanvasContextMenu>

        {selectedNode && <div className={`border-l transition-all duration-300 ease-in-out ${isPanelOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 absolute right-0 pointer-events-none'}`}>
            <InspectorPanel selectedNode={selectedNode} onUpdateNode={handleUpdateNode} onClose={() => setSelectedNode(null)} />
          </div>}
      </div>

      {project && <ShareDialog open={showShare} onOpenChange={setShowShare} workspaceId={project.workspace_id} projectId={projectId!} projectName={project.name} nodes={nodes} edges={edges} canvasRef={canvasRef} />}

      <InsertNodeDialog open={showInsertDialog} onClose={() => {
      setShowInsertDialog(false);
      setPendingInsertData(null);
    }} onSelectType={handleNodeTypeSelected} />
    </div>;
}