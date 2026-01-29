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
    onDelete?: () => void;
    isSelected?: boolean;
    type?: 'income' | 'expense';
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
    merchant,
    date,
    amount,
    currency,
    categoryIcon,
    onPress,
    onDelete,
    isSelected = false,
    type = 'expense',
}) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.touchable}>
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

            {isSelected && (
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                        if (onDelete) onDelete();
                    }}
                    activeOpacity={0.7}
                >
                    <Text style={{ fontSize: 18 }}>🗑️</Text>
                    <Text style={styles.deleteIcon}>Eliminar Transação</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.sm,
        // No padding needed for relative layout
    },
    touchable: {
        // flex: 1, // Removed flex 1 to allow container to grow
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
    },
    // Relative Delete Button Styles
    deleteButton: {
        marginTop: 8,
        backgroundColor: '#FF5252', // Back to Red
        paddingVertical: 12,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%', // Full width
    },
    deleteIcon: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    }
});
