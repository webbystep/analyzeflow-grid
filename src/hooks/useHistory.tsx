import { useState, useCallback, useRef } from 'react';
import { Node, Edge } from '@xyflow/react';

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

const MAX_HISTORY = 50;

export function useHistory(initialNodes: Node[], initialEdges: Edge[]) {
  const [history, setHistory] = useState<HistoryState[]>([
    { nodes: initialNodes, edges: initialEdges }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isUndoRedoRef = useRef(false);

  const pushHistory = useCallback((nodes: Node[], edges: Edge[]) => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }

    setHistory((prev) => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push({ nodes, edges });
      
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
        return newHistory;
      }
      
      return newHistory;
    });
    
    setCurrentIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      isUndoRedoRef.current = true;
      setCurrentIndex((prev) => prev - 1);
      return history[currentIndex - 1];
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      isUndoRedoRef.current = true;
      setCurrentIndex((prev) => prev + 1);
      return history[currentIndex + 1];
    }
    return null;
  }, [currentIndex, history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return { pushHistory, undo, redo, canUndo, canRedo };
}
