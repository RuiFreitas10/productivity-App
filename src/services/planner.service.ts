import { supabase } from './supabase';
import { Database } from '../types/database.types';

export type Habit = Database['public']['Tables']['habits']['Row'];
export type HabitLog = Database['public']['Tables']['habit_logs']['Row'];

export const plannerService = {
    // Habits
    async getHabits(userId: string) {
        const { data, error } = await supabase
            .from('habits')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    async createHabit(userId: string, habit: { title: string; color?: string; icon?: string }) {
        const { data, error } = await supabase
            .from('habits')
            .insert({
                user_id: userId,
                title: habit.title,
                color: habit.color,
                icon: habit.icon,
                frequency: 'daily', // Default for now
                target_days_per_week: 7,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteHabit(habitId: string) {
        // Soft delete by setting is_active to false
        const { error } = await supabase
            .from('habits')
            .update({ is_active: false })
            .eq('id', habitId);

        if (error) throw error;
    },

    // Habit Logs (Tracking)
    async getHabitLogs(userId: string, date: string) {
        const { data, error } = await supabase
            .from('habit_logs')
            .select('*')
            .eq('user_id', userId)
            .eq('logged_date', date);

        if (error) throw error;
        return data;
    },

    async getHabitLogsRange(userId: string, startDate: string, endDate: string) {
        const { data, error } = await supabase
            .from('habit_logs')
            .select('*')
            .eq('user_id', userId)
            .gte('logged_date', startDate)
            .lte('logged_date', endDate);

        if (error) throw error;
        return data;
    },

    async toggleHabitCompletion(userId: string, habitId: string, date: string) {
        // First check if a log exists
        const { data: existingLog, error: fetchError } = await supabase
            .from('habit_logs')
            .select('*')
            .eq('user_id', userId)
            .eq('habit_id', habitId)
            .eq('logged_date', date)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "Row not found"
            throw fetchError;
        }

        if (existingLog) {
            // If exists, toggle it (or delete it if we want 'uncheck' to mean 'no record')
            // For now, let's delete it to "uncheck" effectively
            const { error: deleteError } = await supabase
                .from('habit_logs')
                .delete()
                .eq('id', existingLog.id);

            if (deleteError) throw deleteError;
            return null; // Returned null implies "not completed"
        } else {
            // If doesn't exist, create it
            const { data, error: insertError } = await supabase
                .from('habit_logs')
                .insert({
                    user_id: userId,
                    habit_id: habitId,
                    logged_date: date,
                    is_completed: true
                })
                .select()
                .single();

            if (insertError) throw insertError;
            return data; // Returned data implies "completed"
        }
    }
};
