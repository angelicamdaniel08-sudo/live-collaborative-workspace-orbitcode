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
  Plus,
  LogOut,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LANGUAGES, THEMES } from '../utils/helpers';

export function Navbar({
  roomId,
  isRoomProtected,
  connectionStatus,
  reconnectAttempts,
  usersCount,
  activeLanguage,
  onLanguageChange,
  editorTheme,
  setEditorTheme,
  onRunCode,
  isExecuting,
  isTerminalOpen,
  setIsTerminalOpen,
  onOpenRoomModal,
  isHost,
  onGoHome,
  onLeaveRoom,
  onCloseRoom,
}) {
  const [copied, setCopied] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

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
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 text-left group hover:opacity-90 transition-opacity"
          title="Return to Home Dashboard"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide bg-gradient-to-r from-white via-slate-200 to-blue-300 bg-clip-text text-transparent">
              OrbitCode <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono font-normal">LIVE</span>
            </h1>
          </div>
        </button>

        <div className="h-4 w-px bg-white/10" />

        {/* Dashboard button */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-white/10 text-xs text-slate-300 hover:text-white transition-all"
          title="Leave room and return to Home Dashboard"
        >
          <span>Dashboard</span>
        </button>

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
            {isHost && (
              <span title="You are the room host" className="text-[10px] text-amber-400 font-bold">👑</span>
            )}
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
              : connectionStatus === 'reconnecting'
              ? 'bg-amber-500 animate-pulse'
              : 'bg-rose-500'
          }`} />
          <span className={
            connectionStatus === 'connected'
              ? 'text-emerald-400'
              : connectionStatus === 'connecting'
              ? 'text-amber-400'
              : connectionStatus === 'reconnecting'
              ? 'text-amber-400'
              : 'text-rose-400'
          }>
            {connectionStatus === 'connected'
              ? 'Synced'
              : connectionStatus === 'connecting'
              ? 'Connecting...'
              : connectionStatus === 'reconnecting'
              ? `Reconnecting${reconnectAttempts > 0 ? ` (${reconnectAttempts}/10)` : '...'}`
              : 'Disconnected'}
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

        <div className="h-4 w-px bg-white/10" />

        {/* ── Room Session Controls: Leave Room & Close Room ── */}
        {usersCount <= 1 ? (
          /* Last remaining participant in the room: show BOTH Leave Room and Close Room */
          <div className="flex items-center gap-1.5">
            <button
              onClick={onLeaveRoom}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-slate-600 text-xs text-slate-300 hover:text-white transition-all shadow-sm"
              title="Leave room (leaves workspace alive on server)"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Leave Room</span>
            </button>
            <button
              onClick={() => setShowCloseConfirm(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 hover:border-rose-500/60 text-xs text-rose-300 hover:text-rose-200 transition-all shadow-sm font-semibold"
              title="Completely destroy and delete this workspace from the server"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Close Room</span>
            </button>
          </div>
        ) : (
          /* Multiple participants: show Leave Room */
          <button
            onClick={onLeaveRoom}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-rose-950/40 border border-white/10 hover:border-rose-500/30 text-xs text-slate-300 hover:text-rose-300 transition-all shadow-sm"
            title="Leave workspace"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Leave Room</span>
          </button>
        )}
      </div>

      {/* Close Room Confirmation Modal */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
          <div className="w-full max-w-sm bg-[#0d1222] border border-rose-500/40 rounded-2xl shadow-2xl p-6 text-center animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">Close & Destroy Workspace?</h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              You are the last participant. Closing <span className="font-mono text-white font-semibold">#{roomId}</span> will permanently destroy the room instance and clear all session files from the server.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowCloseConfirm(false)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCloseConfirm(false);
                  if (onCloseRoom) onCloseRoom();
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Destroy Room</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
