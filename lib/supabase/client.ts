import { createBrowserClient } from '@supabase/ssr'

// DEFINITIVE FALLBACKS - Since Vercel is having sync issues
const FALLBACK_URL = "https://ldbpsglzxjdnjrlbxmbf.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkYnBzZ2x6eGpkbmpybGJ4bWJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNDk3MjYsImV4cCI6MjA4MzgyNTcyNn0.Keh6XCGf8sCIhe7mXO2hNj31TXVxqHqRvP-ng0lOwUI";

export function createClient() {
    // Attempt to get from env first
    let url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

    // If env is missing, malformed, or points to old project 'iwmmtoxe'
    const isOldOrBroken = !url || !url.startsWith('http') || url.includes('iwmmtoxe');

    if (isOldOrBroken) {
        url = FALLBACK_URL;
        key = FALLBACK_KEY;
    }

    return createBrowserClient(url!, key!);
}
