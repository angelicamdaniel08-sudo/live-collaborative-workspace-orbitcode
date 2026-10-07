# ⚡ OrbitCode Live - Real-Time Collaborative Code Workspace

A full-stack, real-time collaborative code editor built with **React**, **Node.js (Express + Socket.IO)**, and **@monaco-editor/react**.

---

## 🌟 Key Features

- **Split UI Architecture**:
  - **Left Panel**: Full-featured **Monaco Editor** with syntax highlighting, multi-file tabs (`main.js`, `algorithm.py`, `styles.css`, `schema.json`), custom language selector, and theme switcher.
  - **Right Panel (Top)**: **Active Collaborators** list displaying live avatars, colored name tags, current cursor line & column, and live animated typing indicators.
  - **Right Panel (Bottom)**: **Live Activity Stream / Telemetry** tracking user joins, leaves, code edits, executions, and file switches with category filtering and search.
  - **Bottom Drawer**: **Collaborative Execution Terminal & Console** displaying synchronized code runner outputs across all connected peers.
- **Custom Room Creation & Passcode Protection**:
  - **Room Manager Modal**: Create and switch between public and private rooms with custom Room IDs.
  - **Server-Side Credential Validation**: Enforces passcode protection before allowing WebSocket connections to join the session.
  - **Passcode Challenge Modal**: Automatically prompts users for a passcode when attempting to enter protected workspaces.
  - **Starter Templates**: Initialize new workspaces with *JavaScript Fullstack*, *Python Algorithms*, or *Blank* templates.
- **Real-Time Synchronization**:
  - Full document state synchronization on room join.
  - Low-latency delta and code broadcasting across all room peers via Socket.IO.
  - **Floating Remote Cursors**: Floating nametags and colored caret lines inside the Monaco Editor matching each collaborator's color.
  - Collaborative Code Runner with multi-language execution simulation (JavaScript sandbox, Python parser, JSON validator).
- **User Customization**:
  - 10+ custom avatar emojis & vibrant hex color palettes.
  - Editable display names and instant room switcher (`#room-id`).
  - 1-Click invite link generator with confetti animation.

---

## 🏗️ Project Architecture

```
AWS Project/
├── package.json               # Root scripts
├── server/                    # Node.js + Express + Socket.IO Backend
│   ├── package.json
│   └── server.js              # Real-time room manager, presence, passcode auth & runner
└── client/                    # React + Vite + Monaco Editor Frontend
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx            # Main Split Workspace Layout & Modal state
        ├── index.css          # Dark glassmorphic design system
        ├── components/
        │   ├── Navbar.jsx              # Controls, room switcher, runner button & lock status
        │   ├── EditorPanel.jsx         # Monaco Editor + remote cursor markers
        │   ├── ActiveUsersPanel.jsx    # Collaborators list & profile editor
        │   ├── ActivityLogsPanel.jsx   # Live telemetry & filterable event log
        │   ├── TerminalPanel.jsx       # Collaborative execution output drawer
        │   ├── RoomModal.jsx           # Create/Join room modal with passcode toggle
        │   └── PasscodePromptModal.jsx # Passcode challenge modal
        ├── hooks/
        │   └── useCollaboration.js     # Socket.IO connection, auth & state sync
        └── utils/
            └── helpers.js              # Avatars, color palettes & languages
```

---

## 🚀 Getting Started

### 1. Install Dependencies

In the **server** directory:
```bash
cd server
npm install
```

In the **client** directory:
```bash
cd client
npm install
```

### 2. Start the Servers

**Backend Server (Express + Socket.IO on port 4000):**
```bash
cd server
npm start
```

**Frontend Client (Vite Dev Server on port 5173):**
```bash
cd client
npm run dev
```

### 3. Open in Browser

Open [http://localhost:5173](http://localhost:5173) in your browser. Open multiple tabs or different browsers to test live multi-user editing, passcode protected workspaces, remote cursors, and shared executions in real time!
