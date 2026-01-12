import { createBrowserClient } from '@supabase/ssr'
// Forcing new build to refresh env variables

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
        const urlStr = url || "";

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

                    let msg = "";
                    if (missing.length > 0) {
                        msg = `Faltan variables en Vercel: ${missing.join(", ")}. Asegúrate de hacer Redeploy.`;
                    } else if (urlStr.includes("iwmmtoxe")) {
                        msg = "¡Vercel sigue usando el proyecto VIEJO (iwmmtoxe)! Borra las variables en Vercel, dale a SAVE, agrégalas con 'https://ldbpsg...' y haz Redeploy.";
                    } else {
                        const start = urlStr.substring(0, 15);
                        const end = urlStr.substring(urlStr.length - 10);
                        msg = `URL no válida o antigua. Detectado: "${start}...${end}". Asegúrate de que empiece con https://`;
                    }
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
