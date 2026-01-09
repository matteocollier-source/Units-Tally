import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://mnuuelpsmlkqewwiiycd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1udXVlbHBzbWxrcWV3d2lpeWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MzgzMzksImV4cCI6MjA4MzExNDMzOX0.sEjatCl7C2GtgoFnWaq50G3cR3HB9PRMnTpwJUrCa6A";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
