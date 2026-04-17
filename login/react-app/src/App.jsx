import React, { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_READY = Boolean(SUPABASE_URL && SUPABASE_KEY);
const SB_CLIENT = SUPABASE_READY
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: false, detectSessionInUrl: false },
    })
  : null;
const LOGIN_TITLE = 'Luxe Travel Login';
const AUTH_COOKIE_DOMAIN = import.meta.env.VITE_AUTH_COOKIE_DOMAIN || '';
const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:8001',
  'http://localhost:8002',
];
const ALLOWED_RETURN_ORIGINS = (import.meta.env.VITE_ALLOWED_RETURN_ORIGINS || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);
const FINAL_ALLOWED_RETURN_ORIGINS = ALLOWED_RETURN_ORIGINS.length > 0 ? ALLOWED_RETURN_ORIGINS : DEFAULT_ALLOWED_ORIGINS;
const DEFAULT_HOTELS_URL = import.meta.env.VITE_HOTELS_APP_URL || 'http://localhost:5174/';
const DEFAULT_TASTE_URL = import.meta.env.VITE_TASTE_APP_URL || 'http://localhost:5176/';

function getSB() {
  if (!SB_CLIENT) throw new Error('Missing Supabase configuration');
  return SB_CLIENT;
}

function getCookie(name) {
  return document.cookie.split('; ').reduce((acc, part) => {
    const eq = part.indexOf('=');
    if (eq === -1) return acc;
    return part.slice(0, eq) === name ? decodeURIComponent(part.slice(eq + 1)) : acc;
  }, '');
}

function setAuthCookies(session) {
  const exp = new Date(Date.now() + 7 * 864e5).toUTCString();
  const domain = AUTH_COOKIE_DOMAIN ? `; Domain=${AUTH_COOKIE_DOMAIN}` : '';
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `sb_access_token=${encodeURIComponent(session.access_token)}; expires=${exp}; path=/; SameSite=Lax${secure}${domain}`;
  document.cookie = `sb_refresh_token=${encodeURIComponent(session.refresh_token)}; expires=${exp}; path=/; SameSite=Lax${secure}${domain}`;
}

function clearAuthCookies() {
  ['sb_access_token', 'sb_refresh_token'].forEach((name) => {
    const domain = AUTH_COOKIE_DOMAIN ? `; Domain=${AUTH_COOKIE_DOMAIN}` : '';
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax${secure}${domain}`;
  });
}

function getReturnTo() {
  const params = new URLSearchParams(window.location.search);
  const returnTo = params.get('returnTo');
  if (!returnTo) return null;
  if (returnTo.startsWith('/')) return returnTo;
  try {
    const url = new URL(returnTo);
    if (FINAL_ALLOWED_RETURN_ORIGINS.includes(url.origin)) return url.toString();
  } catch {
    return null;
  }
  return null;
}

function sanitizeTarget(urlValue) {
  try {
    const url = new URL(urlValue);
    if (FINAL_ALLOWED_RETURN_ORIGINS.includes(url.origin)) return url.toString();
  } catch {
    return null;
  }
  return null;
}

const HOTELS_TARGET_URL = sanitizeTarget(DEFAULT_HOTELS_URL);
const TASTE_TARGET_URL = sanitizeTarget(DEFAULT_TASTE_URL);

export default function App() {
  const [tab, setTab] = useState('signin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [siEmail, setSiEmail] = useState('');
  const [siPass, setSiPass] = useState('');
  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPass, setSuPass] = useState('');
  const [showDestinationChooser, setShowDestinationChooser] = useState(false);
  const authHandled = useRef(false);

  useEffect(() => {
    if (!SUPABASE_READY) return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    async function finish(session) {
      setAuthCookies(session);
      const returnTo = getReturnTo();
      if (returnTo) {
        window.location.href = returnTo;
        return;
      }
      setShowDestinationChooser(true);
    }

    if (code && !authHandled.current) {
      authHandled.current = true;
      (async () => {
        try {
          const sb = getSB();
          const { data, error: authError } = await sb.auth.exchangeCodeForSession(code);
          if (!authError && data.session) await finish(data.session);
          else setError('Login failed.');
        } catch {
          setError('Login failed.');
        }
      })();
      return;
    }

    const access = getCookie('sb_access_token');
    const refresh = getCookie('sb_refresh_token');
    if (!access || !refresh) return;
    (async () => {
      try {
        const sb = getSB();
        const { data, error: authError } = await sb.auth.setSession({ access_token: access, refresh_token: refresh });
        if (!authError && data.session) await finish(data.session);
        else clearAuthCookies();
      } catch {
        clearAuthCookies();
      }
    })();
  }, []);

  async function handleSignIn(e) {
    e.preventDefault();
    setError('');
    if (!SUPABASE_READY) return setError('Add Supabase env vars first.');
    setLoading(true);
    try {
      const sb = getSB();
      const { data, error: authError } = await sb.auth.signInWithPassword({ email: siEmail, password: siPass });
      if (authError) return setError(authError.message);
      if (data.session) {
        const returnTo = getReturnTo();
        setAuthCookies(data.session);
        if (returnTo) {
          window.location.href = returnTo;
          return;
        }
        setShowDestinationChooser(true);
      }
    } catch {
      setError('Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setError('');
    if (!SUPABASE_READY) return setError('Add Supabase env vars first.');
    setLoading(true);
    try {
      const sb = getSB();
      const { data, error: authError } = await sb.auth.signUp({
        email: suEmail,
        password: suPass,
        options: { data: { full_name: suName } },
      });
      if (authError) return setError(authError.message);
      if (data.session) {
        const returnTo = getReturnTo();
        setAuthCookies(data.session);
        if (returnTo) {
          window.location.href = returnTo;
          return;
        }
        setShowDestinationChooser(true);
      } else {
        setTab('signin');
        setError('Account created. Please confirm your email then sign in.');
      }
    } finally {
      setLoading(false);
    }
  }

  function goToDestination(target) {
    if (!target) return;
    window.location.href = target;
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <p className="eyebrow">Centralized auth</p>
        <h1>{LOGIN_TITLE}</h1>
        <p className="sub">One account for Hotels and Taste Explorer.</p>
        {!SUPABASE_READY && <div className="error">Supabase is not configured.</div>}
        {error && <div className="error">{error}</div>}
        <div className="tabs">
          <button className={tab === 'signin' ? 'active' : ''} onClick={() => setTab('signin')}>Sign In</button>
          <button className={tab === 'create' ? 'active' : ''} onClick={() => setTab('create')}>Create Account</button>
        </div>
        {tab === 'signin' ? (
          <form onSubmit={handleSignIn} className="form">
            <label>Email</label>
            <input value={siEmail} onChange={(e) => setSiEmail(e.target.value)} type="email" />
            <label>Password</label>
            <input value={siPass} onChange={(e) => setSiPass(e.target.value)} type="password" />
            <button disabled={loading}>{loading ? 'Please wait…' : 'Sign In'}</button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="form">
            <label>Full Name</label>
            <input value={suName} onChange={(e) => setSuName(e.target.value)} />
            <label>Email</label>
            <input value={suEmail} onChange={(e) => setSuEmail(e.target.value)} type="email" />
            <label>Password</label>
            <input value={suPass} onChange={(e) => setSuPass(e.target.value)} type="password" />
            <button disabled={loading}>{loading ? 'Please wait…' : 'Create Account'}</button>
          </form>
        )}

        {showDestinationChooser && (
          <div className="destination-chooser" role="region" aria-label="Choose destination">
            <p className="destination-title">Choose where you want to go</p>
            <div className="destination-actions">
              <button type="button" onClick={() => goToDestination(HOTELS_TARGET_URL)} disabled={!HOTELS_TARGET_URL}>Go to Hotels</button>
              <button type="button" onClick={() => goToDestination(TASTE_TARGET_URL)} disabled={!TASTE_TARGET_URL}>Go to Taste Explorer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
