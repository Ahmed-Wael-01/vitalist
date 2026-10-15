import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, fetchCurrentUser } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { i18n } = useTranslation();

  const adopt = useCallback((u) => {
    setUser(u);
    if (u?.preferredLanguage && u.preferredLanguage !== i18n.language) i18n.changeLanguage(u.preferredLanguage);
    return u;
  }, [i18n]);

  useEffect(() => {
    fetchCurrentUser().then(adopt).finally(() => setLoading(false));
  }, [adopt]);

  const login = useCallback(async (email, password) => adopt((await api('/auth/login', { method: 'POST', body: { email, password } })).user), [adopt]);
  const register = useCallback(async (payload) => adopt((await api('/auth/register', { method: 'POST', body: payload })).user), [adopt]);
  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
  }, []);

  const setLanguage = useCallback(async (lang) => {
    i18n.changeLanguage(lang);
    if (user) setUser((await api('/auth/me', { method: 'PATCH', body: { preferredLanguage: lang } })).user);
  }, [i18n, user]);

  const value = useMemo(() => ({ user, loading, login, register, logout, setLanguage }), [user, loading, login, register, logout, setLanguage]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
