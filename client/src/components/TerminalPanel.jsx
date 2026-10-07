import React from 'react';
import { 
  Terminal as TerminalIcon, 
  Trash2, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Play
} from 'lucide-react';

export function TerminalPanel({
  terminalLogs,
  isTerminalRunning,
  onClearTerminal,
  isOpen,
  onToggleOpen,
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyLogs = () => {
    const text = terminalLogs
      .map((entry) => `[${entry.timestamp}] ${entry.runner} ran ${entry.fileName} (${entry.duration}):\n` + 
        entry.logs.map(l => `  ${l.message}`).join('\n'))
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="h-56 bg-[#090d16] border-t border-white/10 flex flex-col font-mono text-xs select-text shadow-2xl relative z-20">
      {/* Terminal Header */}
      <div className="h-8 bg-[#0e1320] px-3 border-b border-white/5 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold text-slate-300 text-[11px]">Collaborative Terminal & Execution Output</span>
          {isTerminalRunning && (
            <span className="badge badge-amber text-[9px] animate-pulse">Running...</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {terminalLogs.length > 0 && (
            <>
              <button
                onClick={handleCopyLogs}
                className="text-slate-400 hover:text-slate-200 text-[11px] flex items-center gap-1 p-1 hover:bg-white/5 rounded transition-colors"
                title="Copy terminal output"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={onClearTerminal}
                className="text-slate-400 hover:text-slate-200 text-[11px] flex items-center gap-1 p-1 hover:bg-white/5 rounded transition-colors"
                title="Clear terminal output"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </>
          )}

          <button
            onClick={onToggleOpen}
            className="text-slate-400 hover:text-slate-200 p-1 hover:bg-white/5 rounded transition-colors"
            title="Minimize terminal"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Content / Logs Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-[12px] bg-[#070a12]/95">
        {terminalLogs.length === 0 ? (
          <div className="text-slate-500 flex items-center gap-2 py-4">
            <span className="text-blue-500 font-bold">&gt;</span>
            <span>Shared collaborative console ready. Click <b>Run Code</b> to execute code and broadcast output to all participants.</span>
          </div>
        ) : (
          terminalLogs.map((entry, idx) => (
            <div key={idx} className="p-2.5 rounded bg-slate-900/60 border border-white/5 space-y-1.5 animate-fade-in">
              {/* Header info */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Play className="w-3 h-3 text-blue-400 fill-blue-400" />
                  <span className="text-blue-300 font-semibold">{entry.runner}</span>
                  <span>executed</span>
                  <span className="text-emerald-400 font-bold">{entry.fileName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-mono text-[10px]">{entry.timestamp}</span>
                  <span className="badge badge-purple text-[9px]">{entry.duration}</span>
                </div>
              </div>

              {/* Log Messages */}
              <div className="space-y-1 pt-1">
                {entry.logs.map((log, lIdx) => (
                  <div key={lIdx} className="flex items-start gap-2">
                    <span className="text-slate-500 select-none">&gt;</span>
                    <span className={`whitespace-pre-wrap ${
                      log.type === 'error' 
                        ? 'text-rose-400 font-semibold' 
                        : log.type === 'warn'
                        ? 'text-amber-400'
                        : log.type === 'info'
                        ? 'text-cyan-400'
                        : 'text-slate-200'
                    }`}>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
