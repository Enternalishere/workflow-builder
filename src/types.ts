export type NodeType = 'start' | 'action' | 'branch' | 'end';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  // Using (string | null)[] to represent slots.
  // Start/Action: [childId] or [null] (size 1)
  // Branch: [trueChildId, falseChildId] (size 2)
  // End: [] (size 0)
  children: (string | null)[];
}

export interface WorkflowState {
  nodes: Record<string, WorkflowNode>;
  rootId: string;
}

export type WorkflowAction =
  | { type: 'ADD_NODE'; parentId: string; childIndex: number; nodeType: NodeType }
  | { type: 'DELETE_NODE'; nodeId: string }
  | { type: 'UPDATE_NODE'; nodeId: string; label: string }
  | { type: 'LOAD_STATE'; state: WorkflowState }
  | { type: 'UNDO' }
  | { type: 'REDO' };
