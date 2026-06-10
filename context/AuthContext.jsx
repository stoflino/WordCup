'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getStoredUser, setStoredUser, clearStoredUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredUser());
    setLoading(false);
  }, []);

  const login = async (name, pin) => {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, pin')
      .eq('name', name.trim())
      .eq('pin', pin.trim())
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Invalid name or PIN');

    setStoredUser(data);
    setUser(data);
    return data;
  };

  const logout = () => {
    clearStoredUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
