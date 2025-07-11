// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://xzavdwxcqmdqrnchdphm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6YXZkd3hjcW1kcXJuY2hkcGhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjM5MzcsImV4cCI6MjA2NDY5OTkzN30.uvEI0G7fq1M176BvkUzghA1U_lizyHVMKdhlxau4cpw";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});