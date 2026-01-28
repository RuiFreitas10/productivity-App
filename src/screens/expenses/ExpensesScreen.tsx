import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, RefreshControl, TouchableOpacity, ScrollView, Platform } from 'react-native';
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
    const [showAddModal, setShowAddModal] = useState(false);
    const [balance, setBalance] = useState(0);

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

            // Calculate pseudo-balance (just total spent for now to show something)
            const total = (fetchedExpenses || []).reduce((sum, e) => sum + Number(e.amount), 0);
            setBalance(total);

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
                        <Text style={styles.balanceLabel}>{selectedPeriod === 'month' ? 'Gasto este mês' : 'Total Gasto'}</Text>
                        <Text style={styles.balanceValue}>{formatCurrency(balance)}</Text>
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
                            categoryIcon={expense.category?.icon}
                            onPress={() => { }}
                        />
                    ))
                )}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Floating Action Button (Optional if tab bar handles it, but good for manual entry) */}
            <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>

            <ManualExpenseModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={fetchExpenses}
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

    fab: { position: 'absolute', bottom: 100, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.accent.primary, justifyContent: 'center', alignItems: 'center', shadowColor: theme.colors.accent.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
    fabIcon: { fontSize: 32, color: '#FFF', marginTop: -2 }
});
