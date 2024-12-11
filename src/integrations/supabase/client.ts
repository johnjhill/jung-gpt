// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ljjhnfmqtkscqbaqtcpe.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqamhuZm1xdGtzY3FiYXF0Y3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4MzY4MTEsImV4cCI6MjA0OTQxMjgxMX0.IZTRbzCvnYhw_eXDvr0rMH68IBC5E2UzcJgSw6rplcc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);