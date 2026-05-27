import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = "authToken";

export const getStoredUser = () => {
  try {
    const token = getAuthToken();
    if (!token) return null;

    const decoded = jwtDecode(token);
    return {
      id: decoded.loginId ?? null,
      user_id: decoded.userId ?? null,
      username: decoded.username ?? null,
      user_type: decoded.role ?? null,
    };
  } catch (_error) {
    return null;
  }
};

export const getAuthToken = () => sessionStorage.getItem(TOKEN_KEY);

export const setAuthSession = (_user, token) => {
  sessionStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthSession = () => {
  sessionStorage.removeItem(TOKEN_KEY);
};

export const getAuthHeaders = (headers = {}) => {
  const token = getAuthToken();
  return token ? { ...headers, Authorization: `Bearer ${token}` } : { ...headers };
};