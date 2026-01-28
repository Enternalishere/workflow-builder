import React from 'react';
import { WorkflowProvider } from './context/WorkflowContext';
import WorkflowCanvas from './components/WorkflowCanvas';
import './index.css';

function App() {
  return (
    <WorkflowProvider>
      <div className="app">
        <WorkflowCanvas />
      </div>
    </WorkflowProvider>
  );
}

export default App;
