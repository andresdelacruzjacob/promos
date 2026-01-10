import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        if (typeof window === 'undefined') {
            console.warn("Supabase env variables are missing during build. Skipping client creation.");
            return {} as any; // Return dummy for build time
        }
        throw new Error("Missing Supabase environment variables");
    }

    return createBrowserClient(url, key);
}
