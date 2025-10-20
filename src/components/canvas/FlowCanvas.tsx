import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FunnelNode } from './FunnelNode';
import { NodeToolbar } from './NodeToolbar';
import { CustomEdge } from './EdgeLabel';

const nodeTypes = {
  traffic: FunnelNode,
  email: FunnelNode,
  landing: FunnelNode,
  checkout: FunnelNode,
  thankyou: FunnelNode,
  condition: FunnelNode,
};

const edgeTypes = {
  default: CustomEdge,
};

interface FlowCanvasProps {
  projectId: string;
  initialNodes: Node[];
  initialEdges: Edge[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  onNodeClick: (node: Node) => void;
}

export function FlowCanvas({
  projectId,
  initialNodes,
  initialEdges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
}: FlowCanvasProps) {
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);

  // Sync internal state when parent props change
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
      onEdgesChange(newEdges);
    },
    [edges, setEdges, onEdgesChange]
  );

  const onNodesChangeInternal = useCallback(
    (changes: any) => {
      setNodes((nds) => {
        const next = applyNodeChanges(changes, nds);
        onNodesChange(next);
        return next;
      });
    },
    [onNodesChange, setNodes]
  );

  const onEdgesChangeInternal = useCallback(
    (changes: any) => {
      setEdges((eds) => {
        const next = applyEdgeChanges(changes, eds);
        onEdgesChange(next);
        return next;
      });
    },
    [onEdgesChange, setEdges]
  );

  const handleNodeClickCallback = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeClick(node);
    },
    [onNodeClick]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeInternal}
        onEdgesChange={onEdgesChangeInternal}
        onNodeClick={handleNodeClickCallback}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        deleteKeyCode={null}
        className="bg-background"
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap />
        <Panel position="top-left">
          <NodeToolbar projectId={projectId} />
        </Panel>
      </ReactFlow>
    </div>
  );
}
