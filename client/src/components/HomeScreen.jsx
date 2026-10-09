import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  PlusCircle, 
  DoorOpen, 
  Lock, 
  Globe, 
  Users, 
  FileCode2, 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck, 
  UserCheck, 
  LogOut,
  ExternalLink,
  Server
} from 'lucide-react';
import { safeFetchJson, isBackendConfigured, getServerUrl } from '../utils/apiConfig';
import { ServerConfigModal } from './ServerConfigModal';

export function HomeScreen({
  currentUser,
  onOpenCreateRoom,
  onOpenJoinRoom,
  onQuickJoinRoom,
  onSignOut,
  invitedRoomId
}) {
  const [activeRooms, setActiveRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [serverState, setServerState] = useState(() => (isBackendConfigured() ? 'checking' : 'unconfigured'));

  const fetchRooms = async () => {
    try {
      setIsLoadingRooms(true);
      const data = await safeFetchJson('/api/rooms');
      setActiveRooms(data.rooms || []);
      setServerState('connected');
    } catch (err) {
      console.warn('Backend rooms fetch notice:', err.message);
      setActiveRooms([]);
      setServerState(isBackendConfigured() ? 'offline' : 'unconfigured');
    } finally {
      setIsLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#070a12] text-slate-100 relative overflow-y-auto overflow-x-hidden select-none">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-white/10 bg-[#0c101c]/80 backdrop-blur-md px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-white/10">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-blue-300 bg-clip-text text-transparent">
              OrbitCode <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono font-normal">LIVE</span>
            </h1>
          </div>
        </div>

        {/* Header Controls: Server Status & User Profile */}
        <div className="flex items-center gap-3">
          {/* Server Endpoint Status Pill */}
          <button
            onClick={() => setIsServerModalOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
              serverState === 'connected'
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/50'
                : serverState === 'offline'
                ? 'bg-rose-950/40 border-rose-500/30 text-rose-300 hover:bg-rose-900/50'
                : 'bg-amber-950/40 border-amber-500/30 text-amber-300 hover:bg-amber-900/50'
            }`}
            title="Configure or test Railway backend server URL"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                serverState === 'connected'
                  ? 'bg-emerald-400 animate-pulse'
                  : serverState === 'offline'
                  ? 'bg-rose-400'
                  : 'bg-amber-400'
              }`}
            />
            <span className="hidden sm:inline">
              {serverState === 'connected'
                ? 'Server Online'
                : serverState === 'offline'
                ? 'Server Offline'
                : 'Set Server URL'}
            </span>
            <Server className="w-3.5 h-3.5 opacity-70" />
          </button>

          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/10 shadow-inner">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-sm"
              style={{ backgroundColor: `${currentUser.color}33`, border: `1.5px solid ${currentUser.color}` }}
            >
              {currentUser.avatar}
            </div>
            <span className="text-xs font-semibold text-slate-200">{currentUser.username}</span>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentUser.color }} />
          </div>

          <button
            onClick={onSignOut}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 bg-slate-900/60 hover:bg-slate-800 border border-white/10 rounded-full px-3 py-1.5 transition-all"
            title="Change identity or sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Change Name</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 z-10 flex flex-col justify-center">
        {/* Personalized Greeting */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Welcome, <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">{currentUser.username}</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3 max-w-xl mx-auto">
            Real-time collaborative code editor.
          </p>

          {/* Invited Room Quick Banner */}
          {invitedRoomId && (
            <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 p-3 rounded-2xl bg-blue-950/40 border border-blue-500/30 backdrop-blur-md">
              <span className="text-xs text-blue-300 font-medium">
                You have a pending invite for room: <strong className="text-white font-mono">#{invitedRoomId}</strong>
              </span>
              <button
                onClick={() => onQuickJoinRoom(invitedRoomId)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md transition-all"
              >
                <span>Enter #{invitedRoomId}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Two Distinct Core Options: Create Room and Join Room */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Option 1: Create Room */}
          <div 
            onClick={onOpenCreateRoom}
            className="group relative bg-[#0d1222]/90 hover:bg-[#11172c] border border-white/10 hover:border-blue-500/50 rounded-2xl p-7 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-blue-500/10 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />

            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 mb-6 group-hover:scale-110 transition-transform">
                <PlusCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors flex items-center gap-2">
                Create Room
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-2.5 leading-relaxed">
                Start a new session with optional password protection.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-blue-400 text-sm font-semibold group-hover:text-blue-300">
              <span>Start Workspace</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Option 2: Join Room */}
          <div 
            onClick={onOpenJoinRoom}
            className="group relative bg-[#0d1222]/90 hover:bg-[#11172c] border border-white/10 hover:border-emerald-500/50 rounded-2xl p-7 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-emerald-500/10 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />

            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-6 group-hover:scale-110 transition-transform">
                <DoorOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                Join Room
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-2.5 leading-relaxed">
                Join an active workspace using a Room ID.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-emerald-400 text-sm font-semibold group-hover:text-emerald-300">
              <span>Enter Workspace</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>

        {/* Live Active Workspaces Directory */}
        <div className="bg-[#0c101c]/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <h4 className="text-sm font-bold text-white">Active Public Workspaces</h4>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                {activeRooms.length}
              </span>
            </div>
            <button
              onClick={fetchRooms}
              disabled={isLoadingRooms}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
              title="Refresh rooms list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRooms ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {serverState !== 'connected' && (
            <div className="mb-5 p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-amber-300">
                <Server className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  {serverState === 'offline'
                    ? 'Backend server is not responding. Ensure your Railway service is running and awake.'
                    : 'Backend URL is not configured. Connect your Railway service URL to enable multi-user sync.'}
                </span>
              </div>
              <button
                onClick={() => setIsServerModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-200 font-semibold transition-all shrink-0"
              >
                Configure Backend URL
              </button>
            </div>
          )}

          {activeRooms.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-white/5 rounded-xl">
              <p>No active public rooms currently online.</p>
              <p className="mt-1">Be the first to click "Create Room" above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => onQuickJoinRoom(room.id, room.isProtected)}
                  className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      {room.isProtected ? (
                        <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      ) : (
                        <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                      <span className="text-xs font-mono font-bold text-white group-hover:text-blue-400 truncate">
                        #{room.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-500" />
                        {room.activeUsersCount} online
                      </span>
                      <span className="flex items-center gap-1">
                        <FileCode2 className="w-3 h-3 text-slate-500" />
                        {room.filesCount} files
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-blue-400 group-hover:translate-x-0.5 transition-transform shrink-0">
                    Join →
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Backend Server Configuration Modal */}
      <ServerConfigModal
        isOpen={isServerModalOpen}
        onClose={() => setIsServerModalOpen(false)}
        onServerUrlChanged={() => {
          fetchRooms();
        }}
      />
    </div>
  );
}
