import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  KeyRound, 
  DoorOpen, 
  PlusCircle, 
  X, 
  Sparkles, 
  Users, 
  Globe, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

export function RoomModal({
  isOpen,
  onClose,
  currentRoomId,
  onJoinRoom,
}) {
  const [activeTab, setActiveTab] = useState('join'); // 'join' | 'create'
  
  // Join Tab State
  const [joinRoomId, setJoinRoomId] = useState(currentRoomId);
  const [joinPasscode, setJoinPasscode] = useState('');
  const [showJoinPasscode, setShowJoinPasscode] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [joinError, setJoinError] = useState('');

  // Create Tab State
  const [createRoomId, setCreateRoomId] = useState('');
  const [isProtected, setIsProtected] = useState(false);
  const [createPasscode, setCreatePasscode] = useState('');
  const [showCreatePasscode, setShowCreatePasscode] = useState(false);
  const [template, setTemplate] = useState('javascript');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Fetch available rooms
  const fetchRooms = async () => {
    try {
      setIsLoadingRooms(true);
      const res = await fetch('http://localhost:4000/api/rooms');
      if (res.ok) {
        const data = await res.json();
        setAvailableRooms(data.rooms || []);
      }
    } catch (err) {
      console.warn('Could not load rooms list:', err);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRooms();
      setJoinRoomId(currentRoomId);
      setJoinError('');
      setCreateError('');
    }
  }, [isOpen, currentRoomId]);

  const generateRandomId = () => {
    const prefixes = ['dev', 'orbit', 'quantum', 'code', 'cyber', 'team'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(100 + Math.random() * 900);
    setCreateRoomId(`${prefix}-${num}`);
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    if (!joinRoomId.trim()) {
      setJoinError('Please enter a Room ID.');
      return;
    }

    const cleanId = joinRoomId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');

    // Verify room credentials against backend before switching
    try {
      const res = await fetch('http://localhost:4000/api/rooms/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: cleanId, passcode: joinPasscode.trim() }),
      });
      const data = await res.json();

      if (data.exists && data.isProtected && !data.valid) {
        setJoinError('Incorrect passcode for this protected room.');
        return;
      }

      // Valid or public room -> proceed to join
      onJoinRoom(cleanId, joinPasscode.trim());
      onClose();
    } catch (err) {
      // Fallback: pass to client socket handler
      onJoinRoom(cleanId, joinPasscode.trim());
      onClose();
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createRoomId.trim()) {
      setCreateError('Please specify a custom Room ID.');
      return;
    }

    if (isProtected && !createPasscode.trim()) {
      setCreateError('Please enter a passcode or disable protection.');
      return;
    }

    const cleanId = createRoomId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    setIsCreating(true);
    setCreateError('');

    try {
      const res = await fetch('http://localhost:4000/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: cleanId,
          passcode: isProtected ? createPasscode.trim() : null,
          template,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || 'Failed to create room.');
        setIsCreating(false);
        return;
      }

      // Room created successfully -> join it
      onJoinRoom(cleanId, isProtected ? createPasscode.trim() : '');
      onClose();
    } catch (err) {
      // Socket fallback
      onJoinRoom(cleanId, isProtected ? createPasscode.trim() : '');
      onClose();
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#0d1222] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#11172c]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Workspace Session Manager</h2>
              <p className="text-[11px] text-slate-400">Switch, join, or create protected collaborative rooms</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 bg-[#090d18] text-xs font-semibold select-none">
          <button
            onClick={() => setActiveTab('join')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'join'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DoorOpen className="w-4 h-4" />
            <span>Join Room</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('create');
              if (!createRoomId) generateRandomId();
            }}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'create'
                ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Room</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto">
          {activeTab === 'join' ? (
            /* Join Tab */
            <form onSubmit={handleJoinSubmit} className="space-y-4 text-xs">
              {joinError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>{joinError}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Room Identifier</label>
                <div className="flex items-center bg-slate-900/80 border border-white/10 rounded-lg px-3 py-2 focus-within:border-blue-500/60 transition-colors">
                  <span className="text-slate-500 mr-1.5 font-mono">#</span>
                  <input
                    type="text"
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value)}
                    placeholder="e.g. project-orbit"
                    className="bg-transparent text-white outline-none w-full font-mono text-xs placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-medium">Room Passcode</label>
                  <span className="text-[10px] text-slate-500">Only required if protected</span>
                </div>
                <div className="flex items-center bg-slate-900/80 border border-white/10 rounded-lg px-3 py-2 focus-within:border-blue-500/60 transition-colors">
                  <Lock className="w-3.5 h-3.5 text-slate-500 mr-2" />
                  <input
                    type={showJoinPasscode ? 'text' : 'password'}
                    value={joinPasscode}
                    onChange={(e) => setJoinPasscode(e.target.value)}
                    placeholder="Enter passcode if required"
                    className="bg-transparent text-white outline-none w-full font-mono text-xs placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowJoinPasscode(!showJoinPasscode)}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    {showJoinPasscode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full btn-primary py-2.5 mt-2">
                <DoorOpen className="w-4 h-4 mr-1.5" />
                <span>Join Workspace Session</span>
              </button>

              {/* Active Workspace Rooms Explorer */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Available Active Workspaces</span>
                  <button
                    type="button"
                    onClick={fetchRooms}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingRooms ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {availableRooms.length === 0 ? (
                    <div className="text-center py-3 text-[11px] text-slate-600">
                      No other rooms discovered. You can join any custom Room ID!
                    </div>
                  ) : (
                    availableRooms.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => {
                          setJoinRoomId(r.id);
                          setJoinError('');
                        }}
                        className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                          joinRoomId === r.id
                            ? 'bg-blue-500/15 border-blue-500/50 text-white'
                            : 'bg-slate-900/40 border-white/5 text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {r.isProtected ? (
                            <Lock className="w-3 h-3 text-amber-400" />
                          ) : (
                            <Globe className="w-3 h-3 text-emerald-400" />
                          )}
                          <span className="font-mono font-medium text-xs">#{r.id}</span>
                          {r.isProtected ? (
                            <span className="badge badge-amber text-[9px] py-0">Protected</span>
                          ) : (
                            <span className="badge badge-emerald text-[9px] py-0">Public</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                          <Users className="w-3 h-3 text-blue-400" />
                          <span>{r.activeUsersCount} online</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </form>
          ) : (
            /* Create Tab */
            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              {createError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-medium">Custom Room Identifier</label>
                  <button
                    type="button"
                    onClick={generateRandomId}
                    className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate ID</span>
                  </button>
                </div>
                <div className="flex items-center bg-slate-900/80 border border-white/10 rounded-lg px-3 py-2 focus-within:border-purple-500/60 transition-colors">
                  <span className="text-slate-500 mr-1.5 font-mono">#</span>
                  <input
                    type="text"
                    value={createRoomId}
                    onChange={(e) => setCreateRoomId(e.target.value)}
                    placeholder="e.g. quantum-sprint"
                    className="bg-transparent text-white outline-none w-full font-mono text-xs placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Starter Template */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Workspace Template</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'javascript', label: '⚡ JavaScript', desc: 'Fullstack starter' },
                    { id: 'python', label: '🐍 Python', desc: 'Algorithms pack' },
                    { id: 'blank', label: '📄 Blank', desc: 'Clean slate' },
                  ].map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() => setTemplate(tpl.id)}
                      className={`p-2 rounded-lg border cursor-pointer transition-all ${
                        template === tpl.id
                          ? 'bg-purple-600/20 border-purple-500 text-white shadow-sm'
                          : 'bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-semibold text-xs">{tpl.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{tpl.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security & Passcode Toggle */}
              <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-semibold text-slate-200 block">Require Room Passcode</span>
                      <span className="text-[10px] text-slate-500">Protect this workspace with a secret key</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isProtected}
                    onChange={(e) => setIsProtected(e.target.checked)}
                    className="w-4 h-4 accent-purple-500 cursor-pointer"
                  />
                </div>

                {isProtected && (
                  <div className="pt-2 border-t border-white/5 animate-fade-in">
                    <label className="block text-slate-300 font-medium mb-1.5">Set Secret Passcode</label>
                    <div className="flex items-center bg-slate-950/80 border border-purple-500/40 rounded-lg px-3 py-2">
                      <Lock className="w-3.5 h-3.5 text-purple-400 mr-2" />
                      <input
                        type={showCreatePasscode ? 'text' : 'password'}
                        value={createPasscode}
                        onChange={(e) => setCreatePasscode(e.target.value)}
                        placeholder="Choose a secure passcode"
                        className="bg-transparent text-white outline-none w-full font-mono text-xs placeholder:text-slate-600"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowCreatePasscode(!showCreatePasscode)}
                        className="text-slate-500 hover:text-slate-300"
                      >
                        {showCreatePasscode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full btn-primary py-2.5 mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/25"
              >
                {isCreating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4 mr-1.5" />
                    <span>Create & Launch Workspace</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
