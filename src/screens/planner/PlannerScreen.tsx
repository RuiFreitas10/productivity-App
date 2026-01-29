import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    Alert,
    ScrollView,
    Dimensions
} from 'react-native';
import { theme } from '../../theme/theme';
import { useAuthStore } from '../../store/authStore';
import { plannerService, Habit, HabitLog } from '../../services/planner.service';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const COLUMN_WIDTH = 60;
const ROW_HEIGHT = 60;
const HEADER_HEIGHT = 50;
const HABIT_COLUMN_WIDTH = 140;

const PlannerScreen = () => {
    const { user } = useAuthStore();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [logs, setLogs] = useState<HabitLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [days, setDays] = useState<Date[]>([]);

    // Add Habit Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [newHabitTitle, setNewHabitTitle] = useState('');
    const [creating, setCreating] = useState(false);

    const loadData = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);

            const start = startOfMonth(currentMonth);
            const end = endOfMonth(currentMonth);

            const daysInMonth = eachDayOfInterval({ start, end });
            setDays(daysInMonth);

            const [fetchedHabits, fetchedLogs] = await Promise.all([
                plannerService.getHabits(user.id),
                plannerService.getHabitLogsRange(user.id, start.toISOString(), end.toISOString())
            ]);

            setHabits(fetchedHabits || []);
            setLogs(fetchedLogs || []);
        } catch (error) {
            console.error('Error loading planner data', error);
        } finally {
            setLoading(false);
        }
    }, [user, currentMonth]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const changeMonth = (increment: number) => {
        setCurrentMonth(prev => increment > 0 ? addMonths(prev, 1) : subMonths(prev, 1));
    };

    const handleToggleHabit = async (habitId: string, date: Date) => {
        if (!user) return;
        const dateStr = date.toISOString().split('T')[0];

        try {
            // Optimistic update
            const isCompleted = logs.some(l => l.habit_id === habitId && l.logged_date === dateStr);
            let newLogs = [...logs];

            if (isCompleted) {
                newLogs = newLogs.filter(l => !(l.habit_id === habitId && l.logged_date === dateStr));
            } else {
                newLogs.push({
                    id: 'temp-' + Date.now(),
                    habit_id: habitId,
                    user_id: user.id,
                    logged_date: dateStr,
                    is_completed: true,
                    created_at: new Date().toISOString()
                } as HabitLog);
            }
            setLogs(newLogs);

            await plannerService.toggleHabitCompletion(user.id, habitId, dateStr);
        } catch (error) {
            console.error('Error toggling habit', error);
            loadData(); // Revert on error
        }
    };

    const handleCreateHabit = async () => {
        if (!user || !newHabitTitle.trim()) return;

        try {
            setCreating(true);
            await plannerService.createHabit(user.id, {
                title: newHabitTitle.trim(),
                color: theme.colors.accent.primary,
                icon: '📝'
            });
            setModalVisible(false);
            setNewHabitTitle('');
            loadData();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível criar o hábito');
        } finally {
            setCreating(false);
        }
    };

    const renderGrid = () => {
        const gridWidth = days.length * COLUMN_WIDTH;
        const today = new Date();

        return (
            <View style={styles.gridContainer}>
                {/* Vertical Scroll for the whole list */}
                <ScrollView
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    <View style={{ flexDirection: 'row' }}>

                        {/* LEFT COLUMN (FIXED NAMES) */}
                        <View style={styles.fixedColumn}>
                            {/* Header for Habit Names */}
                            <View style={[styles.fixedHeaderCell]}>
                                <Text style={styles.headerText}>Hábito</Text>
                            </View>

                            {/* List of Habit Names */}
                            {habits.map((habit) => (
                                <View key={habit.id} style={styles.fixedHabitCell}>
                                    <Text style={styles.habitName} numberOfLines={2}>{habit.title}</Text>
                                </View>
                            ))}
                        </View>

                        {/* RIGHT AREA (SCROLLABLE DAYS) */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={true}
                            contentContainerStyle={{ paddingLeft: HABIT_COLUMN_WIDTH }}
                        >
                            <View>
                                {/* HEADER ROW (DAYS) */}
                                <View style={styles.headerRow}>
                                    {days.map((day, index) => {
                                        const isToday = isSameDay(day, today);
                                        return (
                                            <View
                                                key={index}
                                                style={[
                                                    styles.headerCell,
                                                    isToday && styles.todayHeaderCell
                                                ]}
                                            >
                                                <Text style={[styles.dayName, isToday && styles.todayText]}>
                                                    {format(day, 'EEE', { locale: pt })}
                                                </Text>
                                                <Text style={[styles.dayNumber, isToday && styles.todayText]}>
                                                    {format(day, 'dd')}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>

                                {/* HABIT ROWS (CHECKBOXES) */}
                                {habits.map((habit) => (
                                    <View key={habit.id} style={styles.habitRow}>
                                        {days.map((day, index) => {
                                            const dateStr = day.toISOString().split('T')[0];
                                            const isCompleted = logs.some(l => l.habit_id === habit.id && l.logged_date === dateStr);
                                            const isToday = isSameDay(day, today);

                                            return (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={[styles.cell, isToday && styles.todayCell]}
                                                    onPress={() => handleToggleHabit(habit.id, day)}
                                                    activeOpacity={0.7}
                                                >
                                                    <View style={[styles.checkbox, isCompleted && styles.checkboxChecked]}>
                                                        {isCompleted && <Text style={styles.checkmark}>✓</Text>}
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    {habits.length === 0 && (
                        <View style={[styles.emptyState, { marginLeft: HABIT_COLUMN_WIDTH }]}>
                            <Text style={styles.emptyText}>Sem hábitos ainda.</Text>
                            <Button
                                title="Criar Primeiro Hábito"
                                onPress={() => setModalVisible(true)}
                                size="sm"
                                style={{ marginTop: 16 }}
                            />
                        </View>
                    )}
                    <View style={{ height: 100 }} />
                </ScrollView>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Planner Matrix</Text>
                    <Text style={styles.subtitle}>
                        {format(currentMonth, 'MMMM yyyy', { locale: pt })}
                    </Text>
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthBtn}>
                        <Text style={styles.monthBtnText}>{'<'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthBtn}>
                        <Text style={styles.monthBtnText}>{'>'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator color={theme.colors.accent.primary} style={{ marginTop: 20 }} />
            ) : (
                renderGrid()
            )}

            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Novo Hábito</Text>

                        <Input
                            placeholder="Nome do hábito (ex: Ler 10 páginas)"
                            value={newHabitTitle}
                            onChangeText={setNewHabitTitle}
                            autoFocus
                        />

                        <View style={styles.modalButtons}>
                            <Button
                                title="Cancelar"
                                onPress={() => setModalVisible(false)}
                                variant="outline"
                                style={{ flex: 1, marginRight: 8 }}
                            />
                            <Button
                                title="Criar"
                                onPress={handleCreateHabit}
                                loading={creating}
                                style={{ flex: 1, marginLeft: 8 }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
        marginBottom: theme.spacing.md,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text.primary,
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.text.secondary,
        textTransform: 'capitalize',
        marginTop: 4,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    monthBtn: {
        padding: 8,
        backgroundColor: theme.colors.background.tertiary,
        borderRadius: 8,
        width: 36,
        alignItems: 'center',
    },
    monthBtnText: {
        color: theme.colors.text.primary,
        fontSize: 18,
        fontWeight: 'bold',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.accent.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonText: {
        fontSize: 24,
        color: '#FFF',
        marginTop: -2
    },
    gridContainer: {
        flex: 1,
        backgroundColor: theme.colors.background.secondary,
        borderTopLeftRadius: theme.borderRadius.xl,
        borderTopRightRadius: theme.borderRadius.xl,
        overflow: 'hidden',
    },
    fixedColumn: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: HABIT_COLUMN_WIDTH,
        zIndex: 10,
        backgroundColor: theme.colors.background.secondary,
        borderRightWidth: 1,
        borderColor: theme.colors.background.tertiary,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    fixedHeaderCell: {
        height: HEADER_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: theme.colors.background.tertiary,
        backgroundColor: theme.colors.background.secondary,
    },
    fixedHabitCell: {
        height: ROW_HEIGHT,
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.md,
        borderBottomWidth: 1,
        borderColor: theme.colors.background.tertiary,
        backgroundColor: theme.colors.background.secondary,
    },
    headerRow: {
        flexDirection: 'row',
        height: HEADER_HEIGHT,
    },
    headerCell: {
        width: COLUMN_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: theme.colors.background.tertiary,
    },
    todayHeaderCell: {
        backgroundColor: theme.colors.background.tertiary,
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.accent.primary,
    },
    headerText: {
        ...theme.typography.caption,
        color: theme.colors.text.secondary,
        fontWeight: 'bold',
    },
    dayName: {
        ...theme.typography.caption,
        fontSize: 10,
        color: theme.colors.text.tertiary,
        textTransform: 'uppercase',
    },
    dayNumber: {
        ...theme.typography.body,
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text.secondary,
    },
    todayText: {
        color: theme.colors.accent.primary,
    },
    todayCell: {
        backgroundColor: 'rgba(158, 158, 158, 0.05)', // Subtle highlight for the column
    },
    habitRow: {
        flexDirection: 'row',
        height: ROW_HEIGHT,
    },
    habitName: {
        ...theme.typography.caption,
        color: theme.colors.text.primary,
        fontWeight: '500',
    },
    cell: {
        width: COLUMN_WIDTH,
        height: ROW_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: theme.colors.background.tertiary,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: theme.colors.text.tertiary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: theme.colors.accent.primary,
        borderColor: theme.colors.accent.primary,
    },
    checkmark: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    emptyState: {
        padding: theme.spacing.xl,
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        color: theme.colors.text.tertiary,
        marginBottom: theme.spacing.md,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: theme.spacing.xl,
    },
    modalContent: {
        backgroundColor: theme.colors.background.secondary,
        padding: theme.spacing.xl,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: theme.colors.background.tertiary,
    },
    modalTitle: {
        ...theme.typography.h2,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.xl,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        marginTop: theme.spacing.xl,
    }
});

export default PlannerScreen;
