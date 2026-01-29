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
                        console.log('Delete button pressed, triggering onDelete...');
                        if (onDelete) onDelete();
                    }}
                    activeOpacity={0.8}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <Text style={styles.deleteIcon}>—</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.sm,
        position: 'relative',
        // Add padding to ensure the absolute positioned button stays within the parent view bounds
        // This is critical for touch events on Android
        paddingTop: 12,
        paddingRight: 12,
    },
    touchable: {
        flex: 1,
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
    deleteButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 32, // Increased size
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FF5252', // Red
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        elevation: 10,
        zIndex: 9999, // Ensure it's on top
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    deleteIcon: {
        color: 'white',
        fontSize: 20, // Increased font size
        fontWeight: 'bold',
        marginTop: -2,
    }
});
