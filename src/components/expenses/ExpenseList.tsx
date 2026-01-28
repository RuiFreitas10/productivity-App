import React from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { ExpenseCard } from './ExpenseCard';
import { ExpenseWithCategory } from '../../types/expense.types';
import { theme } from '../../theme/theme';

interface ExpenseListProps {
    expenses: ExpenseWithCategory[];
    onExpensePress?: (expense: ExpenseWithCategory) => void;
    onRefresh?: () => void;
    refreshing?: boolean;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
    expenses,
    onExpensePress,
    onRefresh,
    refreshing = false,
}) => {
    if (expenses.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyText}>Sem despesas registadas</Text>
                <Text style={styles.emptySubtext}>
                    Adicione a sua primeira despesa
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.list}>
            {expenses.map((item) => (
                <ExpenseCard
                    key={item.id}
                    merchant={item.merchant || 'Sem comerciante'}
                    date={item.date}
                    amount={item.amount}
                    currency={item.currency}
                    categoryIcon={item.category?.icon || '❓'}
                    onPress={() => onExpensePress?.(item)}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    list: {
        paddingBottom: theme.spacing.xl,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.xxl * 2,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: theme.spacing.md,
    },
    emptyText: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.sm,
    },
    emptySubtext: {
        ...theme.typography.body,
        color: theme.colors.text.secondary,
    },
});
