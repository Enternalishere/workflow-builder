# Workflow Builder

A production-quality React application for building workflows, implemented without external UI or diagramming libraries.

## 🚀 Setup & Run

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Development Server:**
   ```bash
   npm run dev
   ```

3. **Build for Production:**
   ```bash
   npm run build
   ```

## 🏗 Architecture & Design Decisions

### 📦 Data Model
We use a **normalized, flat state structure** (`Record<string, Node>`) instead of a nested tree.
- **Why?**
  - **Easier Updates:** Updating a deeply nested node doesn't require recursively cloning the entire tree.
  - **O(1) Access:** Direct access to any node by ID.
  - **Scalability:** Handles large workflows better than deep recursion for updates.

**Structure:**
```typescript
interface WorkflowNode {
  id: string;
  type: 'start' | 'action' | 'branch' | 'end';
  label: string;
  children: (string | null)[]; // Array of child IDs
}
```

### 🧠 State Management
- **Context + useReducer:** chosen over Redux for simplicity and zero dependencies, while maintaining "clean architecture".
- **Undo/Redo:** Implemented using a history stack (`past`, `present`, `future`) wrapper around the state.
- **Immutability:** All state updates create new object references to ensure React re-renders correctly.

### 🎨 Rendering Strategy
- **Recursive Component (`NodeRenderer`):**
  - Uses CSS Flexbox for layout.
  - **Branch Nodes:** Render children in a `row` with a CSS-based horizontal connecting line.
  - **Action Nodes:** Render children in a `column`.
- **Styling:** Pure CSS Modules (`Workflow.module.css`) for scoped, maintainable styles. No inline styles for layout logic.

### 🧪 Edge Case Handling
- **Deletion:**
  - When a node is deleted, its parent automatically reconnects to the deleted node's first child.
  - Ensures flow continuity.
- **Branching:**
  - Branch nodes support exactly 2 slots (True/False) visually.
  - Empty slots show an "Add" button.
- **End Nodes:**
  - Cannot have children. Terminate the flow.

## 📂 Project Structure
```
src/
├── components/     # UI Components (NodeRenderer, Canvas, etc.)
├── context/        # State Management (WorkflowContext)
├── styles/         # CSS Modules
├── types/          # TS Interfaces
└── utils/          # Helpers
```

## ✅ Features
- [x] Add Node (Action, Branch, End)
- [x] Delete Node (Auto-reconnect)
- [x] Edit Node Label
- [x] Branching Logic (True/False)
- [x] Undo / Redo
- [x] Save to JSON (Console)
