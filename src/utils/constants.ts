// Default expense categories with Portuguese names
export const DEFAULT_CATEGORIES = [
    { name: 'Alimentação', icon: '🍔', color: '#D4A574', type: 'expense' },
    { name: 'Transporte', icon: '🚗', color: '#4A5A6A', type: 'expense' },
    { name: 'Casa', icon: '🏠', color: '#5A6A7A', type: 'expense' },
    { name: 'Saúde', icon: '💊', color: '#6A7A8A', type: 'expense' },
    { name: 'Lazer', icon: '🎮', color: '#3A4A5A', type: 'expense' },
    { name: 'Ginásio', icon: '💪', color: '#6A7A8A', type: 'expense' },
    { name: 'Combustível', icon: '⛽', color: '#4A5A6A', type: 'expense' },
    { name: 'Compras', icon: '🛍️', color: '#5A6A7A', type: 'expense' },
    { name: 'Educação', icon: '📚', color: '#6A7A8A', type: 'expense' },
    { name: 'Outros', icon: '📌', color: '#707070', type: 'expense' },
];

export const PAYMENT_METHODS = ['Dinheiro',
    'Multibanco',
    'Cartão de Crédito',
    'Cartão de Débito',
    'MB Way',
    'Transferência',
];

export const CURRENCY_SYMBOLS: Record<string, string> = {
    EUR: '€',
    USD: '$',
    GBP: '£',
};
