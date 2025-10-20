import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { NodeMetrics } from '@/lib/types/canvas';

export function useMetricsFlow() {
  /**
   * Calculate metrics flow through the entire funnel
   * Starting from a source node, propagate metrics downstream
   */
  const calculateMetricsFlow = useCallback((
    nodes: Node[],
    edges: Edge[],
    updatedNodeId?: string
  ): Node[] => {
    // Create a map for quick node lookup
    const nodeMap = new Map(nodes.map(n => [n.id, { ...n }]));
    
    // Build adjacency list for the graph
    const adjacencyList = new Map<string, { targetId: string; edge: Edge }[]>();
    edges.forEach(edge => {
      if (!adjacencyList.has(edge.source)) {
        adjacencyList.set(edge.source, []);
      }
      adjacencyList.get(edge.source)!.push({
        targetId: edge.target,
        edge
      });
    });

    // Find root nodes (nodes with no incoming edges)
    const nodesWithIncoming = new Set(edges.map(e => e.target));
    const rootNodes = nodes.filter(n => !nodesWithIncoming.has(n.id));

    // If we have an updated node, start from there, otherwise process all roots
    const startNodes = updatedNodeId 
      ? [nodeMap.get(updatedNodeId)!].filter(Boolean)
      : rootNodes;

    // BFS traversal to propagate metrics
    const queue = [...startNodes];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const currentNode = queue.shift()!;
      if (visited.has(currentNode.id)) continue;
      visited.add(currentNode.id);

      const children = adjacencyList.get(currentNode.id) || [];
      
      children.forEach(({ targetId, edge }) => {
        const targetNode = nodeMap.get(targetId);
        if (!targetNode) return;

        // Calculate metrics for target node based on source node and edge drop-off
        const sourceMetrics = currentNode.data as NodeMetrics;
        const dropOffRate = (edge.data?.dropOffRate as number) || 0;
        
        // Calculate visits after drop-off
        const sourceVisits = Number(sourceMetrics.visits) || 0;
        const targetVisits = Math.round(sourceVisits * (1 - Number(dropOffRate) / 100));

        // Update target node metrics
        const updatedMetrics: Partial<NodeMetrics> = {
          visits: targetVisits,
        };

        // If target has conversion rate, calculate conversions
        if (targetNode.data.conversionRate) {
          updatedMetrics.conversions = Math.round(
            targetVisits * (Number(targetNode.data.conversionRate) / 100)
          );

          // If we have AOV, calculate revenue
          if (targetNode.data.averageOrderValue && updatedMetrics.conversions) {
            updatedMetrics.revenue = Math.round(
              updatedMetrics.conversions * Number(targetNode.data.averageOrderValue)
            );
          }
        }

        // Merge metrics into target node
        targetNode.data = {
          ...targetNode.data,
          ...updatedMetrics,
        };

        nodeMap.set(targetId, targetNode);
        queue.push(targetNode);
      });
    }

    return Array.from(nodeMap.values());
  }, []);

  /**
   * Calculate total funnel metrics (summed across all paths)
   */
  const calculateFunnelMetrics = useCallback((nodes: Node[]): {
    totalVisits: number;
    totalConversions: number;
    totalRevenue: number;
    averageConversionRate: number;
  } => {
    let totalVisits = 0;
    let totalConversions = 0;
    let totalRevenue = 0;
    let nodesWithCR = 0;
    let sumCR = 0;

    nodes.forEach(node => {
      const data = node.data as NodeMetrics;
      totalVisits += data.visits || 0;
      totalConversions += data.conversions || 0;
      totalRevenue += data.revenue || 0;
      
      if (data.conversionRate) {
        sumCR += data.conversionRate;
        nodesWithCR++;
      }
    });

    return {
      totalVisits,
      totalConversions,
      totalRevenue,
      averageConversionRate: nodesWithCR > 0 ? sumCR / nodesWithCR : 0,
    };
  }, []);

  return {
    calculateMetricsFlow,
    calculateFunnelMetrics,
  };
}
