import React, { useState, useEffect } from 'react';
import { 
  X, 
  DoorOpen, 
  Lock, 
  Globe, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldAlert, 
  RefreshCw,
  Users,
  Plus
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

export function JoinRoomModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  onSwitchToCreate,
  initialRoomId = '' 
}) {
  const [roomId, setRoomId] = useState(initialRoomId);
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [roomNotFound, setRoomNotFound] = useState(false);

  // Available rooms for quick pick
  const [recentRooms, setRecentRooms] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setRoomId(initialRoomId);
      setPasscode('');
      setError('');
      setRoomNotFound(false);
      fetchRooms();
    }
  }, [isOpen, initialRoomId]);

  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/rooms`);
      if (res.ok) {
        const data = await res.json();
        setRecentRooms(data.rooms || []);
      }
    } catch (err) {
      console.warn('Could not fetch active rooms:', err);
    }
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    const cleanId = roomId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    if (!cleanId) {
      setError('Please enter a valid Room ID.');
      return;
    }

    setIsVerifying(true);
    setError('');
    setRoomNotFound(false);

    try {
      // Validate credentials on backend before admitting the user
      const res = await fetch(`${API_BASE_URL}/api/rooms/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: cleanId,
          passcode: passcode.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to verify room credentials.');
        setIsVerifying(false);
        return;
      }

      // Check verification results
      if (!data.exists) {
        // Room does not exist yet
        setRoomNotFound(true);
        setError(`Room "${cleanId}" does not exist yet.`);
        setIsVerifying(false);
        return;
      }

      if (data.isProtected && !data.valid) {
        // Protected room with incorrect passcode
        setError('Protected workspace: Incorrect or missing passcode.');
        setIsVerifying(false);
        return;
      }

      // Credentials are valid -> admit user into the session
      onSuccess(cleanId, passcode.trim());
      onClose();
    } catch (err) {
      // In case of backend offline, admit directly via Socket.IO
      onSuccess(cleanId, passcode.trim());
      onClose();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSelectQuickRoom = (quickRoom) => {
    setRoomId(quickRoom.id);
    setError('');
    setRoomNotFound(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none overflow-y-auto">
      <div className="w-full max-w-md bg-[#0d1222] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DoorOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Join Collaborative Workspace</h3>
              <p className="text-[11px] text-slate-400">Enter room credentials to join your peers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleJoinSubmit} className="p-6 space-y-4">
          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{error}</p>
                {roomNotFound && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onSwitchToCreate) onSwitchToCreate(roomId);
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-bold underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create #{roomId} instead</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Room ID Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Room ID <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">#</span>
              <input
                type="text"
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value);
                  if (error) setError('');
                  setRoomNotFound(false);
                }}
                placeholder="e.g. workspace-alpha"
                autoFocus
                className="w-full bg-slate-950/80 border border-white/10 focus:border-emerald-500 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white placeholder-slate-500 font-mono outline-none transition-all"
              />
            </div>
          </div>

          {/* Passcode Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Passcode</span>
              </label>
              <span className="text-[11px] text-slate-500">Only required if protected</span>
            </div>
            <div className="relative">
              <input
                type={showPasscode ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Leave blank if public room"
                className="w-full bg-slate-950/80 border border-white/10 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 font-mono outline-none pr-10 transition-all"
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

          {/* Quick Rooms Picker */}
          {recentRooms.length > 0 && (
            <div className="pt-2">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                Active Public Rooms:
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {recentRooms.slice(0, 6).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelectQuickRoom(r)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-all ${
                      roomId === r.id
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {r.isProtected ? <Lock className="w-3 h-3 text-amber-400" /> : <Globe className="w-3 h-3 text-emerald-400" />}
                    <span>#{r.id}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-emerald-600/25 transition-all text-xs"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Verify & Join Room</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
