import React, { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import styles from '../styles/Workflow.module.css';
import AddNodeModal from './AddNodeModal';
import { NodeType } from '../types';

interface NodeRendererProps {
  nodeId: string;
}

const NodeRenderer: React.FC<NodeRendererProps> = ({ nodeId }) => {
  const { state, deleteNode, updateNode, addNode } = useWorkflow();
  const [showAddModal, setShowAddModal] = useState<{ open: boolean; parentId: string; index: number } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempLabel, setTempLabel] = useState('');

  const node = state.nodes[nodeId];
  if (!node) return null;

  const handleEditStart = () => {
    setTempLabel(node.label);
    setEditingId(node.id);
  };

  const handleEditSave = () => {
    updateNode(node.id, tempLabel);
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleEditSave();
  };

  const handleAddClick = (parentId: string, index: number) => {
    setShowAddModal({ open: true, parentId, index });
  };

  const handleModalSelect = (type: NodeType) => {
    if (showAddModal) {
      addNode(showAddModal.parentId, showAddModal.index, type);
      setShowAddModal(null);
    }
  };

  const isRoot = node.id === state.rootId;

  return (
    <div className={styles.nodeContainer}>
      <div 
        className={`${styles.nodeCard} ${styles[node.type]}`}
        onClick={handleEditStart}
      >
        {editingId === node.id ? (
          <input
            className={styles.input}
            value={tempLabel}
            onChange={(e) => setTempLabel(e.target.value)}
            onBlur={handleEditSave}
            onKeyDown={handleKeyDown}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div>
            <div style={{ fontSize: '12px', opacity: 0.7, textTransform: 'uppercase' }}>{node.type}</div>
            <div style={{ fontWeight: 'bold' }}>{node.label}</div>
          </div>
        )}
        
        {!isRoot && (
          <div 
            className={styles.deleteBtn}
            onClick={(e) => {
              e.stopPropagation();
              deleteNode(node.id);
            }}
          >
            ×
          </div>
        )}
      </div>

      {/* Children Rendering */}
      {node.children.length > 0 && (
        <>
          <div className={styles.lineVertical} />
          
          <div className={node.type === 'branch' ? styles.branchChildren : styles.singleChild}>
            {/* Horizontal Connector handled via CSS pseudo-elements */}

            {node.children.map((childId, index) => (
              <div key={index} className={styles.childColumn}>
                {node.type === 'branch' && (
                  <div className={styles.branchLabel}>{index === 0 ? 'True' : 'False'}</div>
                )}
                
                {/* Add Button on the line */}
                <div className={styles.addBtnContainer} style={{ marginBottom: '10px' }}>
                    <button 
                        className={styles.addBtn}
                        onClick={() => handleAddClick(node.id, index)}
                        title="Add/Insert Node"
                    >
                        +
                    </button>
                </div>

                {childId && (
                    <>
                         <div className={styles.lineVertical} style={{ height: '10px' }} /> 
                         <NodeRenderer nodeId={childId} />
                    </>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {showAddModal && (
        <AddNodeModal
          isOpen={showAddModal.open}
          onClose={() => setShowAddModal(null)}
          onSelect={handleModalSelect}
        />
      )}
    </div>
  );
};

export default NodeRenderer;
