import React from 'react';
import styles from '../styles/Workflow.module.css';
import { NodeType } from '../types';

interface AddNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: NodeType) => void;
}

const AddNodeModal: React.FC<AddNodeModalProps> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  const options: { type: NodeType; label: string; icon: string }[] = [
    { type: 'action', label: 'Action Node', icon: '⚡' },
    { type: 'branch', label: 'Branch Node', icon: '🔀' },
    { type: 'end', label: 'End Node', icon: '🛑' },
  ];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>Add Node</h3>
        {options.map((opt) => (
          <div
            key={opt.type}
            className={styles.nodeOption}
            onClick={() => onSelect(opt.type)}
          >
            <span className={styles.icon}>{opt.icon}</span>
            <span>{opt.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddNodeModal;
