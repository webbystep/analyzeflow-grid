import { useCallback } from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FunnelNode } from './FunnelNode';
import { NodeToolbar } from './NodeToolbar';

const nodeTypes = {
  traffic: FunnelNode,
  email: FunnelNode,
  landing: FunnelNode,
  checkout: FunnelNode,
  thankyou: FunnelNode,
  condition: FunnelNode,
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
  const [nodes, setNodes, handleNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, handleEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
      onEdgesChange(newEdges);
    },
    [edges, setEdges, onEdgesChange]
  );

  const handleNodesChangeCallback = useCallback(
    (changes: any) => {
      handleNodesChange(changes);
      // Delay to ensure state is updated
      setTimeout(() => {
        onNodesChange(nodes);
      }, 0);
    },
    [handleNodesChange, nodes, onNodesChange]
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
        onNodesChange={handleNodesChangeCallback}
        onEdgesChange={handleEdgesChange}
        onNodeClick={handleNodeClickCallback}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
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
