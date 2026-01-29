import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
}) => {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <Card style={styles.card}>
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>{categoryIcon || '📌'}</Text>
                </View>
                <View style={styles.content}>
                    <Text style={styles.merchant}>{merchant || 'Despesa'}</Text>
                    <Text style={styles.date}>{formatDateTime(date)}</Text>
                </View>
                <Text style={styles.amount}>- {formatCurrency(amount, currency)}</Text>

                {isSelected && (
                    <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                        <Text style={styles.deleteIcon}>—</Text>
                    </TouchableOpacity>
                )}
            </Card>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
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
    deleteButton: {
        position: 'absolute',
        top: -10,
        right: -10,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FF5252', // Red
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    deleteIcon: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: -2,
    }
});
