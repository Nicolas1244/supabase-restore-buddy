import { createClient } from '@supabase/supabase-js';
import { AuthUser } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Get the current domain, handling both development and production
const domain = window.location.hostname === 'localhost' 
  ? window.location.origin
  : 'https://bespoke-moxie-4bc29e.netlify.app';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    redirectTo: domain,
  },
  global: {
    headers: {
      'X-Client-Info': 'restauranthub@1.0.0',
    },
  },
});

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: domain,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  
  if (error) throw error;
  return data;
};

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: domain,
    },
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  // Get user's restaurant access and role
  const { data: access, error: accessError } = await supabase
    .from('user_restaurant_access')
    .select('restaurant_id, role')
    .eq('user_id', user.id);

  if (accessError) {
    console.error('Error fetching user access:', accessError);
    return null;
  }

  return {
    ...user,
    restaurantAccess: access?.map(a => a.restaurant_id) || [],
    role: access?.[0]?.role || 'staff'
  };
};
