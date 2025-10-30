import { useCallback, useEffect, useState } from 'react';
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
  SelectionMode,
  ConnectionMode,
  ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { FunnelNode } from './FunnelNode';
import { TableNode } from './TableNode';
import { NodeToolbar } from './NodeToolbar';
import { FloatingEdge } from './FloatingEdge';
import { CustomConnectionLine } from './CustomConnectionLine';

const nodeTypes = {
  // Core nodes
  source: FunnelNode,        // Forrás node típus
  traffic: FunnelNode,       // Backward compatibility
  action: FunnelNode,
  email: FunnelNode,         // Backward compatibility
  page: FunnelNode,          // Oldal node típus
  checkout: FunnelNode,
  thankyou: FunnelNode,
  condition: FunnelNode,
  custom: FunnelNode,
  table: TableNode,
  
  // Traffic / Acquisition
  'meta-ads': FunnelNode,
  'google-ads': FunnelNode,
  'linkedin-ads': FunnelNode,
  'youtube-ads': FunnelNode,
  'organic-social': FunnelNode,
  'seo-blog': FunnelNode,
  'referral': FunnelNode,
  'offline-campaign': FunnelNode,
  
  // Conversion / Sales
  'lead-form': FunnelNode,
  'contact': FunnelNode,
  'sales-call': FunnelNode,
  'proposal': FunnelNode,
  'contract': FunnelNode,
  'upsell': FunnelNode,
  'partner-contact': FunnelNode,
  
  // Retention / Remarketing
  'remarketing-ads': FunnelNode,
  'loyalty-program': FunnelNode,
  'reactivation': FunnelNode,
  'subscription-renewal': FunnelNode,
  'feedback-nps': FunnelNode,
  'referral-campaign': FunnelNode,
  'unsubscribe': FunnelNode,
  
  // Automation / Integrations
  'webhook-api': FunnelNode,
  'crm-sync': FunnelNode,
  'automation-step': FunnelNode,
  'ai-recommendation': FunnelNode,
  'data-import': FunnelNode,
  
  // Brand / Support
  'brand-awareness': FunnelNode,
  'webinar-event': FunnelNode,
  'customer-support': FunnelNode,
  'review-testimonial': FunnelNode,
  'community': FunnelNode,
};

const edgeTypes = {
  default: FloatingEdge,
  floating: FloatingEdge,
};

interface FlowCanvasProps {
  projectId?: string;
  initialNodes: Node[];
  initialEdges: Edge[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  onNodeClick: (node: Node) => void;
  onInsertNode?: (edgeId: string, position: { x: number; y: number }) => void;
  onDeleteEdge?: (edgeId: string) => void;
  onSelectionChange?: (nodes: Node[]) => void;
  onInit?: (instance: ReactFlowInstance) => void;
  onPaneClick?: () => void;
  readonly?: boolean;
}

export function FlowCanvas({
  projectId,
  initialNodes,
  initialEdges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onInsertNode,
  onDeleteEdge,
  onSelectionChange,
  onInit,
  onPaneClick,
  readonly = false,
}: FlowCanvasProps) {
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);
  const [isToolbarOpen, setIsToolbarOpen] = useState(true);

  // Sync internal state when parent props change
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const isValidConnection = useCallback((connection: Connection) => {
    // Prevent self-loop: node cannot connect to itself
    return connection.source !== connection.target;
  }, []);

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

  const handleSelectionChangeCallback = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[] }) => {
      if (onSelectionChange) {
        onSelectionChange(selectedNodes);
      }
    },
    [onSelectionChange]
  );

  // Enhance edges with handlers
  const enhancedEdges = edges.map(edge => ({
    ...edge,
    data: {
      ...edge.data,
      onInsertNode,
      onDeleteEdge,
    }
  }));

  return (
    <div className="w-full h-full" style={{ touchAction: 'none' }}>
      <ReactFlow
        nodes={nodes}
        edges={enhancedEdges}
        onNodesChange={readonly ? undefined : onNodesChangeInternal}
        onEdgesChange={readonly ? undefined : onEdgesChangeInternal}
        onNodeClick={handleNodeClickCallback}
        onConnect={readonly ? undefined : onConnect}
        onSelectionChange={handleSelectionChangeCallback}
        onInit={onInit}
        onPaneClick={onPaneClick}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={!readonly}
        nodesConnectable={!readonly}
        elementsSelectable={!readonly}
        selectionMode={SelectionMode.Partial}
        multiSelectionKeyCode={['Meta', 'Control']}
        panOnDrag={[1]}  // Only left mouse button (1) for panning, allow right-click (2) for context menu
        selectNodesOnDrag={false}
        connectionMode={ConnectionMode.Strict}
        connectionRadius={40}
        snapToGrid={true}
        snapGrid={[15, 15]}
        connectionLineComponent={CustomConnectionLine}
        panOnScroll={true}
        zoomOnPinch={true}
        minZoom={0.2}
        maxZoom={4}
        fitView
        deleteKeyCode={null}
        className="bg-background"
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          style={{ opacity: 0.3 }}
        />
        {!readonly && projectId && (
          <Panel position="top-left" className="p-0 m-0 z-50" style={{ top: 0, left: 0, bottom: 0 }}>
            <div className="h-full">
              <NodeToolbar 
                projectId={projectId} 
                isOpen={isToolbarOpen}
                onToggle={() => setIsToolbarOpen(!isToolbarOpen)}
              />
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
