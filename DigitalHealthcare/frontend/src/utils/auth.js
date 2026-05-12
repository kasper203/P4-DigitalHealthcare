const USER_KEY = "user";
const TOKEN_KEY = "authToken";

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
};

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

export const setAuthSession = (user, token) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthSession = () => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

export const getAuthHeaders = (headers = {}) => {
  const token = getAuthToken();
  return token ? { ...headers, Authorization: `Bearer ${token}` } : { ...headers };
};