import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    let url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

    // Clean up common copy-paste mistakes (like NEXT_PUBLIC_...=https://...)
    if (url?.includes('=')) url = url.split('=').pop()?.trim();
    if (key?.includes('=')) key = key.split('=').pop()?.trim();

    // Check if URL is actually a URL
    const isValidUrl = url && url.startsWith('http');
    const isInvalid = !isValidUrl || !key || url === 'undefined' || key === 'undefined';

    if (isInvalid) {
        const errorMessage = `Invalid or missing Supabase configuration. URL: ${url}. Check Vercel Environment Variables.`;

        // Always provide a mock to prevent crashes, both in build and browser
        const mock = {
            from: () => ({
                select: () => ({
                    order: () => Promise.resolve({ data: [], error: null }),
                    eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }),
                    contains: () => ({ order: () => Promise.resolve({ data: [], error: null }) })
                }),
                delete: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }),
            }),
            auth: {
                getSession: () => Promise.resolve({ data: { session: null }, error: null }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
                signOut: () => Promise.resolve({ error: null }),
            }
        };

        if (typeof window === 'undefined') {
            console.warn(errorMessage + " Using dummy client.");
        } else {
            console.error(errorMessage);
        }

        return mock as any;
    }

    return createBrowserClient(url!, key!);
}
