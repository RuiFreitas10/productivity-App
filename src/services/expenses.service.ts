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

    // Delete expense (Robust implementation)
    async deleteExpense(expenseId: string) {
        console.log('[ExpensesService] deleteExpense called with ID:', expenseId);

        try {
            // 1. Get expense details to check for receipt
            const { data: expense, error: fetchError } = await supabase
                .from('expenses')
                .select('receipt_id')
                .eq('id', expenseId)
                .single();

            if (fetchError) {
                console.warn('[ExpensesService] Could not fetch expense details. Proceeding with blind delete.', fetchError);
            }

            // 2. If there is a receipt, clean it up (Storage + DB)
            if (expense?.receipt_id) {
                console.log('[ExpensesService] Found receipt_id:', expense.receipt_id);

                // Get storage path from receipts table
                const { data: receipt, error: receiptError } = await supabase
                    .from('receipts')
                    .select('storage_path')
                    .eq('id', expense.receipt_id)
                    .single();

                if (receipt?.storage_path) {
                    console.log('[ExpensesService] Attempting to delete file from storage:', receipt.storage_path);
                    const { error: storageError } = await supabase.storage
                        .from('receipts')
                        .remove([receipt.storage_path]);

                    if (storageError) {
                        console.error('[ExpensesService] Storage delete error (non-blocking):', storageError);
                    } else {
                        console.log('[ExpensesService] Storage file deleted successfully');
                    }
                }

                // Delete receipt record (this might trigger SET NULL on expense, which is fine)
                const { error: receiptDbError } = await supabase
                    .from('receipts')
                    .delete()
                    .eq('id', expense.receipt_id);

                if (receiptDbError) {
                    console.error('[ExpensesService] Receipt DB delete error:', receiptDbError);
                } else {
                    console.log('[ExpensesService] Receipt record deleted successfully');
                }
            }

            // 3. Delete the expense record (using secure RPC first)
            const { error } = await supabase.rpc('delete_expense', { expense_id: expenseId });

            if (error) {
                console.error('[ExpensesService] RPC delete error:', JSON.stringify(error));

                // Fallback to standard delete if RPC doesn't exist or fails (e.g. user hasn't run SQL yet)
                console.log('[ExpensesService] Falling back to standard delete...');
                const { error: deleteError, count } = await supabase
                    .from('expenses')
                    .delete({ count: 'exact' })
                    .eq('id', expenseId);

                if (deleteError) throw deleteError;
                console.log(`[ExpensesService] Standard delete successful. Rows affected: ${count}`);

                if (count === 0) {
                    console.warn('[ExpensesService] Warning: Standard delete reported success but 0 rows affected.');
                }
                return;
            }

            console.log('[ExpensesService] RPC delete successful');
        } catch (err) {
            console.error('[ExpensesService] Unexpected error deleting expense:', err);
            throw err;
        }
    },

    // Get categories
    async getCategories(userId: string, type: 'expense' | 'income' | 'all' = 'expense') {
        let query = supabase
            .from('categories')
            .select('*')
            .or(`user_id.eq.${userId},is_default.eq.true`);

        if (type !== 'all') {
            query = query.eq('type', type);
        }

        const { data, error } = await query;
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
