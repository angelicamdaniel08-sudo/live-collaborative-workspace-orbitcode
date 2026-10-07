import React, { useState, useEffect, useCallback } from 'react';
import { useCollaboration } from './hooks/useCollaboration';
import { Navbar } from './components/Navbar';
import { EditorPanel } from './components/EditorPanel';
import { ActiveUsersPanel } from './components/ActiveUsersPanel';
import { ActivityLogsPanel } from './components/ActivityLogsPanel';
import { TerminalPanel } from './components/TerminalPanel';
import { RoomModal } from './components/RoomModal';
import { PasscodePromptModal } from './components/PasscodePromptModal';

export function App() {
  const getInitialRoom = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('room') || 'workspace-alpha';
  };

  const [roomId, setRoomId] = useState(getInitialRoom);
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);

  // Sync URL when room changes
  useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set('room', roomId);
    window.history.replaceState({}, '', url);
  }, [roomId]);

  const {
    currentUser,
    users,
    files,
    activeFile,
    activeFileName,
    logs,
    terminalLogs,
    isTerminalRunning,
    connectionStatus,
    remoteCursors,
    isRoomProtected,
    authError,
    setAuthError,
    submitPasscode,
    switchRoom,
    isHost,
    reconnectAttempts,
    rateLimitWarning,
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
  } = useCollaboration(roomId);

  const handleLanguageChange = (newLang) => {
    if (activeFileName && files[activeFileName]) {
      updateCode(activeFileName, activeFile.content);
    }
  };

  const handleRunCode = useCallback(() => {
    if (!isTerminalOpen) setIsTerminalOpen(true);
    runCode(activeFileName, activeFile.content, activeFile.language);
  }, [activeFileName, activeFile, isTerminalOpen, runCode]);

  const handleJoinFromModal = (newRoomId, newPasscode) => {
    setRoomId(newRoomId);
    switchRoom(newRoomId, newPasscode);
  };

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <Navbar
        roomId={roomId}
        isRoomProtected={isRoomProtected}
        connectionStatus={connectionStatus}
        reconnectAttempts={reconnectAttempts}
        isHost={isHost}
        usersCount={users.length}
        activeLanguage={activeFile?.language || 'javascript'}
        onLanguageChange={handleLanguageChange}
        editorTheme={editorTheme}
        setEditorTheme={setEditorTheme}
        onRunCode={handleRunCode}
        isExecuting={isTerminalRunning}
        isTerminalOpen={isTerminalOpen}
        setIsTerminalOpen={setIsTerminalOpen}
        onOpenRoomModal={() => setIsRoomModalOpen(true)}
      />

      {/* Reconnecting Banner — shown during auto-reconnect attempts */}
      {connectionStatus === 'reconnecting' && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            position: 'fixed', top: '56px', left: 0, right: 0, zIndex: 9999,
            background: 'linear-gradient(90deg, rgba(251,191,36,0.15), rgba(245,158,11,0.08))',
            borderBottom: '1px solid rgba(251,191,36,0.3)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '8px', padding: '6px 16px', fontSize: '12px', color: '#fbbf24',
          }}
        >
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', animation: 'pulse 1s infinite' }} />
          <strong>Connection lost.</strong>
          &nbsp;Auto-reconnecting
          {reconnectAttempts > 0 ? ` — attempt ${reconnectAttempts} of 10` : '...'}
          <span style={{ marginLeft: 8, color: '#94a3b8' }}>Your changes will resume once reconnected.</span>
        </div>
      )}

      {/* Rate-Limit Toast — floating bottom-right, auto-dismisses after 5s */}
      {rateLimitWarning && (
        <div
          role="alert"
          aria-live="polite"
          style={{
            position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
            background: 'rgba(15,23,42,0.96)',
            border: '1px solid rgba(245,158,11,0.5)',
            borderLeft: '3px solid #f59e0b',
            borderRadius: '8px',
            padding: '12px 16px',
            maxWidth: '360px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(12px)',
            animation: 'slideInRight 0.25s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: 16, marginTop: 1 }}>⚡</span>
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#fbbf24' }}>Rate Limit Warning</p>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>
                {rateLimitWarning.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Split Layout */}
      <main className="workspace-main">
        {/* Left Side: Code Editor & Collapsible Shared Terminal */}
        <section className="flex-1 flex flex-col min-w-0 h-full relative" aria-label="Code Editor Section">
          <div className="flex-1 min-h-0 relative">
            <EditorPanel
              files={files}
              activeFileName={activeFileName}
              activeFile={activeFile}
              onSelectFile={selectFile}
              onCreateFile={createFile}
              onDeleteFile={deleteFile}
              onCodeChange={updateCode}
              onCursorChange={updateCursor}
              onTypingStatus={setTypingStatus}
              remoteCursors={remoteCursors}
              editorTheme={editorTheme}
              onRunCode={handleRunCode}
            />
          </div>

          {/* Bottom Collaborative Terminal Console */}
          <TerminalPanel
            terminalLogs={terminalLogs}
            isTerminalRunning={isTerminalRunning}
            onClearTerminal={clearTerminal}
            isOpen={isTerminalOpen}
            onToggleOpen={() => setIsTerminalOpen(!isTerminalOpen)}
          />
        </section>

        {/* Right Side: Split between Active Users and Activity Logs */}
        <aside className="sidebar-pane" aria-label="Collaboration and Activity Sidebar">
          {/* Top Half: Active Users */}
          <ActiveUsersPanel
            currentUser={currentUser}
            users={users}
            onUpdateUser={updateUserProfile}
          />

          {/* Bottom Half: Activity Logs */}
          <ActivityLogsPanel
            logs={logs}
            onClearLogs={clearLogs}
          />
        </aside>
      </main>

      {/* Room Manager Modal (Switch / Create / Passcode Protection) */}
      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        currentRoomId={roomId}
        onJoinRoom={handleJoinFromModal}
      />

      {/* Passcode Prompt Modal (Triggered on Auth Challenge) */}
      <PasscodePromptModal
        isOpen={Boolean(authError)}
        roomId={roomId}
        errorMessage={authError?.message || ''}
        onSubmitPasscode={submitPasscode}
        onSwitchRoom={() => {
          setAuthError(null);
          setIsRoomModalOpen(true);
        }}
      />
    </div>
  );
}

export default App;
