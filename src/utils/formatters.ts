import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';

export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency,
    }).format(amount);
};

export const formatDate = (date: string | Date, formatStr: string = 'dd MMM, HH:mm'): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: pt });
};

export const formatDateShort = (date: string | Date): string => {
    return formatDate(date, 'dd MMM');
};

export const formatDateTime = (date: string | Date): string => {
    return formatDate(date, "dd MMM, HH:mm");
};

export const formatMonthYear = (date: string | Date): string => {
    return formatDate(date, 'MMMM yyyy');
};
