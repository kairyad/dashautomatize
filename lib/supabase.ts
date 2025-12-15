import { createClient } from '@supabase/supabase-js';

// Configuration provided
const supabaseUrl = 'https://supabase.pulseenergy.shop';
// Atualizada com a Anon Key correta (contendo "iss": "supabase")
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.WubWaNK_ZAiuVBQfgOP4oxc91ec9OuQbBg1QVBnY940';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
});