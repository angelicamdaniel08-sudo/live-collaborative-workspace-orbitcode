import React, { useState } from 'react';
import { 
  X, 
  Dices, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Sparkles, 
  ArrowRight, 
  FileCode, 
  ShieldCheck, 
  Globe,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { safeFetchJson } from '../utils/apiConfig';

export function CreateRoomModal({ isOpen, onClose, onEnterRoom }) {
  // Phase: 'form' | 'details'
  const [phase, setPhase] = useState('form');

  // Form State
  const [roomId, setRoomId] = useState('');
  const [isProtected, setIsProtected] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [template, setTemplate] = useState('javascript');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // Created Room Data (for Phase 2 Details Screen)
  const [createdRoomId, setCreatedRoomId] = useState('');
  const [createdPasscode, setCreatedPasscode] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPasscode, setCopiedPasscode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const generateRandomId = () => {
    const prefixes = ['orbit', 'quantum', 'cyber', 'hyper', 'nexus', 'matrix', 'alpha', 'pulse'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(100 + Math.random() * 900);
    setRoomId(`${prefix}-${num}`);
    setError('');
  };

  const handleReset = () => {
    setPhase('form');
    setRoomId('');
    setIsProtected(false);
    setPasscode('');
    setError('');
    setCreatedRoomId('');
    setCreatedPasscode('');
    setCopiedId(false);
    setCopiedPasscode(false);
    setCopiedLink(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const cleanId = roomId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    if (!cleanId) {
      setError('Please specify a custom Room ID.');
      return;
    }
    if (isProtected && !passcode.trim()) {
      setError('Please provide a passcode or turn off passcode protection.');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const data = await safeFetchJson('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: cleanId,
          passcode: isProtected ? passcode.trim() : null,
          template,
        }),
      });

      // Transition to Phase 2: Show Room Details with Copy Buttons
      setCreatedRoomId(data.roomId);
      setCreatedPasscode(isProtected ? passcode.trim() : '');
      setPhase('details');

      // Trigger celebratory confetti
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'],
      });
    } catch (err) {
      if (err.status === 409 || err.status === 400) {
        setError(err.message || 'Failed to create room.');
        setIsCreating(false);
        return;
      }

      // Offline or network fallback
      console.warn('Backend createRoom notice:', err.message);
      setCreatedRoomId(cleanId);
      setCreatedPasscode(isProtected ? passcode.trim() : '');
      setPhase('details');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(createdRoomId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyPasscode = () => {
    navigator.clipboard.writeText(createdPasscode);
    setCopiedPasscode(true);
    setTimeout(() => setCopiedPasscode(false), 2000);
  };

  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}${window.location.pathname}?room=${createdRoomId}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleEnterWorkspace = () => {
    onEnterRoom(createdRoomId, createdPasscode);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none overflow-y-auto">
      <div className="w-full max-w-lg bg-[#0d1222] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {phase === 'form' ? 'Create Collaborative Workspace' : 'Workspace Ready! 🎉'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {phase === 'form' 
                  ? 'Set up custom workspace room parameters' 
                  : 'Save or share your room details before entering'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Phase 1: Create Room Configuration Form */}
        {phase === 'form' && (
          <form onSubmit={handleCreateSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Room ID Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Custom Room ID <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={generateRandomId}
                  className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Dices className="w-3.5 h-3.5" />
                  <span>Random ID</span>
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">#</span>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => {
                    setRoomId(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="e.g. quantum-lab, team-algo"
                  autoFocus
                  className="w-full bg-slate-950/80 border border-white/10 focus:border-blue-500 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white placeholder-slate-500 font-mono outline-none transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Alphanumeric characters, dashes, and underscores only.
              </p>
            </div>

            {/* Passcode Protection Toggle */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isProtected ? (
                    <Lock className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Globe className="w-4 h-4 text-emerald-400" />
                  )}
                  <div>
                    <span className="text-xs font-bold text-white">Require Passcode</span>
                    <p className="text-[11px] text-slate-400">
                      {isProtected ? 'Private: Only peers with the passcode can join' : 'Public: Anyone with the Room ID can join'}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isProtected}
                    onChange={(e) => {
                      setIsProtected(e.target.checked);
                      if (!e.target.checked) setPasscode('');
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {isProtected && (
                <div className="pt-2 border-t border-white/5 animate-fade-in">
                  <div className="relative">
                    <input
                      type={showPasscode ? 'text' : 'password'}
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Enter room passcode"
                      className="w-full bg-slate-950/80 border border-amber-500/30 focus:border-amber-500 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 font-mono outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasscode(!showPasscode)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPasscode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Starter Template */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Starter Code Template
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'javascript', name: 'JavaScript', desc: 'Node + CSS + JSON' },
                  { id: 'python', name: 'Python', desc: 'Algorithms & Math' },
                  { id: 'blank', name: 'Blank', desc: 'Clean session' },
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setTemplate(tpl.id)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      template === tpl.id
                        ? 'bg-blue-600/20 border-blue-500/60 shadow-inner'
                        : 'bg-slate-900/60 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{tpl.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{tpl.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/5">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="btn-primary"
              >
                {isCreating ? 'Creating Workspace...' : 'Create Room'}
              </button>
            </div>
          </form>
        )}

        {/* Phase 2: Room Details with One-Click Copy Buttons */}
        {phase === 'details' && (
          <div className="p-6 space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 mb-2 shadow-lg shadow-emerald-500/10">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Room Details Generated</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Copy and share these credentials with your team before entering the editor.
              </p>
            </div>

            {/* Room Credentials Card */}
            <div className="bg-slate-950/80 border border-white/10 rounded-xl p-4 space-y-3.5">
              {/* Room ID Row */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/70 border border-white/5">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Room ID</span>
                  <span className="text-sm font-mono font-bold text-white">#{createdRoomId}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold transition-all"
                  title="Copy Room ID to clipboard"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId ? 'Copied ID!' : 'Copy Room ID'}</span>
                </button>
              </div>

              {/* Passcode Row */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/70 border border-white/5">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Passcode</span>
                  {createdPasscode ? (
                    <span className="text-sm font-mono font-bold text-amber-300">{createdPasscode}</span>
                  ) : (
                    <span className="text-xs text-emerald-400 font-medium">None (Public Workspace)</span>
                  )}
                </div>
                {createdPasscode ? (
                  <button
                    type="button"
                    onClick={handleCopyPasscode}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-all"
                    title="Copy Passcode to clipboard"
                  >
                    {copiedPasscode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPasscode ? 'Copied Passcode!' : 'Copy Passcode'}</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-500 px-2 py-1 rounded bg-slate-800">
                    Open Access
                  </span>
                )}
              </div>

              {/* Full Invite Link Row */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/70 border border-white/5">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Invite Link</span>
                  <span className="text-xs font-mono text-slate-400 truncate block">
                    {window.location.origin}/?room={createdRoomId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-semibold transition-all shrink-0"
                  title="Copy full invite link"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Host Privilege Notice */}
            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/20 text-xs text-blue-300 flex items-center gap-2">
              <span className="text-base">👑</span>
              <span>You have been designated as the <strong>Workspace Host</strong> for this session.</span>
            </div>

            {/* Enter Editor Space CTA Button */}
            <button
              type="button"
              onClick={handleEnterWorkspace}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all text-sm group"
            >
              <span>Enter Editor Space</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
