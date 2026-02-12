// Authentication helper using Supabase Auth
import supabase from './supabase.js';

// Get the current authenticated user
export async function getCurrentUser() {
    if (!supabase) return null;
    try {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    } catch {
        return null;
    }
}

// Sign in with email and password
export async function signIn(email, password) {
    if (!supabase) {
        return { error: { message: 'Supabase is not configured.' } };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
}

// Sign up with email and password
export async function signUp(email, password) {
    if (!supabase) {
        return { error: { message: 'Supabase is not configured.' } };
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
}

// Sign out
export async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
}

// Listen for auth state changes
export function onAuthStateChange(callback) {
    if (!supabase) return { data: { subscription: { unsubscribe: () => { } } } };
    return supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user || null);
    });
}
