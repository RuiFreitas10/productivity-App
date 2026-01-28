import { Expense, Category } from './database.types';

export interface ExpenseFormData {
    merchant?: string;
    date: Date;
    amount: number;
    currency: string;
    categoryId?: string;
    paymentMethod?: string;
    notes?: string;
}

export interface ExpenseWithCategory extends Expense {
    category?: Category;
}

export interface ReceiptExtractionResult {
    merchant: string;
    date: string;
    total: number;
    currency: string;
    category?: string;
    paymentMethod?: string;
    items?: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    confidence: number;
}

export interface ExpenseStats {
    total: number;
    percentageChange: number;
    byCategory: Array<{
        category: string;
        amount: number;
        color: string;
    }>;
}
