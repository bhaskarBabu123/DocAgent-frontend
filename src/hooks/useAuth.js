import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('docuchat_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const token = localStorage.getItem('docuchat_token');

  function login(token, user) {
    localStorage.setItem('docuchat_token', token);
    localStorage.setItem('docuchat_user', JSON.stringify(user));
    setUser(user);
  }

  function logout() {
    localStorage.removeItem('docuchat_token');
    localStorage.removeItem('docuchat_user');
    setUser(null);
  }

  return { user, token, login, logout, isAuth: !!token && !!user };
}
