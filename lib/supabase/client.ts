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
        const errorMessage = `Supabase configuration invalid. URL: ${url}.`;

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
                signInWithPassword: () => {
                    let missing = [];
                    if (!url) missing.push("URL");
                    if (!key) missing.push("Anon Key");
                    if (url === 'undefined') missing.push("URL (es 'undefined')");
                    const msg = missing.length > 0
                        ? `Faltan variables en Vercel: ${missing.join(", ")}. Asegúrate de hacer Redeploy.`
                        : "URL no válida (debe empezar con http).";
                    return Promise.resolve({ data: {}, error: { message: msg } });
                },
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
