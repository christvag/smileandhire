import { createClient } from '@supabase/supabase-js';
// import { customAlphabet } from 'nanoid';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Environment variables:', {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Found' : 'Missing',
    key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Found' : 'Missing'
  });
  throw new Error('Missing Supabase configuration. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ID generator
// const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);

// export const generateId = (prefix: string) => {
//   return `${prefix}_${nanoid()}`;
// };

// Test connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    return !error;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};

// Helper for standardized error handling
export const handleSupabaseError = (error: any) => {
  if (error) {
    console.error('Supabase error:', error);
    throw new Error(error.message || 'Database operation failed');
  }
};