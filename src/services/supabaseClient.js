import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://edkpkswqedxhwwemrtmt.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVka3Brc3dxZWR4aHd3ZW1ydG10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMTI3NjEsImV4cCI6MjA5ODU4ODc2MX0.F2kT67Hb3O5g7AJiRro_mnH7V7Ccmg2W1ZqeRyBI8vE';
const SUPABASE_SERVICE_ROLE_KEY = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVka3Brc3dxZWR4aHd3ZW1ydG10Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzAxMjc2MSwiZXhwIjoyMDk4NTg4NzYxfQ.fAoANskV91Mw5vJVavFA4uv7duVothitoKMq95Pbc9g';

// Standard client for public operations (contact submission, visitor count read/increment)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin client using service role key (bypasses RLS for admin dashboard operations)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
