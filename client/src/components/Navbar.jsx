import React, { useState } from 'react';
import { 
  Play, 
  Share2, 
  Users, 
  Terminal as TerminalIcon, 
  Check, 
  Zap, 
  Lock,
  Globe,
  RefreshCw,
  DoorOpen,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LANGUAGES, THEMES } from '../utils/helpers';

export function Navbar({
  roomId,
  isRoomProtected,
  connectionStatus,
  usersCount,
  activeLanguage,
  onLanguageChange,
  editorTheme,
  setEditorTheme,
  onRunCode,
  isExecuting,
  isTerminalOpen,
  setIsTerminalOpen,
  onOpenRoomModal
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.1, x: 0.8 },
      colors: ['#3b82f6', '#8b5cf6', '#10b981']
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="h-14 border-b border-white/10 bg-[#0c101c]/90 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
      {/* Left: Brand & Room Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide bg-gradient-to-r from-white via-slate-200 to-blue-300 bg-clip-text text-transparent">
              OrbitCode <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono font-normal">LIVE</span>
            </h1>
          </div>
        </div>

        <div className="h-4 w-px bg-white/10" />

        {/* Room Switcher / Management Trigger */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenRoomModal}
            className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-blue-500/40 rounded-lg px-2.5 py-1 text-xs transition-all group"
            title="Click to Switch or Create Room"
          >
            {isRoomProtected ? (
              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            ) : (
              <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            )}
            <span className="text-slate-200 font-mono font-medium group-hover:text-blue-400">
              #{roomId}
            </span>
            <span className="text-[10px] text-slate-500 group-hover:text-slate-300 ml-1">
              Switch ▾
            </span>
          </button>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900/60 border border-white/5">
          <span className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' 
              ? 'bg-emerald-400 animate-pulse-glow shadow-[0_0_8px_rgba(52,211,153,0.8)]' 
              : connectionStatus === 'connecting'
              ? 'bg-amber-400 animate-pulse'
              : 'bg-rose-500'
          }`} />
          <span className={
            connectionStatus === 'connected' 
              ? 'text-emerald-400' 
              : connectionStatus === 'connecting' 
              ? 'text-amber-400' 
              : 'text-rose-400'
          }>
            {connectionStatus === 'connected' ? 'Synced' : connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Center: Language & Editor Controls */}
      <div className="flex items-center gap-3">
        {/* Language Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-white/10 rounded-lg px-2 py-1 text-xs">
          <span className="text-slate-400">Language:</span>
          <select
            value={activeLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-transparent text-slate-200 outline-none cursor-pointer text-xs font-medium hover:text-white"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id} className="bg-slate-900 text-slate-200">
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Theme Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-white/10 rounded-lg px-2 py-1 text-xs">
          <span className="text-slate-400">Theme:</span>
          <select
            value={editorTheme}
            onChange={(e) => setEditorTheme(e.target.value)}
            className="bg-transparent text-slate-200 outline-none cursor-pointer text-xs font-medium hover:text-white"
          >
            {THEMES.map((theme) => (
              <option key={theme.id} value={theme.id} className="bg-slate-900 text-slate-200">
                {theme.label}
              </option>
            ))}
          </select>
        </div>

        {/* Run Code Button */}
        <button
          onClick={onRunCode}
          disabled={isExecuting}
          className="btn-primary"
          title="Run Collaborative Code (Ctrl + Enter)"
        >
          {isExecuting ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Run Code</span>
            </>
          )}
        </button>
      </div>

      {/* Right: Collaborators & Actions */}
      <div className="flex items-center gap-2.5">
        {/* Terminal Toggle Button */}
        <button
          onClick={() => setIsTerminalOpen(!isTerminalOpen)}
          className={`btn-secondary text-xs ${isTerminalOpen ? 'border-blue-500/40 text-blue-400 bg-blue-500/10' : ''}`}
          title="Toggle Shared Terminal Console"
        >
          <TerminalIcon className="w-3.5 h-3.5" />
          <span>Console</span>
        </button>

        {/* Active Collaborators count */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/40 border border-blue-500/20 text-xs text-blue-300">
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold">{usersCount}</span>
          <span className="text-slate-400 hidden sm:inline">online</span>
        </div>

        {/* Quick Share Link */}
        <button
          onClick={handleCopyLink}
          className="btn-secondary text-xs"
          title="Copy workspace invite link"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-slate-300" />
              <span>Share</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
