import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  LogIn, 
  LogOut, 
  Edit3, 
  Play, 
  FileCode, 
  UserCheck, 
  Trash2, 
  Search, 
  SlidersHorizontal,
  Info
} from 'lucide-react';

export function ActivityLogsPanel({
  logs,
  onClearLogs,
}) {
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Type filter
      if (filterType !== 'all') {
        if (filterType === 'presence' && !(log.type === 'join' || log.type === 'leave')) return false;
        if (filterType === 'edits' && log.type !== 'edit') return false;
        if (filterType === 'runs' && log.type !== 'run') return false;
        if (filterType === 'files' && log.type !== 'file') return false;
        if (filterType === 'system' && log.type !== 'system') return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const textMatch = log.text?.toLowerCase().includes(term);
        const userMatch = log.user?.username?.toLowerCase().includes(term);
        return textMatch || userMatch;
      }
      return true;
    });
  }, [logs, filterType, searchTerm]);

  const getLogIcon = (type) => {
    switch (type) {
      case 'join':
        return <LogIn className="w-3 h-3 text-emerald-400" />;
      case 'leave':
        return <LogOut className="w-3 h-3 text-amber-400" />;
      case 'edit':
        return <Edit3 className="w-3 h-3 text-blue-400" />;
      case 'run':
        return <Play className="w-3 h-3 text-purple-400 fill-purple-400" />;
      case 'file':
        return <FileCode className="w-3 h-3 text-cyan-400" />;
      case 'profile':
        return <UserCheck className="w-3 h-3 text-pink-400" />;
      default:
        return <Info className="w-3 h-3 text-indigo-400" />;
    }
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'join': return 'badge-emerald';
      case 'leave': return 'badge-amber';
      case 'edit': return 'badge-blue';
      case 'run': return 'badge-purple';
      case 'file': return 'badge-blue';
      case 'profile': return 'badge-rose';
      default: return 'badge-purple';
    }
  };

  return (
    <div className="flex flex-col h-1/2 bg-[#0c101c]/90 backdrop-blur-md overflow-hidden">
      {/* Header & Controls */}
      <div className="h-10 px-3.5 border-b border-white/5 flex items-center justify-between text-xs font-semibold text-slate-300">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-purple-400" />
          <span>Live Activity Feed</span>
          <span className="badge badge-purple">{logs.length}</span>
        </div>

        {/* Clear Button */}
        {logs.length > 0 && (
          <button
            onClick={onClearLogs}
            className="text-slate-500 hover:text-slate-300 p-1 rounded transition-colors"
            title="Clear Activity Logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div className="p-2 border-b border-white/5 space-y-2 bg-slate-900/40">
        {/* Search Input */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-950/60 border border-white/5 rounded-md text-xs">
          <Search className="w-3 h-3 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search events..."
            className="bg-transparent text-slate-200 outline-none text-[11px] w-full placeholder:text-slate-600 font-sans"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-[10px]">
          {['all', 'presence', 'runs', 'files', 'system'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterType(cat)}
              className={`px-2 py-0.5 rounded-full capitalize font-medium transition-all ${
                filterType === cat
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Feed */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2 font-sans">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            <Activity className="w-5 h-5 mx-auto mb-1 text-slate-600 opacity-50" />
            <p>No activity records found</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-2 rounded-lg bg-slate-900/50 border border-white/5 hover:border-white/10 transition-all text-xs flex items-start gap-2 animate-fade-in"
            >
              {/* Icon */}
              <div className="mt-0.5 p-1 rounded-md bg-slate-800/80 shrink-0">
                {getLogIcon(log.type)}
              </div>

              {/* Log Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-slate-200 text-[11px] truncate" style={{ color: log.user?.color || '#94a3b8' }}>
                    {log.user?.username || 'User'}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono shrink-0">{log.timestamp}</span>
                </div>

                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug break-words">
                  {log.text}
                </p>

                {/* Optional Details (e.g. run status or runtime) */}
                {log.details && (
                  <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                    {log.details.duration && (
                      <span className="font-mono text-purple-300 bg-purple-950/40 px-1.5 py-0.2 rounded border border-purple-500/20">
                        ⏱ {log.details.duration}
                      </span>
                    )}
                    {log.details.status && (
                      <span className={`badge ${log.details.status === 'success' ? 'badge-emerald' : 'badge-rose'} text-[9px]`}>
                        {log.details.status}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
