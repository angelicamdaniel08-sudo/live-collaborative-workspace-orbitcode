import React, { useState, useEffect } from 'react';
import { Zap, Sparkles, ArrowRight, Dices, Shield, Code2, Users2, Laptop } from 'lucide-react';
import { AVATARS, COLLAB_COLORS, getRandomUser } from '../utils/helpers';

export function SignInScreen({ initialUser, onSignIn, invitedRoomId }) {
  const [username, setUsername] = useState(initialUser?.username || '');
  const [selectedAvatar, setSelectedAvatar] = useState(initialUser?.avatar || '⚡');
  const [selectedColor, setSelectedColor] = useState(initialUser?.color || '#3b82f6');
  const [error, setError] = useState('');

  // If initialUser was empty, generate a cool random identity
  useEffect(() => {
    if (!initialUser?.username) {
      const random = getRandomUser();
      setUsername(random.username);
      setSelectedAvatar(random.avatar);
      setSelectedColor(random.color);
    }
  }, [initialUser]);

  const handleRandomize = () => {
    const random = getRandomUser();
    setUsername(random.username);
    setSelectedAvatar(random.avatar);
    setSelectedColor(random.color);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setError('Please enter a display name to continue.');
      return;
    }
    if (trimmed.length < 2) {
      setError('Display name must be at least 2 characters.');
      return;
    }
    if (trimmed.length > 24) {
      setError('Display name cannot exceed 24 characters.');
      return;
    }

    const userProfile = {
      id: `usr_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`,
      username: trimmed,
      avatar: selectedAvatar,
      color: selectedColor,
    };

    onSignIn(userProfile);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start sm:justify-center p-4 py-8 sm:py-12 bg-[#070a12] relative overflow-y-auto overflow-x-hidden select-none">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Card Container */}
      <div className="w-full max-w-md z-10 my-auto">
        {/* Brand Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-xl shadow-blue-500/25 mb-3 border border-white/10 animate-pulse-glow">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-blue-300 bg-clip-text text-transparent">
            OrbitCode <span className="text-blue-400 font-mono text-xs px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">LIVE</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
            Real-time collaborative code editor & pair-programming workspace
          </p>

          {/* Invited Room Banner (if applicable) */}
          {invitedRoomId && (
            <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-xs text-blue-300 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span>Invited to join workspace:</span>
              <span className="font-mono font-bold text-white">#{invitedRoomId}</span>
            </div>
          )}
        </div>

        {/* Sign-In Card */}
        <div className="bg-[#0d1222]/90 border border-white/10 rounded-2xl shadow-2xl p-5 sm:p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Choose Your Identity</h2>
              <p className="text-[11px] text-slate-400">Set your name and avatar for this session</p>
            </div>
            <button
              type="button"
              onClick={handleRandomize}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 bg-slate-900/60 hover:bg-slate-800 border border-white/10 rounded-lg px-2.5 py-1.5 transition-all"
              title="Generate a random identity"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>Randomize</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Live Profile Preview Badge */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/70 border border-white/5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner transition-transform hover:scale-105"
                style={{ backgroundColor: `${selectedColor}22`, border: `2px solid ${selectedColor}` }}
              >
                {selectedAvatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Live Preview</div>
                <div className="text-sm font-bold truncate text-white">
                  {username || <span className="text-slate-500 italic">Enter your name...</span>}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedColor }} />
                  <span className="text-[10px] text-slate-400 font-mono">Peer Token Active</span>
                </div>
              </div>
            </div>

            {/* Display Name Input */}
            <div>
              <label htmlFor="username-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Display Name / Handle <span className="text-rose-400">*</span>
              </label>
              <input
                id="username-input"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g., AlexDev, QuantumCoder"
                maxLength={24}
                autoFocus
                className={`w-full bg-slate-950/80 border ${
                  error ? 'border-rose-500/70 focus:border-rose-500' : 'border-white/10 focus:border-blue-500'
                } rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner`}
              />
              {error ? (
                <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                  <span>⚠</span> {error}
                </p>
              ) : (
                <p className="text-[11px] text-slate-500 mt-1">
                  Visible to all peers and attached to your code edits and cursor tag.
                </p>
              )}
            </div>

            {/* Avatar Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Choose Avatar
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedAvatar(emoji)}
                    className={`h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                      selectedAvatar === emoji
                        ? 'bg-blue-600/30 border-2 border-blue-400 shadow-md shadow-blue-500/20 scale-105'
                        : 'bg-slate-900/60 border border-white/5 hover:border-white/20 hover:bg-slate-800'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Theme Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Caret & Badge Color
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {COLLAB_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setSelectedColor(col)}
                    className={`h-6 rounded-md transition-all flex items-center justify-center ${
                      selectedColor === col ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-105' : 'hover:opacity-80'
                    }`}
                    style={{ backgroundColor: col }}
                    title={col}
                  />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-blue-600/25 transition-all text-sm group"
            >
              <span>Continue to Workspace</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        </div>

        {/* Feature Badges Footer */}
        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-500">
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-slate-900/40 border border-white/5">
            <Code2 className="w-4 h-4 text-blue-400" />
            <span>Monaco Engine</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-slate-900/40 border border-white/5">
            <Users2 className="w-4 h-4 text-purple-400" />
            <span>Live Presence</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-slate-900/40 border border-white/5">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Passcode Vault</span>
          </div>
        </div>
      </div>
    </div>
  );
}
