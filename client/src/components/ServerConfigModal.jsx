import React, { useState, useEffect } from 'react';
import { Server, X, CheckCircle2, AlertCircle, RefreshCw, Globe, ExternalLink, HelpCircle } from 'lucide-react';
import { getServerUrl, getCustomServerUrl, setCustomServerUrl, normalizeUrl } from '../utils/apiConfig';

export function ServerConfigModal({ isOpen, onClose, onServerUrlChanged }) {
  const [urlInput, setUrlInput] = useState('');
  const [testStatus, setTestStatus] = useState(null); // { state: 'idle' | 'testing' | 'success' | 'error', message: '', latency: null }

  useEffect(() => {
    if (isOpen) {
      const active = getServerUrl();
      setUrlInput(active || '');
      setTestStatus(null);
      if (active) {
        testConnection(active);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const testConnection = async (targetUrl) => {
    const cleaned = normalizeUrl(targetUrl);
    if (!cleaned) {
      setTestStatus({ state: 'error', message: 'Please enter a valid URL.' });
      return;
    }

    setTestStatus({ state: 'testing', message: 'Pinging /health endpoint...' });
    const startTime = performance.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${cleaned}/health`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeoutId);

      const latency = Math.round(performance.now() - startTime);

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setTestStatus({
          state: 'success',
          message: `Connected successfully! (${latency}ms)`,
          latency,
          data,
        });
      } else {
        setTestStatus({
          state: 'error',
          message: `Server returned HTTP ${res.status}: ${res.statusText}`,
        });
      }
    } catch (err) {
      setTestStatus({
        state: 'error',
        message: err.name === 'AbortError' ? 'Connection timed out (8s).' : 'Failed to reach server. Check domain and CORS settings.',
      });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const cleaned = normalizeUrl(urlInput);
    setCustomServerUrl(cleaned);
    if (onServerUrlChanged) {
      onServerUrlChanged(cleaned);
    }
    onClose();
  };

  const handleReset = () => {
    setCustomServerUrl('');
    const fallback = getServerUrl();
    setUrlInput(fallback);
    if (onServerUrlChanged) {
      onServerUrlChanged(fallback);
    }
    testConnection(fallback);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-[#0d1222] border border-white/10 rounded-2xl shadow-2xl p-6 text-slate-100 my-auto relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-inner">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Backend Server Settings</h2>
            <p className="text-xs text-slate-400">Configure or test your Railway backend endpoint</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Server Base URL</span>
              <span className="text-[11px] font-normal text-slate-400">
                {getCustomServerUrl() ? '⚡ Custom Override Active' : 'Default Environment'}
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setTestStatus(null);
                }}
                placeholder="https://your-service.up.railway.app or http://localhost:4000"
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-white/10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-xl text-sm font-mono text-white placeholder-slate-500 transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              If deploying on Railway, paste your public Railway domain (e.g., <code className="text-blue-300">https://xxxx.up.railway.app</code>).
            </p>
          </div>

          {/* Connection Test Status Box */}
          {testStatus && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                testStatus.state === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : testStatus.state === 'error'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {testStatus.state === 'testing' && <RefreshCw className="w-4 h-4 animate-spin shrink-0" />}
                {testStatus.state === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                {testStatus.state === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                <span>{testStatus.message}</span>
              </div>

              {testStatus.latency && (
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-200">
                  {testStatus.latency}ms
                </span>
              )}
            </div>
          )}

          {/* Help Tip */}
          <div className="p-3 bg-slate-900/50 border border-white/5 rounded-xl text-slate-400 text-xs flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-slate-300 block">Why does this matter?</span>
              <p className="text-[11px] leading-relaxed">
                The frontend on Vercel requires a live backend server for WebSockets, real-time code sync, active cursor tracking, and room verification.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => testConnection(urlInput)}
                disabled={testStatus?.state === 'testing' || !urlInput.trim()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testStatus?.state === 'testing' ? 'animate-spin' : ''}`} />
                <span>Test Connection</span>
              </button>

              {getCustomServerUrl() && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-2 text-slate-400 hover:text-slate-200 text-xs transition-colors"
                >
                  Reset Default
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all"
              >
                Save & Apply
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
