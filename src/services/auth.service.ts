import { supabase } from './supabase';
import { useAuthStore } from '../store/authStore';

export const authService = {
    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        if (data.session) {
            useAuthStore.getState().setSession(data.session);
        }

        return data;
    },

    async signUp(email: string, password: string, fullName?: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (error) throw error;
        return data;
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        useAuthStore.getState().signOut();
    },

    async getCurrentSession() {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data.session) {
            useAuthStore.getState().setSession(data.session);
        }

        return data.session;
    },

    onAuthStateChange(callback: (session: any) => void) {
        return supabase.auth.onAuthStateChange((_event, session) => {
            useAuthStore.getState().setSession(session);
            callback(session);
        });
    },
};
