/**
 * API Configuration and Safe Fetch Utilities
 * Handles backend URL resolution, protocol normalization, and graceful error handling.
 */

const STORAGE_KEY_SERVER_URL = 'orbit_custom_server_url';

export function isLocalEnvironment() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
}

/**
 * Returns the resolved backend server URL.
 * Priority:
 * 1. User manual override stored in localStorage
 * 2. VITE_SERVER_URL environment variable (if non-empty & not a placeholder)
 * 3. http://localhost:4000 (if running on localhost)
 * 4. Fallback: empty string
 */
export function getServerUrl() {
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem(STORAGE_KEY_SERVER_URL);
    if (override && override.trim()) {
      return normalizeUrl(override.trim());
    }
  }

  const rawEnv = (import.meta.env.VITE_SERVER_URL || '').trim();

  // Validate that it's not a template/placeholder string
  const isPlaceholder = 
    !rawEnv ||
    rawEnv.toUpperCase().includes('REPLACE_WITH') ||
    rawEnv.toUpperCase().includes('YOUR_RAILWAY_URL') ||
    rawEnv.includes('<') ||
    rawEnv.includes('>') ||
    rawEnv === 'undefined' ||
    rawEnv === 'null';

  if (!isPlaceholder) {
    return normalizeUrl(rawEnv);
  }

  // If running locally, default to port 4000
  if (isLocalEnvironment()) {
    return 'http://localhost:4000';
  }

  return '';
}

/**
 * Sets or clears the custom backend server URL in localStorage.
 */
export function setCustomServerUrl(url) {
  if (!url || !url.trim()) {
    localStorage.removeItem(STORAGE_KEY_SERVER_URL);
  } else {
    localStorage.setItem(STORAGE_KEY_SERVER_URL, normalizeUrl(url.trim()));
  }
}

export function getCustomServerUrl() {
  return (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY_SERVER_URL)) || '';
}

/**
 * Ensures protocol exists and removes trailing slashes.
 */
export function normalizeUrl(url) {
  let cleaned = (url || '').trim().replace(/\/+$/, '');
  if (!cleaned) return '';
  if (!/^https?:\/\//i.test(cleaned)) {
    if (/^localhost(:\d+)?/i.test(cleaned) || /^127\.0\.0\.1(:\d+)?/i.test(cleaned)) {
      cleaned = `http://${cleaned}`;
    } else {
      cleaned = `https://${cleaned}`;
    }
  }
  return cleaned;
}

/**
 * Checks if a valid backend URL is currently available.
 */
export function isBackendConfigured() {
  return Boolean(getServerUrl());
}

/**
 * Safe fetch wrapper that handles:
 * - Proper URL resolution
 * - Content-Type validation (protects against HTML returned by SPA host)
 * - Clear human-readable error messages
 */
export async function safeFetchJson(endpoint, options = {}) {
  const serverUrl = getServerUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (!serverUrl) {
    throw new Error(
      'Backend URL is not configured. Set VITE_SERVER_URL in your Vercel project environment variables or configure it in Server Settings.'
    );
  }

  const fullUrl = `${serverUrl}${cleanEndpoint}`;

  let res;
  try {
    res = await fetch(fullUrl, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...(options.headers || {}),
      },
    });
  } catch (netErr) {
    throw new Error(`Unable to reach backend server at ${serverUrl}. Please ensure the server is online and allows CORS.`);
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.toLowerCase().includes('application/json');

  if (!isJson) {
    const textBody = await res.text().catch(() => '');
    if (textBody.includes('<!doctype') || textBody.includes('<html')) {
      throw new Error(
        `Backend endpoint (${cleanEndpoint}) returned HTML instead of JSON. Ensure your server URL (${serverUrl}) points to your backend (e.g. Railway) and not the frontend host.`
      );
    }
    throw new Error(`Server returned non-JSON response (${res.status} ${res.statusText})`);
  }

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error || data?.message || `Request failed with status ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
