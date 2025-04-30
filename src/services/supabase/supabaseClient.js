import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables missing. ' +
    'Make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY ' +
    'are set in your environment.'
  );
}

// Create a single supabase client for the entire app
let supabase;

try {
  supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
  console.log('Supabase client initialized with URL:', supabaseUrl ? 'Valid URL' : 'Missing URL');
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  // Provide a minimal mock client to prevent app crashes
  supabase = {
    from: () => ({
      select: () => ({ data: null, error: new Error('Supabase client initialization failed') }),
    }),
    auth: {
      getSession: () => Promise.resolve({ data: null, error: new Error('Supabase client initialization failed') }),
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase client initialization failed') }),
      signOut: () => Promise.resolve({ error: null }),
    },
    rpc: () => ({ data: null, error: new Error('Supabase client initialization failed') })
  };
}

export default supabase;