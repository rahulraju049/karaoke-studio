import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Conditional initialization to prevent app crash if keys are missing
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

if (!supabaseUrl) console.error("❌ Missing VITE_SUPABASE_URL");
if (!supabaseAnonKey) console.error("❌ Missing VITE_SUPABASE_ANON_KEY");

if (!supabase) {
    console.warn("⚠️ Supabase keys missing. Running in Local-Only mode. Rooms will NOT sync.");
}
