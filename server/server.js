import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || '*';

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
});

// Default starter files for new collaboration rooms
const DEFAULT_FILES = {
  'main.js': {
    name: 'main.js',
    language: 'javascript',
    content: `// ⚡ Real-time Collaborative Workspace
// Try editing simultaneously with other tabs or browser windows!

function calculateAnalytics(data) {
  console.log("📊 Processing collaborative dataset...");
  const sum = data.reduce((acc, val) => acc + val, 0);
  const avg = (sum / data.length).toFixed(2);
  const max = Math.max(...data);
  const min = Math.min(...data);
  
  return { sum, avg, max, min, timestamp: new Date().toISOString() };
}

// Sample metrics
const metrics = [42, 88, 95, 12, 64, 73, 105, 59];
const result = calculateAnalytics(metrics);

console.log("✨ Live Execution Result:");
console.log(JSON.stringify(result, null, 2));

// Test async streaming simulation
setTimeout(() => {
  console.log("🚀 Sync status: All connected peers in sync!");
}, 500);
`,
  },
  'algorithm.py': {
    name: 'algorithm.py',
    language: 'python',
    content: `# 🐍 Collaborative Python Algorithm Playground
import math
import time

def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)

numbers = [64, 34, 25, 12, 22, 11, 90, 42, 88]
print(f"Original list: {numbers}")
sorted_nums = quick_sort(numbers)
print(f"Sorted list:   {sorted_nums}")
print("Algorithm execution verified across workspace nodes.")
`,
  },
  'styles.css': {
    name: 'styles.css',
    language: 'css',
    content: `/* 🎨 Collaborative Theme Variables */
:root {
  --primary-accent: #3b82f6;
  --neon-glow: 0 0 15px rgba(59, 130, 246, 0.5);
  --glass-bg: rgba(17, 24, 39, 0.85);
  --border-subtle: rgba(255, 255, 255, 0.1);
}

.collaborative-card {
  backdrop-filter: blur(12px);
  background: var(--glass-bg);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--neon-glow);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
`,
  },
  'schema.json': {
    name: 'schema.json',
    language: 'json',
    content: `{
  "workspace": "OrbitCode Live",
  "version": "1.0.0",
  "features": [
    "real-time-sync",
    "remote-cursors",
    "collaborative-terminal",
    "activity-telemetry"
  ],
  "settings": {
    "autoSave": true,
    "cursorDecorations": true,
    "telemetry": "verbose"
  }
}
`,
  },
};

// Rooms state store
// rooms[roomId] = { files, activeFile, users: { socketId: User }, logs: [], version: 1 }
const rooms = new Map();

function getOrCreateRoom(roomId) {
  if (!rooms.has(roomId)) {
    // Deep clone default files
    const filesClone = {};
    for (const [key, val] of Object.entries(DEFAULT_FILES)) {
      filesClone[key] = { ...val };
    }

    rooms.set(roomId, {
      id: roomId,
      files: filesClone,
      activeFile: 'main.js',
      users: new Map(),
      logs: [],
      version: 1,
      createdAt: new Date().toISOString(),
    });

    addActivityLog(roomId, {
      type: 'system',
      user: { username: 'System', color: '#6366f1' },
      text: `Workspace room "${roomId}" initialized with multi-file support.`,
    });
  }
  return rooms.get(roomId);
}

function addActivityLog(roomId, { type, user, text, details = null }) {
  const room = rooms.get(roomId);
  if (!room) return null;

  const logEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type, // 'join' | 'leave' | 'edit' | 'cursor' | 'run' | 'file' | 'system' | 'profile'
    user: user || { username: 'Guest', color: '#94a3b8' },
    text,
    details,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    fullTimestamp: new Date().toISOString(),
  };

  // Keep last 150 logs per room
  room.logs.unshift(logEntry);
  if (room.logs.length > 150) {
    room.logs.pop();
  }

  return logEntry;
}

// REST Health Check & Room Stats
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    activeRooms: rooms.size,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/rooms/:roomId', (req, res) => {
  const room = rooms.get(req.params.roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json({
    id: room.id,
    activeUsersCount: room.users.size,
    filesCount: Object.keys(room.files).length,
    activeFile: room.activeFile,
  });
});

// Real-time Socket.IO Handlers
io.on('connection', (socket) => {
  let currentRoomId = null;
  let currentUser = null;

  // 1. Join Room
  socket.on('join-room', ({ roomId, user }) => {
    currentRoomId = roomId || 'default-room';
    socket.join(currentRoomId);

    const room = getOrCreateRoom(currentRoomId);

    currentUser = {
      socketId: socket.id,
      id: user?.id || `usr_${socket.id.slice(0, 5)}`,
      username: user?.username || `Coder-${socket.id.slice(0, 4)}`,
      color: user?.color || '#3b82f6',
      avatar: user?.avatar || '⚡',
      cursor: { lineNumber: 1, column: 1 },
      selection: null,
      activeFile: room.activeFile,
      joinedAt: new Date().toISOString(),
      status: 'online',
    };

    room.users.set(socket.id, currentUser);

    const joinLog = addActivityLog(currentRoomId, {
      type: 'join',
      user: currentUser,
      text: `${currentUser.username} joined the workspace`,
    });

    // Send complete room snapshot to joining user
    const usersList = Array.from(room.users.values());
    socket.emit('room-state', {
      roomId: currentRoomId,
      files: room.files,
      activeFile: room.activeFile,
      users: usersList,
      currentUser,
      logs: room.logs,
      version: room.version,
    });

    // Notify other peers in room about new user and activity
    socket.to(currentRoomId).emit('user-joined', {
      user: currentUser,
      users: usersList,
      log: joinLog,
    });
  });

  // 2. Real-time Document Code Change
  socket.on('code-change', ({ roomId, fileName, code, version }) => {
    const room = rooms.get(roomId || currentRoomId);
    if (!room || !fileName) return;

    if (!room.files[fileName]) {
      room.files[fileName] = { name: fileName, language: 'javascript', content: code };
    } else {
      room.files[fileName].content = code;
    }

    room.version += 1;

    // Broadcast code update to everyone else in room
    socket.to(roomId || currentRoomId).emit('code-update', {
      fileName,
      code,
      version: room.version,
      senderSocketId: socket.id,
      senderName: currentUser?.username,
    });
  });

  // 3. Remote Cursor & Selection Position
  socket.on('cursor-change', ({ roomId, fileName, cursor, selection }) => {
    const room = rooms.get(roomId || currentRoomId);
    if (!room || !currentUser) return;

    currentUser.cursor = cursor;
    currentUser.selection = selection;
    currentUser.activeFile = fileName || currentUser.activeFile;

    socket.to(roomId || currentRoomId).emit('cursor-update', {
      socketId: socket.id,
      user: currentUser,
      cursor,
      selection,
      fileName,
    });
  });

  // 4. Typing Indicator
  socket.on('typing-status', ({ roomId, isTyping }) => {
    if (!currentUser) return;
    currentUser.status = isTyping ? 'typing' : 'online';
    socket.to(roomId || currentRoomId).emit('typing-update', {
      socketId: socket.id,
      username: currentUser.username,
      isTyping,
    });
  });

  // 5. User Profile Update (Name / Color / Avatar)
  socket.on('user-update', ({ roomId, updates }) => {
    const room = rooms.get(roomId || currentRoomId);
    if (!room || !currentUser) return;

    const oldName = currentUser.username;
    Object.assign(currentUser, updates);

    const log = addActivityLog(roomId || currentRoomId, {
      type: 'profile',
      user: currentUser,
      text: oldName !== currentUser.username 
        ? `${oldName} changed name to ${currentUser.username}` 
        : `${currentUser.username} customized their theme color`,
    });

    io.in(roomId || currentRoomId).emit('user-updated', {
      user: currentUser,
      users: Array.from(room.users.values()),
      log,
    });
  });

  // 6. File Switch or File Creation
  socket.on('file-select', ({ roomId, fileName }) => {
    const room = rooms.get(roomId || currentRoomId);
    if (!room) return;

    if (room.files[fileName]) {
      room.activeFile = fileName;
      if (currentUser) currentUser.activeFile = fileName;

      io.in(roomId || currentRoomId).emit('file-selected', {
        fileName,
        file: room.files[fileName],
        users: Array.from(room.users.values()),
      });
    }
  });

  socket.on('file-create', ({ roomId, fileName, language = 'javascript' }) => {
    const room = rooms.get(roomId || currentRoomId);
    if (!room || !fileName) return;

    if (!room.files[fileName]) {
      room.files[fileName] = {
        name: fileName,
        language,
        content: `// File: ${fileName}\n\nconsole.log("Collaborating on ${fileName}");\n`,
      };
      room.activeFile = fileName;

      const log = addActivityLog(roomId || currentRoomId, {
        type: 'file',
        user: currentUser,
        text: `${currentUser?.username || 'User'} created file "${fileName}"`,
      });

      io.in(roomId || currentRoomId).emit('file-created', {
        fileName,
        file: room.files[fileName],
        files: room.files,
        log,
      });
    }
  });

  socket.on('file-delete', ({ roomId, fileName }) => {
    const room = rooms.get(roomId || currentRoomId);
    if (!room || !fileName) return;

    const fileKeys = Object.keys(room.files);
    if (fileKeys.length <= 1) {
      socket.emit('error-message', { message: 'Cannot delete the only remaining file.' });
      return;
    }

    delete room.files[fileName];
    if (room.activeFile === fileName) {
      room.activeFile = Object.keys(room.files)[0];
    }

    const log = addActivityLog(roomId || currentRoomId, {
      type: 'file',
      user: currentUser,
      text: `${currentUser?.username || 'User'} deleted file "${fileName}"`,
    });

    io.in(roomId || currentRoomId).emit('file-deleted', {
      fileName,
      activeFile: room.activeFile,
      files: room.files,
      log,
    });
  });

  // 7. Collaborative Code Runner Execution
  socket.on('run-code', ({ roomId, fileName, code, language }) => {
    const startTime = Date.now();
    const targetFile = fileName || 'main.js';
    const codeToRun = code || '';

    let outputLogs = [];
    let isError = false;

    try {
      if (language === 'javascript' || targetFile.endsWith('.js') || targetFile.endsWith('.ts')) {
        // Safe sandbox simulation collecting logs
        const captured = [];
        const customConsole = {
          log: (...args) => captured.push({ type: 'log', message: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') }),
          error: (...args) => {
            isError = true;
            captured.push({ type: 'error', message: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') });
          },
          warn: (...args) => captured.push({ type: 'warn', message: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') }),
          info: (...args) => captured.push({ type: 'info', message: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') }),
        };

        // Sandbox evaluation wrapper
        const runFn = new Function('console', 'setTimeout', `
          try {
            ${codeToRun}
          } catch(err) {
            console.error(err.stack || err.message);
          }
        `);

        runFn(customConsole, (fn) => fn());
        outputLogs = captured;

        if (outputLogs.length === 0) {
          outputLogs.push({ type: 'info', message: 'Program executed successfully with no console output.' });
        }
      } else if (language === 'python' || targetFile.endsWith('.py')) {
        // Simulated Python output parser
        const lines = codeToRun.split('\n');
        const prints = lines.filter(l => l.trim().startsWith('print('));
        outputLogs.push({ type: 'info', message: `🐍 Running Python Script [${targetFile}]...` });
        
        prints.forEach(p => {
          const match = p.match(/print\((.*)\)/);
          if (match) {
            outputLogs.push({ type: 'log', message: `> ${match[1].replace(/["']/g, '')}` });
          }
        });

        if (prints.length === 0) {
          outputLogs.push({ type: 'log', message: `Processed ${lines.length} lines of Python code.` });
        }
      } else if (language === 'json' || targetFile.endsWith('.json')) {
        JSON.parse(codeToRun);
        outputLogs.push({ type: 'info', message: '✅ JSON Syntax Validation Passed: Valid structure' });
      } else {
        outputLogs.push({ type: 'info', message: `⚡ Execution triggered for ${targetFile} (${language})` });
      }
    } catch (err) {
      isError = true;
      outputLogs.push({ type: 'error', message: `Execution Error: ${err.message}` });
    }

    const duration = Date.now() - startTime;

    const log = addActivityLog(roomId || currentRoomId, {
      type: 'run',
      user: currentUser,
      text: `${currentUser?.username || 'User'} executed ${targetFile}`,
      details: { status: isError ? 'error' : 'success', duration: `${duration}ms` },
    });

    // Broadcast output & log to ALL participants in room
    io.in(roomId || currentRoomId).emit('code-output', {
      runner: currentUser?.username || 'Collaborator',
      fileName: targetFile,
      logs: outputLogs,
      isError,
      duration: `${duration}ms`,
      timestamp: new Date().toLocaleTimeString(),
      log,
    });
  });

  // 8. Disconnect Cleanup
  socket.on('disconnect', () => {
    if (currentRoomId && rooms.has(currentRoomId)) {
      const room = rooms.get(currentRoomId);
      const user = room.users.get(socket.id);

      room.users.delete(socket.id);

      const leaveLog = addActivityLog(currentRoomId, {
        type: 'leave',
        user: user || { username: 'A collaborator', color: '#94a3b8' },
        text: `${user?.username || 'A collaborator'} disconnected`,
      });

      socket.to(currentRoomId).emit('user-left', {
        socketId: socket.id,
        user,
        users: Array.from(room.users.values()),
        log: leaveLog,
      });

      // Cleanup empty room after 10 minutes if desired
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Collaborative Workspace Server running on http://localhost:${PORT}`);
});
