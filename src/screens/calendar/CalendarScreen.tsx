import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
import { useAuthStore } from '../../store/authStore';
import { expensesService } from '../../services/expenses.service';
import { Expense } from '../../types/database.types';
import { theme } from '../../theme/theme';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useFocusEffect } from '@react-navigation/native';

import { ResponsiveContainer } from '../../components/ui/ResponsiveContainer';
// Configure Portuguese locale
LocaleConfig.locales['pt'] = {
    monthNames: [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    monthNamesShort: ['Jan.', 'Fev.', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul.', 'Ago', 'Set.', 'Out.', 'Nov.', 'Dez.'],
    dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    dayNamesShort: ['Dom.', 'Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.', 'Sáb.'],
    today: "Hoje"
};
LocaleConfig.defaultLocale = 'pt';

const CalendarScreen = () => {
    const { user } = useAuthStore();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [markedDates, setMarkedDates] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [monthExpenses, setMonthExpenses] = useState<Expense[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch expenses for the current month
    const fetchExpenses = useCallback(async (dateString: string) => {
        if (!user) return;

        try {
            setLoading(true);
            const date = new Date(dateString);
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];

            const data = await expensesService.getExpenses(user.id, {
                startDate: startOfMonth,
                endDate: endOfMonth
            });

            // Cast to strictly typed Expense array if needed, assuming service returns correct shape
            const loadedExpenses = (data || []) as unknown as Expense[];
            setMonthExpenses(loadedExpenses);

            // Process markers
            const markers: any = {};
            loadedExpenses.forEach(exp => {
                const date = exp.date; // already YYYY-MM-DD from view
                if (!markers[date]) {
                    markers[date] = {
                        marked: true,
                        dotColor: theme.colors.accent.primary,
                    };
                }
            });

            // Add selection style
            const currentSelected = markers[selectedDate] || {};
            markers[selectedDate] = {
                ...currentSelected,
                selected: true,
                selectedColor: theme.colors.accent.primary,
                disableTouchEvent: true
            };

            setMarkedDates(markers);
        } catch (error) {
            console.error('Error fetching calendar expenses:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user, selectedDate]);

    useFocusEffect(
        useCallback(() => {
            fetchExpenses(selectedDate);
        }, [fetchExpenses, selectedDate])
    );

    // Filter expenses for selected date
    const selectedDateExpenses = monthExpenses.filter(e => e.date === selectedDate);

    // Calculate income and expenses separately
    let totalIncome = 0;
    let totalExpense = 0;
    selectedDateExpenses.forEach(e => {
        const amount = Number(e.amount);
        const type = (e as any).category?.type || 'expense';
        if (type === 'income') {
            totalIncome += amount;
        } else {
            totalExpense += amount;
        }
    });
    const totalSelectedDate = totalIncome - totalExpense;

    const onDayPress = (day: DateData) => {
        setSelectedDate(day.dateString);
    };

    const renderExpenseItem = ({ item }: { item: Expense & { category?: any } }) => {
        const type = item.category?.type || 'expense';
        const isIncome = type === 'income';

        return (
            <View style={styles.expenseItem}>
                <View style={styles.expenseLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: item.category?.color || theme.colors.background.tertiary }]}>
                        <Text style={styles.categoryIcon}>{item.category?.icon || '💰'}</Text>
                    </View>
                    <View style={styles.expenseInfo}>
                        <Text style={styles.merchant}>{item.merchant || (isIncome ? 'Receita' : 'Despesa')}</Text>
                        <Text style={styles.category}>{item.category?.name || 'Sem categoria'}</Text>
                    </View>
                </View>
                <View>
                    <Text style={[styles.amount, { color: isIncome ? '#4CAF50' : '#FF5252' }]}>
                        {isIncome ? '+' : '-'}€{Number(item.amount).toFixed(2)}
                    </Text>
                </View>
            </View>
        );
    };

    const onMonthChange = (date: DateData) => {
        // Refresh data when month changes
        fetchExpenses(date.dateString);
    };

    return (
        <ResponsiveContainer>
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Calendário</Text>
            </View>

            <Calendar
                theme={{
                    backgroundColor: theme.colors.background.secondary,
                    calendarBackground: theme.colors.background.secondary,
                    textSectionTitleColor: theme.colors.text.tertiary,
                    selectedDayBackgroundColor: theme.colors.accent.primary,
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: theme.colors.accent.primary,
                    dayTextColor: theme.colors.text.primary,
                    textDisabledColor: theme.colors.text.tertiary,
                    dotColor: theme.colors.accent.primary,
                    selectedDotColor: '#ffffff',
                    arrowColor: theme.colors.accent.primary,
                    monthTextColor: theme.colors.text.primary,
                    indicatorColor: theme.colors.accent.primary,
                    textDayFontWeight: '400',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: '400',
                    textDayFontSize: 16,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 14
                }}
                current={selectedDate}
                onDayPress={onDayPress}
                markedDates={markedDates}
                onMonthChange={onMonthChange}
                enableSwipeMonths={true}
            />

            <View style={styles.listContainer}>
                <View style={styles.listHeader}>
                    <Text style={styles.dateHeader}>
                        {format(parseISO(selectedDate), "d 'de' MMMM", { locale: pt })}
                    </Text>
                    <Text style={[styles.totalHeader, { color: totalSelectedDate >= 0 ? '#4CAF50' : '#FF5252' }]}>
                        Saldo: €{totalSelectedDate.toFixed(2)}
                    </Text>
                </View>

                {loading ? (
                    <ActivityIndicator color={theme.colors.accent.primary} style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={selectedDateExpenses}
                        renderItem={renderExpenseItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Sem transações neste dia</Text>
                            </View>
                        }
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={() => {
                                    setRefreshing(true);
                                    fetchExpenses(selectedDate);
                                }}
                                tintColor={theme.colors.accent.primary}
                            />
                        }
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
        paddingTop: 50, // Safe area substitute
    },
    header: {
        paddingHorizontal: theme.spacing.xl,
        marginBottom: theme.spacing.md,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text.primary,
    },
    listContainer: {
        flex: 1,
        backgroundColor: theme.colors.background.secondary,
        marginTop: theme.spacing.md,
        borderTopLeftRadius: theme.borderRadius.xl,
        borderTopRightRadius: theme.borderRadius.xl,
        paddingTop: theme.spacing.lg,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
        marginBottom: theme.spacing.md,
    },
    dateHeader: {
        ...theme.typography.h3,
        color: theme.colors.text.secondary,
        textTransform: 'capitalize',
    },
    totalHeader: {
        ...theme.typography.h3,
        color: theme.colors.accent.primary,
    },
    listContent: {
        paddingHorizontal: theme.spacing.xl,
        paddingBottom: 100,
    },
    expenseItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.background.tertiary,
    },
    expenseLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    categoryIcon: {
        fontSize: 20,
    },
    expenseInfo: {
        justifyContent: 'center',
    },
    merchant: {
        ...theme.typography.body,
        fontWeight: '600',
        color: theme.colors.text.primary,
    },
    category: {
        ...theme.typography.caption,
        color: theme.colors.text.tertiary,
    },
    amount: {
        ...theme.typography.body,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    emptyContainer: {
        paddingTop: theme.spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        color: theme.colors.text.tertiary,
        fontSize: 14,
    }
});

export default CalendarScreen;
