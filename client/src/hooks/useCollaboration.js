import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { getRandomUser } from '../utils/helpers';

const SOCKET_SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

export function useCollaboration(initialRoomId = 'workspace-alpha') {
  const [roomId, setRoomId] = useState(initialRoomId);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('orbit_user');
    return saved ? JSON.parse(saved) : getRandomUser();
  });

  const [files, setFiles] = useState({});
  const [activeFileName, setActiveFileName] = useState('main.js');
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [isTerminalRunning, setIsTerminalRunning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [remoteCursors, setRemoteCursors] = useState({}); // socketId -> { user, cursor, selection, fileName }

  const socketRef = useRef(null);
  const isSelfChangeRef = useRef(false);

  // Save current user profile in localStorage
  useEffect(() => {
    localStorage.setItem('orbit_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Connect socket
  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionStatus('connected');
      socket.emit('join-room', {
        roomId,
        user: currentUser,
      });
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', () => {
      setConnectionStatus('disconnected');
    });

    // 1. Initial Room Snapshot
    socket.on('room-state', (state) => {
      setFiles(state.files || {});
      if (state.activeFile) setActiveFileName(state.activeFile);
      setUsers(state.users || []);
      setLogs(state.logs || []);
    });

    // 2. User Joined
    socket.on('user-joined', ({ user, users: updatedUsers, log }) => {
      setUsers(updatedUsers);
      if (log) setLogs((prev) => [log, ...prev]);
    });

    // 3. User Left
    socket.on('user-left', ({ socketId, user, users: updatedUsers, log }) => {
      setUsers(updatedUsers);
      if (log) setLogs((prev) => [log, ...prev]);
      setRemoteCursors((prev) => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
    });

    // 4. Remote Code Update
    socket.on('code-update', ({ fileName, code }) => {
      setFiles((prev) => {
        if (!prev[fileName]) return prev;
        return {
          ...prev,
          [fileName]: { ...prev[fileName], content: code },
        };
      });
    });

    // 5. Remote Cursor Update
    socket.on('cursor-update', ({ socketId, user, cursor, selection, fileName }) => {
      setRemoteCursors((prev) => ({
        ...prev,
        [socketId]: { user, cursor, selection, fileName },
      }));
    });

    // 6. User Profile Update
    socket.on('user-updated', ({ user, users: updatedUsers, log }) => {
      setUsers(updatedUsers);
      if (log) setLogs((prev) => [log, ...prev]);
    });

    // 7. File Events
    socket.on('file-selected', ({ fileName }) => {
      setActiveFileName(fileName);
    });

    socket.on('file-created', ({ fileName, file, files: updatedFiles, log }) => {
      setFiles(updatedFiles);
      setActiveFileName(fileName);
      if (log) setLogs((prev) => [log, ...prev]);
    });

    socket.on('file-deleted', ({ fileName, activeFile, files: updatedFiles, log }) => {
      setFiles(updatedFiles);
      setActiveFileName(activeFile);
      if (log) setLogs((prev) => [log, ...prev]);
    });

    // 8. Shared Code Output in Terminal
    socket.on('code-output', (payload) => {
      setIsTerminalRunning(false);
      setTerminalLogs((prev) => [payload, ...prev]);
      if (payload.log) setLogs((prev) => [payload.log, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  // Code change broadcaster
  const updateCode = useCallback((fileName, newCode) => {
    // Update local state immediately
    setFiles((prev) => {
      if (!prev[fileName]) return prev;
      return {
        ...prev,
        [fileName]: { ...prev[fileName], content: newCode },
      };
    });

    // Broadcast to server
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('code-change', {
        roomId,
        fileName,
        code: newCode,
      });
    }
  }, [roomId]);

  // Cursor position broadcaster
  const updateCursor = useCallback((fileName, cursor, selection) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('cursor-change', {
        roomId,
        fileName,
        cursor,
        selection,
      });
    }
  }, [roomId]);

  // Typing status broadcaster
  const setTypingStatus = useCallback((isTyping) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('typing-status', {
        roomId,
        isTyping,
      });
    }
  }, [roomId]);

  // Update profile
  const updateUserProfile = useCallback((updates) => {
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('user-update', {
        roomId,
        updates,
      });
    }
  }, [roomId, currentUser]);

  // File actions
  const selectFile = useCallback((fileName) => {
    setActiveFileName(fileName);
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('file-select', { roomId, fileName });
    }
  }, [roomId]);

  const createFile = useCallback((fileName, language = 'javascript') => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('file-create', { roomId, fileName, language });
    }
  }, [roomId]);

  const deleteFile = useCallback((fileName) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('file-delete', { roomId, fileName });
    }
  }, [roomId]);

  // Run code
  const runCode = useCallback((fileName, code, language) => {
    setIsTerminalRunning(true);
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('run-code', {
        roomId,
        fileName,
        code,
        language,
      });
    }
  }, [roomId]);

  const clearTerminal = useCallback(() => {
    setTerminalLogs([]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    roomId,
    setRoomId,
    currentUser,
    users,
    files,
    activeFile: files[activeFileName] || { name: activeFileName, language: 'javascript', content: '' },
    activeFileName,
    logs,
    terminalLogs,
    isTerminalRunning,
    connectionStatus,
    remoteCursors,
    updateCode,
    updateCursor,
    setTypingStatus,
    updateUserProfile,
    selectFile,
    createFile,
    deleteFile,
    runCode,
    clearTerminal,
    clearLogs,
  };
}
