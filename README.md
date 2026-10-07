# ⚡ OrbitCode Live — Real-Time Collaborative Workspace

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-v4.7-010101?logo=socketdotio&logoColor=white)](https://socket.io/)
[![Monaco Editor](https://img.shields.io/badge/Monaco_Editor-v4.6-007ACC?logo=visualstudiocode&logoColor=white)](https://microsoft.github.io/monaco-editor/)
[![Vite](https://img.shields.io/badge/Vite-v5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**OrbitCode Live** is a full-stack, enterprise-grade real-time collaborative development environment designed for distributed engineering teams, technical interviews, and pair-programming sessions. Built with modern web technologies, it features split-pane Monaco Editor integration, live remote cursor tracking, passcode-secured workspaces, synchronized code execution sandboxes, sliding-window socket throttling, and fault-tolerant dynamic host migration.

---

## 📑 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Environment Setup & Configuration](#-environment-setup--configuration)
- [Local Execution Steps](#-local-execution-steps)
- [Socket Rate Throttling Strategy](#-socket-rate-throttling-strategy)
- [Disconnected Host Migration Handling](#-disconnected-host-migration-handling)
- [Real-Time Socket Protocol](#-real-time-socket-protocol)
- [Directory Structure](#-directory-structure)
- [Troubleshooting & FAQ](#-troubleshooting--faq)
- [License](#-license)

---

## 🌐 Project Overview

OrbitCode Live solves the latency, synchronization, and race-condition challenges inherent in collaborative coding environments. Rather than relying on simple text fields, the application embeds the production-proven **Microsoft Monaco Editor** (the engine behind VS Code) and couples it with a bi-directional WebSocket fabric powered by **Socket.IO**.

Each workspace operates as an isolated virtual room capable of handling multiple concurrent collaborators. The platform ensures:
- **Instantaneous Document Parity**: Synchronized text state across all connected participants with incremental versioning.
- **Collaborative Presence**: Visual representation of remote users through personalized avatar tokens, colored caret positions, line/column coordinates, and typing indicators.
- **Resilient Connectivity**: Graceful degradation, connection throttling protection against broadcast storms, and automatic host failover when session creators drop offline.

---

## ✨ Key Features

- **Split Workspace Layout**:
  - **Left Work Area**: Full-screen Monaco Editor with multi-file tab switching (`main.js`, `algorithm.py`, `styles.css`, `schema.json`), custom themes (Dark Plus, Light, High Contrast), syntax highlighting, and font-scaling.
  - **Right Sidebar (Upper)**: Live collaborator roster detailing participant badges, online status, cursor coordinates, and host designations (👑).
  - **Right Sidebar (Lower)**: Real-time telemetry & activity audit trail logging joins, departures, code updates, file operations, and throttle events with category filtering.
  - **Bottom Terminal Drawer**: Synchronized execution output panel capturing standard console output (`log`, `warn`, `error`, `info`) and runtime exceptions across peers.
- **Access Control & Room Management**:
  - Custom Room ID generation with instant workspace switching.
  - Optional passcode encryption protecting private collaboration sessions with pre-connection server authentication.
  - Starter template generator (JavaScript Fullstack, Python Algorithms, or Blank).
- **Graceful Network Handling**:
  - Exponential backoff auto-reconnection feedback banner.
  - Per-socket sliding window rate limiting to mitigate spam and sync saturation.
  - Seamless, timestamp-ordered host election upon host disconnection.

---

## 🛠️ Tech Stack

### Frontend (Client)
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `^18.3.1` | Declarative component UI and state management |
| **Vite** | `^5.4.10` | High-performance build tool and hot module replacement dev server |
| **@monaco-editor/react** | `^4.6.0` | Production Monaco code editor integration |
| **Socket.IO Client** | `^4.7.5` | Low-latency bi-directional WebSocket client |
| **Tailwind CSS** | `^3.4.14` | Utility-first glassmorphic styling and responsive layouts |
| **Lucide React** | `^0.453.0` | Accessible and consistent iconography |
| **Canvas Confetti** | `^1.9.3` | Interactive visual celebrations for room link sharing |

### Backend (Server)
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `v18+` | Server runtime environment with native ES Module support |
| **Express** | `^4.19.2` | REST API routes for health diagnostics, room listings, and pre-auth |
| **Socket.IO** | `^4.7.5` | WebSocket engine managing room routing, state sync, and heartbeat |
| **CORS** | `^2.8.5` | Cross-Origin Resource Sharing policy enforcement |

---

## 🏛️ System Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │               Client (React 18 + Vite)                 │
                    │  ┌───────────────────────┐  ┌───────────────────────┐  │
                    │  │     Monaco Editor     │  │   Active Presence     │  │
                    │  └───────────┬───────────┘  └───────────┬───────────┘  │
                    │              │ (Code / Cursors)         │ (Heartbeat)  │
                    └──────────────┼──────────────────────────┼──────────────┘
                                   │                          │
                        WebSocket  │                          │ REST HTTP
                     (Socket.IO)   ▼                          ▼ (/api/rooms/verify)
                    ┌────────────────────────────────────────────────────────┐
                    │          Node.js Express + Socket.IO Server            │
                    │                                                        │
                    │  ┌──────────────────────────────────────────────────┐  │
                    │  │      Security & Rate Limiting Middleware         │  │
                    │  │   - Sliding Window Throttle (Max 5 req/sec)      │  │
                    │  │   - Room Passcode Verification Gateway           │  │
                    │  └──────────────────────────┬───────────────────────┘  │
                    │                             │                          │
                    │  ┌──────────────────────────▼───────────────────────┐  │
                    │  │            In-Memory Workspace Store             │  │
                    │  │   - `rooms` Map (Files, State, Logs, Version)    │  │
                    │  │   - `hostSocketId` Registry & Host Migration     │  │
                    │  └──────────────────────────────────────────────────┘  │
                    └────────────────────────────────────────────────────────┘
```

---

## ⚙️ Environment Setup & Configuration

### Prerequisites
- **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **npm**: `v9.0.0` or higher
- Modern Chromium, Firefox, or WebKit browser with WebSocket support

### Environment Variables

#### 1. Backend (`server/.env` or system environment)
Create a `.env` file in the `server/` directory (optional, defaults provided):
```env
# Server Port (Default: 4000)
PORT=4000

# Allowed Client Origin (Default: * for development)
CLIENT_URL=http://localhost:5173
```

#### 2. Frontend (`client/.env` or `client/.env.local`)
Create a `.env` file in the `client/` directory (optional, defaults to `http://localhost:4000`):
```env
# Socket.IO & API Endpoint
VITE_SERVER_URL=http://localhost:4000
```

---

## 🚀 Local Execution Steps

### Option A: Running with Root Convenience Scripts

The project includes root scripts to run or develop both client and server:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/angelicamdaniel08-sudo/live-collaborative-workspace-orbitcode.git
   cd live-collaborative-workspace-orbitcode
   ```

2. **Install all dependencies**:
   ```bash
   # Install server packages
   cd server && npm install && cd ..

   # Install client packages
   cd client && npm install && cd ..
   ```

3. **Start the backend and frontend**:
   - In Terminal 1 (Start the Backend Server):
     ```bash
     npm run server
     ```
   - In Terminal 2 (Start the Frontend Client):
     ```bash
     npm run client
     ```

---

### Option B: Running Individual Services Manually

#### 1. Backend Server Setup
```bash
cd server
npm install
npm start
# Or for live file watching:
npm run dev
```
*The server will initialize on `http://localhost:4000`.*

#### 2. Frontend Client Setup
```bash
cd client
npm install
npm run dev
```
*Vite will compile and launch the UI on `http://localhost:5173`.*

#### 3. Verification & Multi-User Testing
1. Navigate to **`http://localhost:5173`** in your browser.
2. Open a second browser window (or Incognito mode) pointing to the same URL.
3. Observe live cursor locations, synchronous editing keystrokes, and live updates in the Activity Stream.

---

## 🛡️ Socket Rate Throttling Strategy

### The Challenge
In a collaborative code editor, fast typing, macro paste actions, or rapid key repeats can emit dozens of `code-change` events per second. Unregulated, this leads to:
1. **Network Saturation**: Saturates client and server bandwidth with high-frequency payload rebroadcasts.
2. **Race Conditions & Desynchronization**: Messages arriving out of order cause editor cursor jumping and document state divergence.
3. **Denial-of-Service (DoS)**: A rogue or malfunctioning client can lock up the server event loop.

### The Implementation Strategy

The server implements a **Per-Socket Sliding Window Rate Limiter**:

```
[ Incoming Socket Event ]
           │
           ▼
┌──────────────────────────────────────┐
│  checkRateLimit(socket.id)           │
│  - Check window: (now - start) >= 1s │
└──────────────────┬───────────────────┘
                   │
         ──────────┴──────────
        │                     │
    [ < 1000ms ]          [ >= 1000ms ]
        │                     │
        ▼                     ▼
  Increment count       Reset windowStart = now
  Count <= 5?           Set count = 1
   ├── YES ──> Allow     └── Allow
   └── NO  ──> THROTTLE
                ├── Drop event
                ├── Emit 'rate-limit-warning' to sender
                └── Broadcast audit entry to room telemetry
```

#### Key Mechanics:
1. **Window Size**: 1,000 milliseconds (1 second).
2. **Burst Limit**: Maximum **5 updates per second** per connected socket ID.
3. **Throttled Handling**:
   - The excessive document delta is **dropped immediately** on the server before mutating room state or broadcasting to peers.
   - The server emits a targeted **`rate-limit-warning`** event back to the offending client.
   - A system event is dispatched to the room's live telemetry stream so all participants maintain visibility over network health.
4. **Client-Side Notification**:
   - The offending client receives the warning and renders an amber floating toast notification:
     > *"⚡ You are sending updates too fast (>5/sec). Updates are being temporarily throttled."*
   - Automatically self-dismisses after 5 seconds of normal transmission rate.
5. **Memory Safety & Leak Prevention**:
   - Upon socket disconnection (`socket.on('disconnect')`), the limiter immediately invokes `rateLimits.delete(socket.id)` to prevent memory leaks from transient connections.

---

## 👑 Disconnected Host Migration Handling

### The Problem
When workspaces have administrative privileges (e.g., host controls, room configuration, or session ownership), a host closing their browser tab or experiencing network dropouts leaves the room in an "orphaned" state without leadership.

### Dynamic Election Algorithm

OrbitCode Live implements an **Automated Deterministic Host Migration** pattern based on joining seniority:

```
[ Host Socket Disconnects ]
           │
           ▼
┌──────────────────────────────────────────────┐
│  Is disconnected socket == room.hostSocketId?│
└──────────────────────┬───────────────────────┘
                       │
             ──────────┴──────────
            │                     │
          [ NO ]                [ YES ]
            │                     │
        Normal leave         Are users left in room?
        cleanup               ├── NO  ──> Clear hostSocketId
                              └── YES ──> ELECT NEW HOST
                                           │
                                           ▼
                                 Iterate room.users
                                 Find min(joinedAt)
                                           │
                                           ▼
                                 Promote oldest user:
                                 newHost.isHost = true
                                 room.hostSocketId = newHost.socketId
                                           │
                                           ▼
                                 Emit 'host-migrated' to room
```

#### Detailed Workflow:
1. **Host Assignment on Room Creation**:
   - The first participant to connect to an empty room is designated as the Host (`isHost: true`), and `room.hostSocketId` is recorded.
2. **Disconnect Detection**:
   - When any socket disconnects, the server checks if `socket.id === room.hostSocketId`.
3. **Deterministic Seniority Election**:
   - If the departing user was the host and other participants remain (`room.users.size > 0`), the server iterates through all remaining room members.
   - The user with the **earliest ISO-8601 `joinedAt` timestamp** is chosen:
     ```javascript
     let newHost = null;
     let oldestTime = Infinity;

     room.users.forEach((u) => {
       const t = new Date(u.joinedAt).getTime();
       if (t < oldestTime) {
         oldestTime = t;
         newHost = u;
       }
     });
     ```
4. **Broadcast & UI State Transition**:
   - The promoted user's `isHost` flag is set to `true`.
   - The server pushes a **`host-migrated`** event across the room namespace with the new host's identity and an audit log.
   - The client application updates its internal state; the promoted client's Navbar displays the **Host Badge (👑)**.

---

## 📡 Real-Time Socket Protocol

| Event Name | Direction | Payload Structure | Description |
| :--- | :--- | :--- | :--- |
| `join-room` | Client ➔ Server | `{ roomId, passcode, user }` | Authenticates and joins a target workspace |
| `join-error` | Server ➔ Client | `{ code, message, requiresPasscode }` | Rejection notice for incorrect/missing passcode |
| `room-state` | Server ➔ Client | `{ roomId, files, activeFile, users, logs }` | Initial room snapshot hydrate on connection |
| `user-joined` | Server ➔ Broadcast | `{ user, users, log }` | Alerts peers of a newly connected collaborator |
| `user-left` | Server ➔ Broadcast | `{ socketId, user, users, log }` | Notifies peers of collaborator disconnection |
| `code-change` | Client ➔ Server | `{ roomId, fileName, code, version }` | Emits editor document content updates |
| `code-update` | Server ➔ Broadcast | `{ fileName, code, version, senderName }` | Propagates code changes to room peers |
| `rate-limit-warning`| Server ➔ Client | `{ message, log }` | Warns client when update rate exceeds 5/sec |
| `cursor-change` | Client ➔ Server | `{ roomId, fileName, cursor, selection }` | Tracks line/column caret and selection bounds |
| `cursor-update` | Server ➔ Broadcast | `{ socketId, user, cursor, selection }` | Renders remote cursor marker on peer screens |
| `typing-status` | Client ➔ Server | `{ roomId, isTyping }` | Signals active keyboard entry |
| `run-code` | Client ➔ Server | `{ roomId, fileName, code, language }` | Dispatches file to collaborative runner |
| `code-output` | Server ➔ Broadcast | `{ runner, fileName, logs, duration }` | Streams code execution output to all peers |
| `host-migrated` | Server ➔ Broadcast | `{ newHostSocketId, newHost, users, log }` | Announces reassignment of workspace host |
| `activity-log` | Server ➔ Broadcast | `{ log }` | Ingests real-time events into telemetry feed |

---

## 📂 Directory Structure

```
live-collaborative-workspace-orbitcode/
├── package.json                 # Project-level scripts and orchestration
├── README.md                    # System documentation and operational runbook
├── server/
│   ├── package.json             # Backend dependencies and startup scripts
│   └── server.js                # Express REST API, Socket.IO gateway, rate limiter & runner
└── client/
    ├── package.json             # Frontend dependencies (React, Vite, Monaco)
    ├── vite.config.js           # Vite server, bundling & alias configs
    ├── tailwind.config.js       # Tailwind CSS design system tokens
    ├── postcss.config.js        # PostCSS configuration
    ├── index.html               # Single page application HTML shell
    └── src/
        ├── main.jsx             # React entry point
        ├── App.jsx              # Main workspace layout, split view & modals
        ├── index.css            # Dark glassmorphic styling, animations & fonts
        ├── components/
        │   ├── Navbar.jsx              # Header controls, host badge (👑), room switcher
        │   ├── EditorPanel.jsx         # Monaco Editor, syntax highlight, remote cursors
        │   ├── ActiveUsersPanel.jsx    # Collaborator roster & profile customizer
        │   ├── ActivityLogsPanel.jsx   # Filterable real-time activity audit feed
        │   ├── TerminalPanel.jsx       # Collaborative runtime console drawer
        │   ├── RoomModal.jsx           # Room creation & template selector modal
        │   └── PasscodePromptModal.jsx # Passcode challenge verification modal
        ├── hooks/
        │   └── useCollaboration.js     # Custom hook orchestrating socket connection lifecycle
        └── utils/
            └── helpers.js              # Avatar icons, color palettes & language mappings
```

---

## ❓ Troubleshooting & FAQ

### 1. Monaco Editor fails to load or displays a blank screen
Ensure your network allows loading web workers from unpkg/CDN if running without a local bundle. If using Vite, Monaco's worker configuration is bundled automatically by `@monaco-editor/react`.

### 2. Socket connection fails or repeatedly attempts to reconnect
- Confirm the backend server is running on port `4000`:
  ```bash
  curl http://localhost:4000/api/health
  ```
  Expected output: `{"status":"online","activeRooms":...}`
- If you configured a custom server port or deployed remotely, ensure `VITE_SERVER_URL` in `client/.env` matches the backend host address.

### 3. Rate Limit Warnings appear while typing normally
The rate limiter triggers at **>5 updates per second**. If you are running typing expansion tools, keyboard macros, or automated linters that emit updates on every micro-keystroke, the limiter temporarily drops updates to prevent peer lag. It normalizes immediately once the typing cadence falls below the threshold.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
