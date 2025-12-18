import { createClient } from '@supabase/supabase-js';
import { browser } from '$app/environment';
import { Import } from 'lucide-svelte';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const supabase = browser? createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY) : ({} as ReturnType<typeof createClient>);

export default supabase;

