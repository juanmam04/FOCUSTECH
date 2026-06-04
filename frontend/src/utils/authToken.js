const AUTH_KEY = 'ft_auth_token';
const LEGACY_KEY = 'ft_admin_token';

export function getAuthToken() {
  try {
    let token = localStorage.getItem(AUTH_KEY);
    if (!token) {
      token = localStorage.getItem(LEGACY_KEY);
      if (token) {
        localStorage.setItem(AUTH_KEY, token);
        localStorage.removeItem(LEGACY_KEY);
      }
    }
    return token;
  } catch {
    return null;
  }
}

export function setAuthToken(token) {
  try {
    localStorage.setItem(AUTH_KEY, token);
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* ignore */
  }
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* ignore */
  }
}
