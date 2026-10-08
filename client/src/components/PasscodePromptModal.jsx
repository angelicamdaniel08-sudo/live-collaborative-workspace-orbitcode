import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert, ArrowRight, DoorOpen, Eye, EyeOff } from 'lucide-react';

export function PasscodePromptModal({
  isOpen,
  roomId,
  errorMessage,
  onSubmitPasscode,
  onSwitchRoom,
}) {
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passcode.trim()) {
      onSubmitPasscode(passcode.trim());
    }
  };

  const isClosed = errorMessage?.toLowerCase().includes('closed') || errorMessage?.toLowerCase().includes('permanently');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fade-in overflow-y-auto">
      <div className={`w-full max-w-md bg-[#0d1222] border ${isClosed ? 'border-rose-500/40' : 'border-amber-500/30'} rounded-2xl shadow-2xl p-6 text-center my-auto`}>
        {/* Icon */}
        <div className={`w-14 h-14 rounded-2xl ${isClosed ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.15)]' : 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]'} border flex items-center justify-center mx-auto mb-4`}>
          {isClosed ? <ShieldAlert className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
        </div>

        <h2 className="text-lg font-bold text-white mb-1">
          {isClosed ? 'Workspace Permanently Closed' : 'Protected Workspace'}
        </h2>
        <p className="text-xs text-slate-400 mb-4 font-mono">
          Room: <span className="text-blue-400 font-semibold">#{roomId}</span>
          {isClosed ? ' has been permanently closed.' : ' requires a passcode to join.'}
        </p>

        {errorMessage && (
          <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 text-left">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isClosed ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 leading-relaxed">
              This room was closed and permanently purged from the server memory. It can no longer be joined.
            </p>
            <button
              type="button"
              onClick={onSwitchRoom}
              className="w-full btn-primary py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 flex items-center justify-center gap-1.5"
            >
              <DoorOpen className="w-4 h-4" />
              <span>Choose or Create Another Workspace</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-amber-500/60 transition-colors">
              <KeyRound className="w-4 h-4 text-slate-400 mr-2" />
              <input
                type={showPasscode ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter workspace passcode..."
                className="bg-transparent text-white outline-none w-full text-xs font-mono placeholder:text-slate-600"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="text-slate-500 hover:text-slate-300"
              >
                {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full btn-primary py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 shadow-amber-600/25"
            >
              <Lock className="w-3.5 h-3.5 mr-1.5" />
              <span>Authenticate & Join</span>
            </button>
          </form>
        )}

        <div className="mt-4 pt-4 border-t border-white/10 flex justify-center">
          <button
            onClick={onSwitchRoom}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <DoorOpen className="w-3.5 h-3.5" />
            <span>Switch or Create a different room</span>
          </button>
        </div>
      </div>
    </div>
  );
}
