import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

function lazySupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  }
  return _supabase;
}

function lazySupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    _supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
  }
  return _supabaseAdmin;
}

export const supabase = new Proxy({} as SupabaseClient, { get: (_, p) => (lazySupabase() as any)[p] });
export const supabaseAdmin = new Proxy({} as SupabaseClient, { get: (_, p) => (lazySupabaseAdmin() as any)[p] });
