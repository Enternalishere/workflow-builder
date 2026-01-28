import React, { createContext, useReducer, useContext, ReactNode, useCallback } from 'react';
import { WorkflowState, WorkflowAction, NodeType, WorkflowNode } from '../types';
import { generateId } from '../utils/idGenerator';

interface WorkflowContextType {
  state: WorkflowState;
  addNode: (parentId: string, childIndex: number, nodeType: NodeType) => void;
  deleteNode: (nodeId: string) => void;
  updateNode: (nodeId: string, label: string) => void;
  saveWorkflow: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

const INITIAL_ROOT_ID = 'start-1';
const initialWorkflowState: WorkflowState = {
  rootId: INITIAL_ROOT_ID,
  nodes: {
    [INITIAL_ROOT_ID]: {
      id: INITIAL_ROOT_ID,
      type: 'start',
      label: 'Start',
      children: [null],
    },
  },
};

interface HistoryState {
  past: WorkflowState[];
  present: WorkflowState;
  future: WorkflowState[];
}

const initialHistory: HistoryState = {
  past: [],
  present: initialWorkflowState,
  future: [],
};

const getNodeFactory = (type: NodeType): Omit<WorkflowNode, 'id'> => {
  switch (type) {
    case 'action':
      return { type, label: 'Action', children: [null] };
    case 'branch':
      return { type, label: 'Condition', children: [null, null] };
    case 'end':
      return { type, label: 'End', children: [] };
    default:
      throw new Error(`Unknown node type: ${type}`);
  }
};

// Helper to find parent
const findParent = (nodes: Record<string, WorkflowNode>, nodeId: string): { parent: WorkflowNode; index: number } | null => {
  for (const key in nodes) {
    const node = nodes[key];
    const index = node.children.indexOf(nodeId);
    if (index !== -1) {
      return { parent: node, index };
    }
  }
  return null;
};

const workflowReducer = (state: HistoryState, action: WorkflowAction): HistoryState => {
  const { past, present, future } = state;

  switch (action.type) {
    case 'UNDO':
      if (past.length === 0) return state;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [present, ...future],
      };

    case 'REDO':
      if (future.length === 0) return state;
      const next = future[0];
      const newFuture = future.slice(1);
      return {
        past: [...past, present],
        present: next,
        future: newFuture,
      };

    case 'LOAD_STATE':
        return {
            past: [...past, present],
            present: action.state,
            future: []
        };

    case 'ADD_NODE': {
      const { parentId, childIndex, nodeType } = action;
      const newNodes = { ...present.nodes };
      const parent = newNodes[parentId];
      
      if (!parent) return state;

      const newNodeId = generateId();
      const nodeTemplate = getNodeFactory(nodeType);
      
      const newNode: WorkflowNode = {
        id: newNodeId,
        ...nodeTemplate,
      };

      // Handle existing child in that slot
      const existingChildId = parent.children[childIndex];
      
      if (existingChildId) {
        // If the new node can accept children, we attach the existing child to its first slot
        if (newNode.children.length > 0) {
          newNode.children[0] = existingChildId;
        }
        // If new node is End, existingChildId is implicitly dropped (orphaned)
      }

      // Update parent to point to new node
      const newParent = { ...parent, children: [...parent.children] };
      newParent.children[childIndex] = newNodeId;

      newNodes[parentId] = newParent;
      newNodes[newNodeId] = newNode;

      return {
        past: [...past, present],
        present: { ...present, nodes: newNodes },
        future: [],
      };
    }

    case 'DELETE_NODE': {
      const { nodeId } = action;
      if (nodeId === present.rootId) return state; // Cannot delete root

      const newNodes = { ...present.nodes };
      const parentInfo = findParent(newNodes, nodeId);
      
      if (!parentInfo) return state;

      const { parent, index } = parentInfo;
      const nodeToDelete = newNodes[nodeId];

      // Determine successor
      // We take the first non-null child of the deleted node, if any
      let successorId: string | null = null;
      if (nodeToDelete.children) {
        const firstChild = nodeToDelete.children.find(child => child !== null);
        if (firstChild) {
          successorId = firstChild;
        }
      }

      // Update parent
      const newParent = { ...parent, children: [...parent.children] };
      newParent.children[index] = successorId;
      newNodes[parent.id] = newParent;

      // Remove deleted node
      delete newNodes[nodeId];

      // Note: We leave other children of deleted node orphaned. 
      // A garbage collection step could be added here to remove unreachable nodes,
      // but strictly speaking, they are just not in the tree anymore.
      
      return {
        past: [...past, present],
        present: { ...present, nodes: newNodes },
        future: [],
      };
    }

    case 'UPDATE_NODE': {
      const { nodeId, label } = action;
      const newNodes = { ...present.nodes };
      if (!newNodes[nodeId]) return state;

      newNodes[nodeId] = { ...newNodes[nodeId], label };

      return {
        past: [...past, present],
        present: { ...present, nodes: newNodes },
        future: [],
      };
    }

    default:
      return state;
  }
};

export const WorkflowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, dispatch] = useReducer(workflowReducer, initialHistory);

  const addNode = useCallback((parentId: string, childIndex: number, nodeType: NodeType) => {
    dispatch({ type: 'ADD_NODE', parentId, childIndex, nodeType });
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    dispatch({ type: 'DELETE_NODE', nodeId });
  }, []);

  const updateNode = useCallback((nodeId: string, label: string) => {
    dispatch({ type: 'UPDATE_NODE', nodeId, label });
  }, []);

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);
  
  const saveWorkflow = useCallback(() => {
    console.log('Saved Workflow JSON:', JSON.stringify(history.present, null, 2));
    alert('Workflow saved to console!');
  }, [history.present]);

  return (
    <WorkflowContext.Provider value={{
      state: history.present,
      addNode,
      deleteNode,
      updateNode,
      saveWorkflow,
      undo,
      redo,
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
    }}>
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};
