import { createClient, type User } from '@supabase/supabase-js';
import { writable, type Writable } from 'svelte/store';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Singleton
let supabaseInstance: ReturnType<typeof createClient>;

if (!supabaseInstance) {
  supabaseInstance = createClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    }
  );
}

export const supabase = supabaseInstance;

// Store para el usuario autenticado
export const user: Writable<User | null> = writable(null);

// Cargar sesión inicial
supabase.auth.getSession().then(({ data: { session } }) => {
  user.set(session?.user ?? null);
});

// Escuchar cambios de sesión
supabase.auth.onAuthStateChange((event, session) => {
  user.set(session?.user ?? null);
});
