// Database types generated from Supabase schema
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    full_name: string | null;
                    avatar_url: string | null;
                    currency: string;
                    locale: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
            };
            categories: {
                Row: {
                    id: string;
                    user_id: string | null;
                    name: string;
                    icon: string | null;
                    color: string | null;
                    type: 'expense' | 'income';
                    is_default: boolean;
                    created_at: string;
                };
            };
            receipts: {
                Row: {
                    id: string;
                    user_id: string;
                    image_url: string;
                    storage_path: string;
                    uploaded_at: string;
                };
            };
            expenses: {
                Row: {
                    id: string;
                    user_id: string;
                    receipt_id: string | null;
                    merchant: string | null;
                    date: string;
                    amount: number;
                    currency: string;
                    category_id: string | null;
                    payment_method: string | null;
                    notes: string | null;
                    is_ai_extracted: boolean;
                    confidence_score: number | null;
                    raw_extraction_json: any;
                    items: any;
                    created_at: string;
                    updated_at: string;
                };
            };
            // Add other table types as needed
            habits: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    icon: string | null;
                    color: string | null;
                    frequency: 'daily' | 'weekly' | 'custom';
                    target_days_per_week: number | null;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['habits']['Row'], 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['habits']['Insert']>;
            };
            habit_logs: {
                Row: {
                    id: string;
                    habit_id: string;
                    user_id: string;
                    logged_date: string;
                    is_completed: boolean;
                    notes: string | null;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['habit_logs']['Row'], 'created_at'>;
                Update: Partial<Database['public']['Tables']['habit_logs']['Insert']>;
            };
            goals: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    type: 'expense_budget' | 'habit_target';
                    target_value: number;
                    category_id: string | null;
                    habit_id: string | null;
                    month: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['goals']['Row'], 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['goals']['Insert']>;
            };
        };
    };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Receipt = Database['public']['Tables']['receipts']['Row'];
export type Expense = Database['public']['Tables']['expenses']['Row'];
