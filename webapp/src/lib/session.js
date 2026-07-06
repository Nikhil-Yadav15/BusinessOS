/**
 * Atlas Session Utilities
 * 
 * Manages storing and clearing the in-memory auth session in the browser.
 * Access tokens are short-lived (15min) and stored in sessionStorage.
 * Refresh tokens are HTTP-only cookies managed by the server.
 */

export const SESSION_TOKEN_KEY = 'atlas_access_token';
export const SESSION_BUSINESS_KEY = 'atlas_business_id';
export const SESSION_USER_KEY = 'atlas_user';

export function saveSession({ accessToken, user, businessId }) {
  sessionStorage.setItem(SESSION_TOKEN_KEY, accessToken);
  sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
  if (businessId) {
    sessionStorage.setItem(SESSION_BUSINESS_KEY, businessId);
  }
}

export function getSession() {
  if (typeof window === 'undefined') return null;
  try {
    const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
    const user = JSON.parse(sessionStorage.getItem(SESSION_USER_KEY) || 'null');
    const businessId = sessionStorage.getItem(SESSION_BUSINESS_KEY);
    if (!token) return null;
    return { token, user, businessId };
  } catch {
    return null;
  }
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
  sessionStorage.removeItem(SESSION_USER_KEY);
  sessionStorage.removeItem(SESSION_BUSINESS_KEY);
}
