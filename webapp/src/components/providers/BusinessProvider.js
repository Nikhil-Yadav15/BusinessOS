'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getSession, clearSession } from '../../lib/session.js';
import { useRouter } from 'next/navigation';

const BusinessContext = createContext(null);

export function BusinessProvider({ children }) {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getSession();
    if (stored && stored.token) {
      setSession(stored);
    } else {
      router.replace('/login');
    }
    setLoading(false);
  }, []);

  function logout() {
    clearSession();
    // Also clear the HTTP-only cookie by calling the server
    fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
      router.replace('/login');
    });
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-400 animate-pulse">Loading Atlas...</div>
      </div>
    );
  }

  return (
    <BusinessContext.Provider value={{ session, logout }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusinessContext() {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error('useBusinessContext must be used within BusinessProvider');
  return ctx;
}
