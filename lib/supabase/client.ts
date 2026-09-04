import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY ||
      SUPABASE_URL === 'https://votre-projet.supabase.co' ||
      SUPABASE_ANON_KEY === 'votre-anon-key-ici') {
    // Mode démo : retourne un client factice qui ne crash pas
    return {
      from: () => ({
        select: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Supabase non configuré' } }),
        update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
        delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
      }),
    } as any
  }

  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
