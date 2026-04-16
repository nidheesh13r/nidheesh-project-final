import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_READY = Boolean(SUPABASE_URL && SUPABASE_KEY);
const SB_CLIENT = SUPABASE_READY
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
  : null;
const DEFAULT_LOGIN_URL = `${window.location.protocol}//${window.location.hostname}:5173`;
export const LOGIN_PAGE_URL = import.meta.env.VITE_LOGIN_URL || DEFAULT_LOGIN_URL;
const AUTH_COOKIE_DOMAIN = import.meta.env.VITE_AUTH_COOKIE_DOMAIN || '';

function getSB() {
  if (!SB_CLIENT) return null;
  return SB_CLIENT;
}

function getCookie(name: string): string {
  return document.cookie.split('; ').reduce((acc, part) => {
    const eq = part.indexOf('=');
    if (eq === -1) return acc;
    return part.slice(0, eq) === name ? decodeURIComponent(part.slice(eq + 1)) : acc;
  }, '');
}

export function setAuthCookies(session: { access_token: string; refresh_token: string }): void {
  const exp = new Date(Date.now() + 7 * 864e5).toUTCString();
  const domain = AUTH_COOKIE_DOMAIN ? `; Domain=${AUTH_COOKIE_DOMAIN}` : '';
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `sb_access_token=${encodeURIComponent(session.access_token)}; expires=${exp}; path=/; SameSite=Lax${secure}${domain}`;
  document.cookie = `sb_refresh_token=${encodeURIComponent(session.refresh_token)}; expires=${exp}; path=/; SameSite=Lax${secure}${domain}`;
}

export function clearAuthCookies(): void {
  ['sb_access_token', 'sb_refresh_token'].forEach((name) => {
    const domain = AUTH_COOKIE_DOMAIN ? `; Domain=${AUTH_COOKIE_DOMAIN}` : '';
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax${secure}${domain}`;
  });
}

export function getAccessToken(): string {
  return getCookie('sb_access_token') || '';
}

export async function initAuth() {
  if (!SUPABASE_READY) return null;
  const access = getCookie('sb_access_token');
  const refresh = getCookie('sb_refresh_token');
  if (!access || !refresh) return null;
  const sb = getSB();
  if (!sb) return null;
  const { data, error } = await sb.auth.setSession({ access_token: access, refresh_token: refresh });
  if (error || !data.session) {
    clearAuthCookies();
    return null;
  }
  setAuthCookies(data.session);
  return data.session.user;
}

export function loginRedirect(): void {
  window.location.href = `${LOGIN_PAGE_URL}?returnTo=${encodeURIComponent(window.location.href)}`;
}

export async function signOut(): Promise<void> {
  try {
    const sb = getSB();
    if (sb) await sb.auth.signOut();
  } catch {
    /* ignore */
  }
  clearAuthCookies();
}
