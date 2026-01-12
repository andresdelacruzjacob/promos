import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const buildId = "BUILD_JAN_12_1745"; // ID actualizado
    let url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

    // Limpieza de pegado
    if (url?.includes('=')) url = url.split('=').pop()?.trim();
    if (key?.includes('=')) key = key.split('=').pop()?.trim();

    const isValidUrl = url && url.startsWith('http');
    const isInvalid = !isValidUrl || !key || url === 'undefined' || key === 'undefined';

    if (isInvalid) {
        const urlStr = url || "VACÍO";

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
                    const msg = `[ID:${buildId}] URL Detectada: "${urlStr.substring(0, 10)}...${urlStr.substring(urlStr.length - 5)}". Revisa el error ROJO en el panel de Vercel y dale a SAVE.`;
                    return Promise.resolve({ data: {}, error: { message: msg } });
                },
                signOut: () => Promise.resolve({ error: null }),
            }
        };

        if (typeof window === 'undefined') {
            console.warn(`[${buildId}] Configuración inválida en Build time.`);
        }

        return mock as any;
    }

    return createBrowserClient(url!, key!);
}
