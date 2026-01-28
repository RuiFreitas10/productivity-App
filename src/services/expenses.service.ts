import { supabase } from './supabase';
import { Expense, Category } from '../types/database.types';
import { ExpenseFormData } from '../types/expense.types';

export const expensesService = {
    // Get all expenses for user
    async getExpenses(userId: string, filters?: {
        startDate?: string;
        endDate?: string;
        categoryId?: string;
    }) {
        let query = supabase
            .from('expenses')
            .select(`
        *,
        category:categories(*)
      `)
            .eq('user_id', userId)
            .order('date', { ascending: false });

        if (filters?.startDate) {
            query = query.gte('date', filters.startDate);
        }
        if (filters?.endDate) {
            query = query.lte('date', filters.endDate);
        }
        if (filters?.categoryId) {
            query = query.eq('category_id', filters.categoryId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    // Create expense
    async createExpense(userId: string, expenseData: ExpenseFormData) {
        const { data, error } = await supabase
            .from('expenses')
            .insert({
                user_id: userId,
                amount: expenseData.amount,
                currency: expenseData.currency,
                merchant: expenseData.merchant,
                notes: expenseData.notes,
                date: expenseData.date.toISOString().split('T')[0],
                category_id: expenseData.categoryId,
                payment_method: expenseData.paymentMethod,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update expense
    async updateExpense(expenseId: string, updates: Partial<ExpenseFormData>) {
        const updateData: any = { ...updates };
        if (updates.date) {
            updateData.date = updates.date.toISOString().split('T')[0];
        }
        if (updates.categoryId !== undefined) {
            updateData.category_id = updates.categoryId;
            delete updateData.categoryId;
        }
        if (updates.paymentMethod !== undefined) {
            updateData.payment_method = updates.paymentMethod;
            delete updateData.paymentMethod;
        }

        const { data, error } = await supabase
            .from('expenses')
            .update(updateData)
            .eq('id', expenseId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete expense
    async deleteExpense(expenseId: string) {
        const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', expenseId);

        if (error) throw error;
    },

    // Get categories
    async getCategories(userId: string) {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .or(`user_id.eq.${userId},is_default.eq.true`)
            .eq('type', 'expense');

        if (error) throw error;
        return data as Category[];
    },

    // Get expense stats
    async getExpenseStats(userId: string, startDate: string, endDate: string) {
        const { data, error } = await supabase
            .from('expenses')
            .select('amount, category_id, categories(name, color)')
            .eq('user_id', userId)
            .gte('date', startDate)
            .lte('date', endDate);

        if (error) throw error;

        const total = data.reduce((sum, exp) => sum + Number(exp.amount), 0);

        // Group by category
        const byCategory = data.reduce((acc: any, exp: any) => {
            const categoryName = exp.categories?.name || 'Outros';
            const categoryColor = exp.categories?.color || '#707070';

            if (!acc[categoryName]) {
                acc[categoryName] = {
                    category: categoryName,
                    amount: 0,
                    color: categoryColor,
                };
            }
            acc[categoryName].amount += Number(exp.amount);
            return acc;
        }, {});

        return {
            total,
            byCategory: Object.values(byCategory),
        };
    },
};
