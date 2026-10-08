import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { getRandomUser } from '../utils/helpers';

const SOCKET_SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

export function useCollaboration(initialRoomId = 'workspace-alpha', initialPasscode = '') {
  const [roomId, setRoomId] = useState(initialRoomId);
  const [passcode, setPasscode] = useState(initialPasscode);
  const [isRoomProtected, setIsRoomProtected] = useState(false);
  const [authError, setAuthError] = useState(null);

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
  const [remoteCursors, setRemoteCursors] = useState({});
  const [isHost, setIsHost] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [rateLimitWarning, setRateLimitWarning] = useState(null); // { message, timestamp }

  const socketRef = useRef(null);

  // Save current user profile in localStorage
  useEffect(() => {
    localStorage.setItem('orbit_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Connect & join room
  useEffect(() => {
    if (!roomId) {
      setConnectionStatus('idle');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    setAuthError(null);
    setConnectionStatus('connecting');

    const socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      // Send join request with credentials
      socket.emit('join-room', {
        roomId,
        passcode,
        user: currentUser,
      });
    });

    socket.on('disconnect', (reason) => {
      // Hard disconnect (server-side kick): stay disconnected
      if (reason === 'io server disconnect') {
        setConnectionStatus('disconnected');
      } else {
        // Socket.IO will auto-reconnect; surface that to the user
        setConnectionStatus('reconnecting');
      }
    });

    socket.on('reconnect_attempt', (attempt) => {
      setReconnectAttempts(attempt);
      setConnectionStatus('reconnecting');
    });

    socket.on('reconnect', () => {
      // Socket reconnected — 'connect' fires next which re-emits join-room
      setReconnectAttempts(0);
    });

    socket.on('reconnect_failed', () => {
      setConnectionStatus('disconnected');
      setReconnectAttempts(0);
    });

    socket.on('connect_error', () => {
      setConnectionStatus('reconnecting');
    });

    // Handle Authentication / Passcode Errors
    socket.on('join-error', (err) => {
      setConnectionStatus('disconnected');
      setIsRoomProtected(true);
      setAuthError(err);
    });

    // 1. Initial Room Snapshot
    socket.on('room-state', (state) => {
      setConnectionStatus('connected');
      setReconnectAttempts(0);
      setAuthError(null);
      setIsRoomProtected(Boolean(state.isProtected));
      setFiles(state.files || {});
      if (state.activeFile) setActiveFileName(state.activeFile);
      setUsers(state.users || []);
      setLogs(state.logs || []);
      // Determine if this socket is the room host
      const me = (state.users || []).find((u) => u.socketId === socket.id);
      if (me) setIsHost(Boolean(me.isHost));
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

    // 9. Dynamic Host Migration — server reassigned host to another participant
    socket.on('host-migrated', ({ newHostSocketId, newHost, users: updatedUsers, log }) => {
      setUsers(updatedUsers);
      if (log) setLogs((prev) => [log, ...prev]);
      // Check if WE are the new host
      setIsHost(newHostSocketId === socket.id);
    });

    // 10. Rate Limit Warning — this socket is broadcasting too fast
    socket.on('rate-limit-warning', ({ message, log }) => {
      setRateLimitWarning({ message, timestamp: Date.now() });
      if (log) setLogs((prev) => [log, ...prev]);
      // Auto-dismiss after 5 seconds
      setTimeout(() => setRateLimitWarning(null), 5000);
    });

    // 11. Live Activity Log Push — server-side events (rate-limit, etc.) broadcast to room
    socket.on('activity-log', ({ log }) => {
      if (log) setLogs((prev) => [log, ...prev]);
    });

    // 12. Room Closed / Destroyed
    socket.on('room-closed', ({ roomId: closedId, message }) => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setRoomId(null);
      setPasscode('');
      setFiles({});
      setUsers([]);
      setIsHost(false);
      setRemoteCursors({});
      setConnectionStatus('idle');
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, passcode]);

  // Code change broadcaster
  const updateCode = useCallback((fileName, newCode) => {
    setFiles((prev) => {
      if (!prev[fileName]) return prev;
      return {
        ...prev,
        [fileName]: { ...prev[fileName], content: newCode },
      };
    });

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

  // Room switching with credentials
  const switchRoom = useCallback((newRoomId, newPasscode = '') => {
    setRoomId(newRoomId);
    setPasscode(newPasscode);
    setAuthError(null);
    setRemoteCursors({});
  }, []);

  const submitPasscode = useCallback((enteredPasscode) => {
    setPasscode(enteredPasscode);
    setAuthError(null);
  }, []);

  const leaveRoom = useCallback(() => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('leave-room', { roomId });
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setRoomId(null);
    setPasscode('');
    setFiles({});
    setUsers([]);
    setIsHost(false);
    setRemoteCursors({});
    setConnectionStatus('idle');
  }, [roomId]);

  const closeRoom = useCallback(() => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('close-room', { roomId });
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setRoomId(null);
    setPasscode('');
    setFiles({});
    setUsers([]);
    setIsHost(false);
    setRemoteCursors({});
    setConnectionStatus('idle');
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
    passcode,
    isRoomProtected,
    authError,
    setAuthError,
    submitPasscode,
    switchRoom,
    leaveRoom,
    closeRoom,
    currentUser,
    setCurrentUser,
    isHost,
    reconnectAttempts,
    rateLimitWarning,
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
