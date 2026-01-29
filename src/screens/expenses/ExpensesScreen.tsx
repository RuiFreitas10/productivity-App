import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, RefreshControl, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../../theme/theme';
import { expensesService } from '../../services/expenses.service';
import { useAuthStore } from '../../store/authStore';
import { Expense } from '../../types/database.types';
import { ExpenseCard } from '../../components/expenses/ExpenseCard';
import { ManualExpenseModal } from '../../components/expenses/ManualExpenseModal';
import { LinearGradient } from 'expo-linear-gradient';
import { formatCurrency } from '../../utils/formatters';

const PERIODS = [
    { label: 'Hoje', value: 'today' },
    { label: 'Semana', value: 'week' },
    { label: 'Mês', value: 'month' },
    { label: 'Total', value: 'all' }
];

export const ExpensesScreen = ({ navigation }: any) => {
    const { user } = useAuthStore();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [activeModalType, setActiveModalType] = useState<'expense' | 'income' | null>(null);
    const [balance, setBalance] = useState(0);

    const [income, setIncome] = useState(0);
    const [expense, setExpense] = useState(0);
    const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);

    const fetchExpenses = async () => {
        if (!user) return;
        try {
            // Calculate date range based on period
            const now = new Date();
            let startDate = new Date();

            if (selectedPeriod === 'today') {
                startDate.setHours(0, 0, 0, 0);
            } else if (selectedPeriod === 'week') {
                startDate.setDate(now.getDate() - 7);
            } else if (selectedPeriod === 'month') {
                startDate.setDate(1);
            } else {
                startDate = new Date(1970, 0, 1); // All time
            }

            const endDate = new Date();
            endDate.setHours(23, 59, 59, 999);

            const fetchedExpenses = await expensesService.getExpenses(user.id, {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            });
            setExpenses(fetchedExpenses || []);

            setExpenses(fetchedExpenses || []);

            // Calculate totals
            let totalIncome = 0;
            let totalExpense = 0;

            (fetchedExpenses || []).forEach(e => {
                const amount = Number(e.amount);
                // Check category type if available
                const type = (e as any).category?.type || 'expense';

                if (type === 'income') {
                    totalIncome += amount;
                } else {
                    totalExpense += amount;
                }
            });

            setIncome(totalIncome);
            setExpense(totalExpense);
            setBalance(totalIncome - totalExpense);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchExpenses();
        }, [user, selectedPeriod])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchExpenses();
    };

    const confirmDelete = (item: Expense) => {
        console.log('confirmDelete called for item:', item.id);
        Alert.alert(
            "Eliminar",
            "Deseja eliminar este registo?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            console.log('Deleting expense:', item.id);
                            setLoading(true);
                            await expensesService.deleteExpense(item.id);
                            console.log('Expense deleted, refreshing...');
                            setSelectedExpenseId(null); // Clear selection
                            await fetchExpenses();
                            console.log('Expenses refreshed');
                        } catch (error) {
                            console.error('Error deleting expense:', error);
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Premium Header */}
            <LinearGradient
                colors={[theme.colors.background.secondary, theme.colors.background.primary]}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.greeting}>Olá, {user?.email?.split('@')[0]}</Text>
                        <Text style={styles.balanceLabel}>{selectedPeriod === 'month' ? 'Saldo este mês' : 'Saldo Total'}</Text>
                        <Text style={styles.balanceValue}>{formatCurrency(balance)}</Text>

                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Receitas</Text>
                                <Text style={[styles.statValue, { color: '#4CAF50' }]}>{formatCurrency(income)}</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Despesas</Text>
                                <Text style={[styles.statValue, { color: '#FF5252' }]}>{formatCurrency(expense)}</Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.profileButton}>
                        <Text style={styles.profileIcon}>👤</Text>
                    </TouchableOpacity>
                </View>

                {/* Period Selector */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodContainer}>
                    {PERIODS.map(p => (
                        <TouchableOpacity
                            key={p.value}
                            style={[styles.periodButton, selectedPeriod === p.value && styles.periodButtonActive]}
                            onPress={() => setSelectedPeriod(p.value)}
                        >
                            <Text style={[styles.periodText, selectedPeriod === p.value && styles.periodTextActive]}>
                                {p.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </LinearGradient>

            {/* Content Body */}
            <ScrollView
                style={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.accent.primary} />}
            >
                <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>Transações Recentes</Text>
                </View>

                {expenses.length === 0 && !loading ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>Sem despesas neste período.</Text>
                    </View>
                ) : (
                    expenses.map(expense => (
                        <ExpenseCard
                            key={expense.id}
                            merchant={expense.merchant}
                            date={expense.date}
                            amount={expense.amount}
                            currency={expense.currency}
                            categoryIcon={(expense as any).category?.icon}
                            onPress={() => setSelectedExpenseId(selectedExpenseId === expense.id ? null : expense.id)}
                            isSelected={selectedExpenseId === expense.id}
                            onDelete={() => confirmDelete(expense)}
                        />
                    ))
                )}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.fabContainer}>
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: '#FF5252', marginRight: 16 }]}
                    onPress={() => setActiveModalType('expense')}
                >
                    <Text style={styles.fabIcon}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: '#4CAF50' }]}
                    onPress={() => setActiveModalType('income')}
                >
                    <Text style={styles.fabIcon}>+</Text>
                </TouchableOpacity>
            </View>

            <ManualExpenseModal
                visible={!!activeModalType}
                onClose={() => setActiveModalType(null)}
                onSuccess={fetchExpenses}
                type={activeModalType || 'expense'}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary },
    header: { paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: theme.spacing.xl, marginBottom: 20 },
    greeting: { ...theme.typography.caption, color: theme.colors.text.secondary, marginBottom: 4 },
    balanceLabel: { ...theme.typography.body, color: theme.colors.text.tertiary },
    balanceValue: { ...theme.typography.h1, fontSize: 36, color: theme.colors.text.primary },
    profileButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.background.tertiary, justifyContent: 'center', alignItems: 'center' },
    profileIcon: { fontSize: 20 },

    periodContainer: { paddingHorizontal: theme.spacing.xl, marginTop: 10 },
    periodButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: 'transparent', marginRight: 10, borderWidth: 1, borderColor: theme.colors.text.tertiary },
    periodButtonActive: { backgroundColor: theme.colors.accent.primary, borderColor: theme.colors.accent.primary },
    periodText: { ...theme.typography.caption, color: theme.colors.text.secondary },
    periodTextActive: { color: '#FFF', fontWeight: 'bold' },

    content: { flex: 1, paddingHorizontal: theme.spacing.lg, paddingTop: 20 },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    listTitle: { ...theme.typography.h3, color: theme.colors.text.primary },

    emptyState: { alignItems: 'center', marginTop: 50 },
    emptyText: { ...theme.typography.body, color: theme.colors.text.tertiary },

    fabContainer: { position: 'absolute', bottom: 100, right: 20, flexDirection: 'row' },
    fab: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
    fabIcon: { fontSize: 32, color: '#FFF', marginTop: -2 },

    statsRow: { flexDirection: 'row', marginTop: 15, alignItems: 'center' },
    statItem: { marginRight: 15 },
    statLabel: { ...theme.typography.caption, color: theme.colors.text.tertiary, fontSize: 12 },
    statValue: { ...theme.typography.h3, fontSize: 16 },
    statDivider: { width: 1, height: 24, backgroundColor: theme.colors.text.tertiary, marginRight: 15, opacity: 0.3 }
});
