import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
});

import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load session from storage or Supabase
    const loadSession = async () => {
      try {
        const storedSession = await AsyncStorage.getItem('supabase_session');
        if (storedSession) {
          setSession(JSON.parse(storedSession));
        }

        // Get fresh session from Supabase
        const { data: { session: freshSession } } = await supabase.auth.getSession();
        if (freshSession) {
          setSession(freshSession);
          await AsyncStorage.setItem('supabase_session', JSON.stringify(freshSession));
        } else if (!storedSession) {
          // No stored session and no fresh session
          setSession(null);
        }
      } catch (e) {

      } finally {
        setIsLoading(false);
      }
    };

    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        await AsyncStorage.setItem('supabase_session', JSON.stringify(session));
      } else {
        await AsyncStorage.removeItem('supabase_session');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
