import React, { useRef, useEffect, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { 
  FileCode, 
  Plus, 
  X, 
  Code2, 
  FileText, 
  FileJson, 
  Sparkles,
  Maximize2,
  Minimize2,
  FileSpreadsheet
} from 'lucide-react';

export function EditorPanel({
  files,
  activeFileName,
  activeFile,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onCodeChange,
  onCursorChange,
  onTypingStatus,
  remoteCursors,
  editorTheme = 'vs-dark',
  onRunCode,
}) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);
  const widgetsRef = useRef(new Map());

  const [cursorPos, setCursorPos] = useState({ lineNumber: 1, column: 1 });
  const [newFileName, setNewFileName] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [docStats, setDocStats] = useState({ lines: 1, chars: 0 });

  // Convert hex color to rgba for selection background
  const hexToRgba = (hex, alpha = 0.28) => {
    if (!hex || typeof hex !== 'string') return `rgba(59, 130, 246, ${alpha})`;
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    const num = parseInt(cleanHex, 16);
    if (isNaN(num)) return `rgba(59, 130, 246, ${alpha})`;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Handle Monaco Editor mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Track Cursor movement
    editor.onDidChangeCursorPosition((e) => {
      setCursorPos({
        lineNumber: e.position.lineNumber,
        column: e.position.column,
      });

      onCursorChange(activeFileName, {
        lineNumber: e.position.lineNumber,
        column: e.position.column,
      }, editor.getSelection());
    });

    // Track text selection changes (mouse drag, shift+arrows)
    editor.onDidChangeCursorSelection((e) => {
      const pos = editor.getPosition();
      if (pos) {
        setCursorPos({
          lineNumber: pos.lineNumber,
          column: pos.column,
        });
        onCursorChange(activeFileName, {
          lineNumber: pos.lineNumber,
          column: pos.column,
        }, e.selection);
      }
    });

    // Track Typing Status
    let typingTimeout = null;
    editor.onKeyDown(() => {
      onTypingStatus(true);
      if (typingTimeout) clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        onTypingStatus(false);
      }, 1200);
    });

    // Keyboard shortcut for Run Code (Ctrl+Enter / Cmd+Enter)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRunCode) onRunCode();
    });

    // Configure options
    editor.updateOptions({
      fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
      fontSize: 14,
      lineHeight: 22,
      fontLigatures: true,
      minimap: { enabled: true, maxColumn: 80, scale: 0.8 },
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      renderLineHighlight: 'all',
      bracketPairColorization: { enabled: true },
      padding: { top: 12, bottom: 12 },
      scrollBeyondLastLine: false,
    });
  };

  // Render Remote Cursors & Text Selections in Monaco Editor
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    // 1. Manage Dynamic CSS for Remote User Selections
    let styleTag = document.getElementById('monaco-remote-selection-styles');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'monaco-remote-selection-styles';
      document.head.appendChild(styleTag);
    }

    const cssRules = [];
    const newDecorations = [];

    // 2. Remove obsolete cursor widgets
    widgetsRef.current.forEach((widget, socketId) => {
      if (!remoteCursors[socketId] || remoteCursors[socketId].fileName !== activeFileName) {
        editor.removeContentWidget(widget);
        widgetsRef.current.delete(socketId);
      }
    });

    // 3. Process remote cursor positions & text selections
    Object.entries(remoteCursors).forEach(([socketId, remoteData]) => {
      if (!remoteData || !remoteData.cursor || remoteData.fileName !== activeFileName) return;

      const { user, cursor, selection } = remoteData;
      const cleanId = socketId.replace(/[^a-zA-Z0-9_-]/g, '_');
      const userColor = user?.color || '#3b82f6';

      // Generate CSS rule for this user's selection color
      cssRules.push(`
        .remote-sel-${cleanId} {
          background-color: ${hexToRgba(userColor, 0.28)} !important;
          border-radius: 2px;
        }
      `);

      // Delta Decoration for Remote Text Selection
      if (selection && (
        selection.startLineNumber !== selection.endLineNumber ||
        selection.startColumn !== selection.endColumn
      )) {
        newDecorations.push({
          range: new monaco.Range(
            selection.startLineNumber,
            selection.startColumn,
            selection.endLineNumber,
            selection.endColumn
          ),
          options: {
            className: `monaco-remote-selection remote-sel-${cleanId}`,
            hoverMessage: [{ value: `**${user?.username || 'Collaborator'}**'s selection` }],
          },
        });
      }

      // Content Widget for Remote Caret & Name Tag
      let widget = widgetsRef.current.get(socketId);
      const isTyping = user?.status === 'typing';

      if (!widget) {
        const domNode = document.createElement('div');
        domNode.className = 'monaco-remote-cursor';
        domNode.style.height = '20px';
        domNode.style.backgroundColor = userColor;
        domNode.style.boxShadow = `0 0 8px ${userColor}`;

        const flagNode = document.createElement('div');
        flagNode.className = 'monaco-remote-cursor-flag';
        flagNode.style.backgroundColor = userColor;
        flagNode.innerText = `${user?.avatar || '👤'} ${user?.username || 'Collaborator'}${isTyping ? ' (typing...)' : ''}`;
        domNode.appendChild(flagNode);

        widget = {
          domNode,
          flagNode,
          getId: () => `cursor_widget_${socketId}`,
          getDomNode: () => domNode,
          getPosition: () => ({
            position: {
              lineNumber: cursor.lineNumber || 1,
              column: cursor.column || 1,
            },
            preference: [monaco.editor.ContentWidgetPositionPreference.EXACT],
          }),
        };

        editor.addContentWidget(widget);
        widgetsRef.current.set(socketId, widget);
      } else {
        // Update widget styles and flag text
        if (widget.flagNode) {
          widget.flagNode.innerText = `${user?.avatar || '👤'} ${user?.username || 'Collaborator'}${isTyping ? ' (typing...)' : ''}`;
          widget.flagNode.style.backgroundColor = userColor;
        }
        if (widget.domNode) {
          widget.domNode.style.backgroundColor = userColor;
          widget.domNode.style.boxShadow = `0 0 8px ${userColor}`;
        }

        widget.getPosition = () => ({
          position: {
            lineNumber: cursor.lineNumber || 1,
            column: cursor.column || 1,
          },
          preference: [monaco.editor.ContentWidgetPositionPreference.EXACT],
        });
        editor.layoutContentWidget(widget);
      }
    });

    // Apply dynamic style rules
    styleTag.textContent = cssRules.join('\n');

    // Apply selection deltaDecorations
    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
  }, [remoteCursors, activeFileName]);

  // Update doc stats on change
  useEffect(() => {
    if (activeFile?.content) {
      const lines = activeFile.content.split('\n').length;
      const chars = activeFile.content.length;
      setDocStats({ lines, chars });
    }
  }, [activeFile?.content]);

  const handleEditorChange = (value) => {
    onCodeChange(activeFileName, value || '');
  };

  const handleCreateFileSubmit = (e) => {
    e.preventDefault();
    if (newFileName.trim()) {
      let fileName = newFileName.trim();
      let lang = 'javascript';
      if (fileName.endsWith('.py')) lang = 'python';
      else if (fileName.endsWith('.css')) lang = 'css';
      else if (fileName.endsWith('.json')) lang = 'json';
      else if (fileName.endsWith('.html')) lang = 'html';
      else if (fileName.endsWith('.ts')) lang = 'typescript';
      else if (!fileName.includes('.')) {
        fileName += '.js';
        lang = 'javascript';
      }

      onCreateFile(fileName, lang);
      setNewFileName('');
      setIsCreatingFile(false);
    }
  };

  const getFileIcon = (name) => {
    if (name.endsWith('.js') || name.endsWith('.ts')) return <Code2 className="w-3.5 h-3.5 text-amber-400" />;
    if (name.endsWith('.py')) return <FileCode className="w-3.5 h-3.5 text-blue-400" />;
    if (name.endsWith('.css')) return <Sparkles className="w-3.5 h-3.5 text-pink-400" />;
    if (name.endsWith('.json')) return <FileJson className="w-3.5 h-3.5 text-emerald-400" />;
    return <FileText className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div className="editor-pane flex flex-col h-full bg-[#181a20]">
      {/* File Tabs Bar */}
      <div className="h-10 bg-[#0f121d] border-b border-white/10 flex items-center px-2 gap-1 overflow-x-auto select-none">
        <div className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-none">
          {Object.keys(files).map((name) => {
            const isActive = name === activeFileName;
            return (
              <div
                key={name}
                onClick={() => onSelectFile(name)}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-md text-xs font-mono font-medium cursor-pointer transition-all border-t-2 ${
                  isActive
                    ? 'bg-[#1e1e1e] text-slate-100 border-blue-500 shadow-sm'
                    : 'bg-transparent text-slate-400 border-transparent hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                {getFileIcon(name)}
                <span>{name}</span>
                {Object.keys(files).length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFile(name);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 rounded transition-opacity"
                    title="Delete file"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Create File Input / Button */}
          {isCreatingFile ? (
            <form onSubmit={handleCreateFileSubmit} className="flex items-center">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onBlur={() => setIsCreatingFile(false)}
                placeholder="new-file.js"
                autoFocus
                className="bg-slate-800 text-slate-100 px-2 py-1 rounded text-xs font-mono border border-blue-500/50 outline-none w-28"
              />
            </form>
          ) : (
            <button
              onClick={() => setIsCreatingFile(true)}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded transition-colors"
              title="Add new file"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 min-h-0 relative">
        <Editor
          height="100%"
          language={activeFile?.language || 'javascript'}
          value={activeFile?.content || ''}
          theme={editorTheme}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </div>

      {/* Editor Status Bar */}
      <div className="h-6 bg-[#0c0f18] border-t border-white/5 px-3 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none">
        <div className="flex items-center gap-3">
          <span className="text-blue-400 font-semibold">{activeFileName}</span>
          <span>Ln {cursorPos.lineNumber}, Col {cursorPos.column}</span>
          <span className="hidden sm:inline">Lines: {docStats.lines}</span>
          <span className="hidden md:inline">Chars: {docStats.chars}</span>
        </div>

        <div className="flex items-center gap-3">
          <span>UTF-8</span>
          <span>Spaces: 2</span>
          <span className="capitalize text-slate-300">{activeFile?.language || 'javascript'}</span>
        </div>
      </div>
    </div>
  );
}
