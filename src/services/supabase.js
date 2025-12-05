import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase URL or Anon Key. Authentication and Sync will not work.');
}

export const supabase = createClient(
    supabaseUrl || 'https://cjlfhaoxwodincelcqgg.supabase.co',
    supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqbGZoYW94d29kaW5jZWxjcWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NDEzNjQsImV4cCI6MjA4MDAxNzM2NH0.FNf64vAtZmoaLAdwUX7URi0cJUdw_Nv3REM758E6R5Y'
);
