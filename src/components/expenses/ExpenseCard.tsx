import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card } from '../ui/Card';
import { theme } from '../../theme/theme';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

interface ExpenseCardProps {
    merchant: string | null;
    date: string;
    amount: number;
    currency: string;
    categoryIcon?: string;
    onPress?: () => void;
    onLongPress?: () => void; // New Prop
    type?: 'income' | 'expense';
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
    merchant,
    date,
    amount,
    currency,
    categoryIcon,
    onPress,
    onLongPress,
    type = 'expense',
}) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={onPress}
                onLongPress={onLongPress} // Connect Long Press
                delayLongPress={500} // Half second delay
                activeOpacity={0.7}
                style={styles.touchable}
            >
                <Card style={styles.card}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>{categoryIcon || '📌'}</Text>
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.merchant}>{merchant || (type === 'income' ? 'Receita' : 'Despesa')}</Text>
                        <Text style={styles.date}>{formatDateTime(date)}</Text>
                    </View>
                    <Text style={[
                        styles.amount,
                        type === 'income' && { color: '#4CAF50' }
                    ]}>
                        {type === 'income' ? '+' : '-'} {formatCurrency(amount, currency)}
                    </Text>
                </Card>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.sm,
    },
    touchable: {
        width: '100%',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
    },
    iconContainer: {
        width: 40,
        height: 40,
        backgroundColor: theme.colors.background.tertiary,
        borderRadius: theme.borderRadius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    icon: {
        fontSize: 20,
    },
    content: {
        flex: 1,
    },
    merchant: {
        ...theme.typography.body,
        color: theme.colors.text.primary,
        fontWeight: '500',
        marginBottom: 2,
    },
    date: {
        ...theme.typography.caption,
        color: theme.colors.text.secondary,
    },
    amount: {
        ...theme.typography.body,
        color: theme.colors.text.primary,
        fontWeight: '600',
    }
});
