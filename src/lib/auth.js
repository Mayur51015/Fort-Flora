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

// ===================== ROLE-BASED ACCESS =====================

// Check if user has admin role
export async function isAdmin(userId) {
    if (!supabase || !userId) return false;
    try {
        const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .single();
        if (error || !data) return false;
        return data.role === 'admin';
    } catch {
        return false;
    }
}

// ===================== BOOKMARKS =====================

// Get all bookmarks for a user
export async function getBookmarks(userId) {
    if (!supabase || !userId) return [];
    try {
        const { data, error } = await supabase
            .from('bookmarks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) return [];
        return data || [];
    } catch {
        return [];
    }
}

// Add a bookmark
export async function addBookmark(userId, fortId) {
    if (!supabase || !userId) return { error: { message: 'Not authenticated' } };
    try {
        const { data, error } = await supabase
            .from('bookmarks')
            .insert({ user_id: userId, fort_id: fortId });
        return { data, error };
    } catch (err) {
        return { error: { message: err.message } };
    }
}

// Remove a bookmark
export async function removeBookmark(userId, fortId) {
    if (!supabase || !userId) return { error: { message: 'Not authenticated' } };
    try {
        const { data, error } = await supabase
            .from('bookmarks')
            .delete()
            .eq('user_id', userId)
            .eq('fort_id', fortId);
        return { data, error };
    } catch (err) {
        return { error: { message: err.message } };
    }
}

// Check if a fort is bookmarked
export async function isBookmarked(userId, fortId) {
    if (!supabase || !userId) return false;
    try {
        const { data, error } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('user_id', userId)
            .eq('fort_id', fortId)
            .maybeSingle();
        return !error && !!data;
    } catch {
        return false;
    }
}
