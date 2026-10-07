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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fade-in">
      <div className="w-full max-w-md bg-[#0d1222] border border-amber-500/30 rounded-2xl shadow-2xl p-6 text-center">
        {/* Lock Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <Lock className="w-7 h-7" />
        </div>

        <h2 className="text-lg font-bold text-white mb-1">Protected Workspace</h2>
        <p className="text-xs text-slate-400 mb-4 font-mono">
          Room: <span className="text-blue-400 font-semibold">#{roomId}</span> requires a passcode to join.
        </p>

        {errorMessage && (
          <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 text-left">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

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
