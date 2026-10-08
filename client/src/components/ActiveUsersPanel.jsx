import React, { useState } from 'react';
import { Users, User, Edit3, Check, Sparkles, Circle } from 'lucide-react';
import { COLLAB_COLORS, AVATARS } from '../utils/helpers';

export function ActiveUsersPanel({
  currentUser,
  socketId,
  users = [],
  onUpdateUser,
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser.username);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleNameSave = () => {
    if (nameInput.trim()) {
      onUpdateUser({ username: nameInput.trim() });
      setIsEditingName(false);
    }
  };

  const mySocketId = socketId || currentUser?.socketId;

  // Identify exactly which user in the room users list represents "You"
  let myIndex = -1;
  if (mySocketId) {
    myIndex = users.findIndex((u) => u.socketId === mySocketId || u.id === mySocketId);
  }
  if (myIndex === -1 && currentUser) {
    myIndex = users.findIndex(
      (u) => (u.id === currentUser.id || u.clientUserId === currentUser.id) && u.username === currentUser.username
    );
  }
  if (myIndex === -1 && currentUser?.id) {
    myIndex = users.findIndex((u) => u.id === currentUser.id || u.clientUserId === currentUser.id);
  }
  if (myIndex === -1 && currentUser?.username) {
    myIndex = users.findIndex((u) => u.username === currentUser.username);
  }

  // All users except "You" are remote collaborators!
  const otherUsers = myIndex !== -1
    ? users.filter((_, idx) => idx !== myIndex)
    : users.filter((u) => (mySocketId ? u.socketId !== mySocketId : true));

  return (
    <div className="flex flex-col h-1/2 border-b border-white/10 bg-[#0f1424]/90 backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="h-10 px-3.5 border-b border-white/5 flex items-center justify-between text-xs font-semibold text-slate-300">
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span>Active Collaborators</span>
          <span className="badge badge-blue">{users.length}</span>
        </div>
      </div>

      {/* Collaborators List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {/* Current User Card */}
        <div 
          className="p-2.5 rounded-lg border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 transition-all"
          style={{ borderLeftColor: currentUser.color, borderLeftWidth: '3px' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* Avatar */}
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm cursor-pointer relative group"
                style={{ backgroundColor: `${currentUser.color}33`, borderColor: currentUser.color, borderWidth: '1px' }}
                onClick={() => setShowColorPicker(!showColorPicker)}
                title="Click to change avatar/color"
              >
                <span>{currentUser.avatar}</span>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900" />
              </div>

              {/* Name & Badge */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {isEditingName ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                        autoFocus
                        className="bg-slate-800 text-slate-100 text-xs px-1.5 py-0.5 rounded border border-blue-400 outline-none w-24 font-medium"
                      />
                      <button onClick={handleNameSave} className="text-emerald-400 hover:text-emerald-300">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-xs font-semibold text-slate-100">{currentUser.username}</span>
                      <span className="badge badge-purple text-[10px] py-0 px-1.5">You</span>
                      {currentUser.isHost && (
                        <span className="badge badge-amber text-[10px] py-0 px-1.5 flex items-center gap-0.5">
                          👑 Host
                        </span>
                      )}
                      <button 
                        onClick={() => setIsEditingName(true)} 
                        className="text-slate-400 hover:text-slate-200 p-0.5"
                        title="Edit display name"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {currentUser.status === 'typing' ? (
                    <span className="text-cyan-400 flex items-center gap-1">
                      typing <span className="typing-dots inline-flex gap-0.5"><span></span><span></span><span></span></span>
                    </span>
                  ) : (
                    'Active in editor'
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Color & Avatar Picker Overlay */}
          {showColorPicker && (
            <div className="mt-2.5 pt-2 border-t border-white/5 space-y-2 animate-fade-in">
              <div className="flex items-center gap-1 flex-wrap">
                {COLLAB_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      onUpdateUser({ color: c });
                      setShowColorPicker(false);
                    }}
                    className={`w-4 h-4 rounded-full transition-transform hover:scale-125 ${
                      currentUser.color === c ? 'ring-2 ring-white scale-110' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                {AVATARS.slice(0, 7).map((av) => (
                  <button
                    key={av}
                    onClick={() => {
                      onUpdateUser({ avatar: av });
                      setShowColorPicker(false);
                    }}
                    className="text-sm hover:scale-125 transition-transform"
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Remote Users */}
        {otherUsers.length === 0 ? (
          <div className="text-center py-6 px-3 text-xs text-slate-500 bg-slate-900/40 rounded-lg border border-dashed border-white/5">
            <User className="w-6 h-6 mx-auto mb-1.5 text-slate-600 opacity-60" />
            <p>No other collaborators in this room yet.</p>
          </div>
        ) : (
          otherUsers.map((u) => (
            <div
              key={u.socketId || u.id}
              className="p-2 rounded-lg bg-slate-900/60 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between"
              style={{ borderLeftColor: u.color || '#3b82f6', borderLeftWidth: '3px' }}
            >
              <div className="flex items-center gap-2.5">
                {/* Avatar */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-sm relative"
                  style={{ backgroundColor: `${u.color || '#3b82f6'}33`, borderColor: u.color || '#3b82f6', borderWidth: '1px' }}
                >
                  <span>{u.avatar || '👤'}</span>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400" />
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-medium text-slate-200">{u.username || u.name}</span>
                    {u.isHost && (
                      <span className="badge badge-amber text-[10px] py-0 px-1.5 flex items-center gap-0.5">
                        👑 Host
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    {u.status === 'typing' ? (
                      <span className="text-cyan-400 flex items-center gap-1 font-sans">
                        typing <span className="typing-dots inline-flex gap-0.5"><span></span><span></span><span></span></span>
                      </span>
                    ) : (
                      <span>
                        {u.activeFile || 'main.js'} {u.cursor ? `(Ln ${u.cursor.lineNumber}, Col ${u.cursor.column})` : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status pill */}
              <div className="flex items-center">
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: u.color || '#3b82f6', boxShadow: `0 0 6px ${u.color || '#3b82f6'}` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
