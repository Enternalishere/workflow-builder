import React from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import NodeRenderer from './NodeRenderer';
import Controls from './Controls';
import styles from '../styles/Workflow.module.css';

const WorkflowCanvas: React.FC = () => {
  const { state } = useWorkflow();

  return (
    <div className={styles.canvas}>
      <Controls />
      <NodeRenderer nodeId={state.rootId} />
    </div>
  );
};

export default WorkflowCanvas;
