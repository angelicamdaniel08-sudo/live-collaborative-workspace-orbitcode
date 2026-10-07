import React, { useState, useEffect, useCallback } from 'react';
import { useCollaboration } from './hooks/useCollaboration';
import { Navbar } from './components/Navbar';
import { EditorPanel } from './components/EditorPanel';
import { ActiveUsersPanel } from './components/ActiveUsersPanel';
import { ActivityLogsPanel } from './components/ActivityLogsPanel';
import { TerminalPanel } from './components/TerminalPanel';

export function App() {
  // Read room from URL query parameter or fallback to default
  const getInitialRoom = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('room') || 'workspace-alpha';
  };

  const [roomId, setRoomId] = useState(getInitialRoom);
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);

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
    // When language changes from navbar, update current file or state
    if (activeFileName && files[activeFileName]) {
      updateCode(activeFileName, activeFile.content);
    }
  };

  const handleRunCode = useCallback(() => {
    if (!isTerminalOpen) setIsTerminalOpen(true);
    runCode(activeFileName, activeFile.content, activeFile.language);
  }, [activeFileName, activeFile, isTerminalOpen, runCode]);

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <Navbar
        roomId={roomId}
        setRoomId={setRoomId}
        connectionStatus={connectionStatus}
        usersCount={users.length}
        activeLanguage={activeFile?.language || 'javascript'}
        onLanguageChange={handleLanguageChange}
        editorTheme={editorTheme}
        setEditorTheme={setEditorTheme}
        onRunCode={handleRunCode}
        isExecuting={isTerminalRunning}
        isTerminalOpen={isTerminalOpen}
        setIsTerminalOpen={setIsTerminalOpen}
      />

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
    </div>
  );
}

export default App;
