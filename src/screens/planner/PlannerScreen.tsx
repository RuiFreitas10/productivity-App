import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    Alert,
    ScrollView,
    Dimensions,
    TouchableWithoutFeedback,
    Platform
} from 'react-native';
import { theme } from '../../theme/theme';
import { useAuthStore } from '../../store/authStore';
import { plannerService, Habit, HabitLog } from '../../services/planner.service';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ThemeSelector } from '../../components/settings/ThemeSelector';
import { useThemeStore } from '../../store/themeStore';

const COLUMN_WIDTH = 60;
const ROW_HEIGHT = 60;
const HEADER_HEIGHT = 50;
const HABIT_COLUMN_WIDTH = 140;

const PlannerScreen = () => {
    const { user } = useAuthStore();
    const { colors } = useThemeStore();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [logs, setLogs] = useState<HabitLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [days, setDays] = useState<Date[]>([]);
    const [planners, setPlanners] = useState<any[]>([]);
    const [selectedPlannerId, setSelectedPlannerId] = useState<string | null>(null);
    const [showPlannerSelector, setShowPlannerSelector] = useState(false);
    const [newPlannerTitle, setNewPlannerTitle] = useState('');
    const [creatingPlanner, setCreatingPlanner] = useState(false);
    const [showThemeSelector, setShowThemeSelector] = useState(false);

    // Edit Planner State
    const [editingPlannerId, setEditingPlannerId] = useState<string | null>(null);
    const [editingPlannerTitle, setEditingPlannerTitle] = useState('');

    // Add Habit Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [newHabitTitle, setNewHabitTitle] = useState('');
    const [creating, setCreating] = useState(false);

    const loadPlanners = useCallback(async () => {
        if (!user) return;
        try {
            const fetchedPlanners = await plannerService.getPlanners(user.id);

            if (fetchedPlanners && fetchedPlanners.length > 0) {
                setPlanners(fetchedPlanners);
                if (!selectedPlannerId) {
                    setSelectedPlannerId(fetchedPlanners[0].id);
                }
            } else {
                const defaultPlanner = await plannerService.createPlanner(user.id, 'Principal');
                setPlanners([defaultPlanner]);
                setSelectedPlannerId(defaultPlanner.id);
            }
        } catch (error) {
            console.error('Error loading planners', error);
        }
    }, [user, selectedPlannerId]);

    const loadHabitsData = useCallback(async () => {
        if (!user || !selectedPlannerId) return;
        try {
            setLoading(true);

            const start = startOfMonth(currentMonth);
            const end = endOfMonth(currentMonth);

            const daysInMonth = eachDayOfInterval({ start, end });
            setDays(daysInMonth);

            const [fetchedHabits, fetchedLogs] = await Promise.all([
                plannerService.getHabits(user.id, selectedPlannerId),
                plannerService.getHabitLogsRange(user.id, start.toISOString(), end.toISOString())
            ]);

            setHabits(fetchedHabits || []);
            setLogs(fetchedLogs || []);
        } catch (error) {
            console.error('Error loading habits data', error);
        } finally {
            setLoading(false);
        }
    }, [user, currentMonth, selectedPlannerId]);

    useFocusEffect(
        useCallback(() => {
            loadPlanners();
        }, [loadPlanners])
    );

    useEffect(() => {
        if (selectedPlannerId) {
            loadHabitsData();
        }
    }, [selectedPlannerId, loadHabitsData]);

    const changeMonth = (increment: number) => {
        setCurrentMonth(prev => increment > 0 ? addMonths(prev, 1) : subMonths(prev, 1));
    };

    const handleCreatePlanner = async () => {
        if (!user || !newPlannerTitle.trim()) return;
        try {
            setCreatingPlanner(true);
            const newPlanner = await plannerService.createPlanner(user.id, newPlannerTitle.trim());
            setPlanners([...planners, newPlanner]);
            setSelectedPlannerId(newPlanner.id);
            setNewPlannerTitle('');
            setShowPlannerSelector(false);
        } catch (error) {
            // Alert.alert('Erro', 'Não foi possível criar o planner');
            console.error("Failed to create", error);
        } finally {
            setCreatingPlanner(false);
        }
    }

    const handleUpdatePlanner = async (id: string) => {
        if (!user || !editingPlannerTitle.trim()) return;
        try {
            const updated = await plannerService.updatePlanner(id, editingPlannerTitle.trim());
            setPlanners(planners.map(p => p.id === id ? updated : p));
            setEditingPlannerId(null);
            setEditingPlannerTitle('');
        } catch (error) {
            console.error("Failed to update", error);
        }
    }

    const startEditing = (planner: any) => {
        setEditingPlannerId(planner.id);
        setEditingPlannerTitle(planner.title);
    };

    const handleToggleHabit = async (habitId: string, date: Date) => {
        if (!user) return;
        const dateStr = date.toISOString().split('T')[0];

        try {
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
            loadHabitsData();
        }
    };

    const handleCreateHabit = async () => {
        if (!user || !newHabitTitle.trim() || !selectedPlannerId) return;

        try {
            setCreating(true);
            await plannerService.createHabit(user.id, {
                title: newHabitTitle.trim(),
                color: colors.primary, // Use dynamic color
                icon: '📝',
                plannerId: selectedPlannerId
            });
            setModalVisible(false);
            setNewHabitTitle('');
            loadHabitsData();
        } catch (error) {
            console.error("Failed to create habit", error);
        } finally {
            setCreating(false);
        }
    };

    const renderGrid = () => {
        const today = new Date();

        return (
            <View style={styles.gridContainer}>
                <ScrollView
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    <View style={{ flexDirection: 'row' }}>
                        <View style={styles.fixedColumn}>
                            <View style={[styles.fixedHeaderCell]}>
                                <Text style={styles.headerText}>Hábito</Text>
                            </View>

                            {habits.map((habit) => (
                                <View key={habit.id} style={styles.fixedHabitCell}>
                                    <Text style={styles.habitName} numberOfLines={2}>{habit.title}</Text>
                                </View>
                            ))}
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={true}
                            contentContainerStyle={{ paddingLeft: HABIT_COLUMN_WIDTH }}
                        >
                            <View>
                                <View style={styles.headerRow}>
                                    {days.map((day, index) => {
                                        const isToday = isSameDay(day, today);
                                        return (
                                            <View
                                                key={index}
                                                style={[
                                                    styles.headerCell,
                                                    isToday && {
                                                        backgroundColor: theme.colors.background.tertiary,
                                                        borderBottomWidth: 2,
                                                        borderBottomColor: colors.primary
                                                    }
                                                ]}
                                            >
                                                <Text style={[
                                                    styles.dayName,
                                                    isToday && { color: colors.primary }
                                                ]}>
                                                    {format(day, 'EEE', { locale: pt })}
                                                </Text>
                                                <Text style={[
                                                    styles.dayNumber,
                                                    isToday && { color: colors.primary }
                                                ]}>
                                                    {format(day, 'dd')}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>

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
                                                    <View style={[
                                                        styles.checkbox,
                                                        isCompleted && {
                                                            backgroundColor: colors.primary,
                                                            borderColor: colors.primary
                                                        }
                                                    ]}>
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
                            <Text style={styles.emptyText}>Planner vazio.</Text>
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

    const selectedPlanner = planners.find(p => p.id === selectedPlannerId);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.plannerSelector}
                    onPress={() => setShowPlannerSelector(true)}
                >
                    <View>
                        <Text style={styles.title}>
                            {selectedPlanner ? selectedPlanner.title : 'A Carregar...'}
                            <Text style={{ fontSize: 20 }}> ▾</Text>
                        </Text>
                        <Text style={styles.subtitle}>
                            {format(currentMonth, 'MMMM yyyy', { locale: pt })}
                        </Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.controls}>
                    {/* Theme Selector Button */}
                    <TouchableOpacity onPress={() => setShowThemeSelector(true)} style={[styles.monthBtn, { marginRight: 8 }]}>
                        <Text style={styles.monthBtnText}>🎨</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthBtn}>
                        <Text style={styles.monthBtnText}>{'<'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthBtn}>
                        <Text style={styles.monthBtnText}>{'>'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: colors.primary }]}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
                renderGrid()
            )}

            {/* NEW HABIT MODAL with prevent click-through */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Novo Hábito</Text>
                            <Input
                                placeholder="Nome do hábito"
                                value={newHabitTitle}
                                onChangeText={setNewHabitTitle}
                                autoFocus={Platform.OS !== 'web'} // Avoid web focus issues
                            />
                            <View style={styles.modalButtons}>
                                <Button title="Cancelar" onPress={() => setModalVisible(false)} variant="outline" style={{ flex: 1, marginRight: 8 }} />
                                <Button title="Criar" onPress={handleCreateHabit} loading={creating} style={{ flex: 1, marginLeft: 8 }} />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

            {/* PLANNER SELECTOR MODAL - Fixed for input focus */}
            <Modal
                visible={showPlannerSelector}
                transparent
                animationType="fade"
                onRequestClose={() => setShowPlannerSelector(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowPlannerSelector(false)}
                >
                    <TouchableWithoutFeedback>
                        <View style={styles.selectorContent}>
                            <Text style={styles.modalTitle}>Os meus Planners</Text>

                            <ScrollView style={{ maxHeight: 300 }}>
                                {planners.map(planner => (
                                    <View key={planner.id} style={styles.plannerRow}>
                                        {/* Edit Mode vs View Mode */}
                                        {editingPlannerId === planner.id ? (
                                            <View style={styles.editContainer}>
                                                <Input
                                                    value={editingPlannerTitle}
                                                    onChangeText={setEditingPlannerTitle}
                                                    containerStyle={{ flex: 1, marginBottom: 0 }}
                                                    autoFocus
                                                />
                                                <TouchableOpacity onPress={() => handleUpdatePlanner(planner.id)} style={styles.iconBtn}>
                                                    <Text style={{ color: colors.primary, fontWeight: 'bold' }}>OK</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                            <TouchableOpacity
                                                style={[
                                                    styles.plannerOption,
                                                    selectedPlannerId === planner.id && styles.plannerOptionActive
                                                ]}
                                                onPress={() => {
                                                    setSelectedPlannerId(planner.id);
                                                    setShowPlannerSelector(false);
                                                }}
                                            >
                                                <Text style={[
                                                    styles.plannerOptionText,
                                                    selectedPlannerId === planner.id && { color: colors.primary, fontWeight: 'bold' }
                                                ]}>
                                                    {planner.title}
                                                </Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    {selectedPlannerId === planner.id && (
                                                        <Text style={{ color: colors.primary, fontWeight: 'bold' }}>✓  </Text>
                                                    )}
                                                    {/* Edit Button - White Color Fix */}
                                                    <TouchableOpacity onPress={() => startEditing(planner)} style={styles.editBtn}>
                                                        <Text style={{ fontSize: 18, color: '#FFF' }}>✎</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))}
                            </ScrollView>

                            <View style={styles.divider} />

                            <Text style={styles.sectionTitle}>Criar Novo Planner</Text>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <Input
                                    placeholder="Nome (ex: Pessoal)"
                                    value={newPlannerTitle}
                                    onChangeText={setNewPlannerTitle}
                                    containerStyle={{ flex: 1, marginBottom: 0 }}
                                />
                                <Button
                                    title="+"
                                    onPress={handleCreatePlanner}
                                    loading={creatingPlanner}
                                    style={{ width: 50 }}
                                />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

            {/* Theme Selector Modal */}
            <ThemeSelector visible={showThemeSelector} onClose={() => setShowThemeSelector(false)} />
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
    plannerSelector: {
        flex: 1,
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
        backgroundColor: theme.colors.accent.primary, // fallback
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
    // Removed static today styles, handled dynamically in render
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
    todayCell: {
        backgroundColor: 'rgba(158, 158, 158, 0.05)',
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
    selectorContent: {
        backgroundColor: theme.colors.background.secondary,
        padding: theme.spacing.xl,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: theme.colors.background.tertiary,
        width: '90%',
        maxHeight: '90%',
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
    },
    plannerRow: {
        marginBottom: 8,
    },
    plannerOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.lg,
        borderBottomWidth: 1,
        borderColor: theme.colors.background.tertiary,
        borderRadius: theme.borderRadius.md,
    },
    plannerOptionActive: {
        backgroundColor: theme.colors.background.tertiary,
    },
    plannerOptionText: {
        ...theme.typography.body,
        color: theme.colors.text.secondary,
        fontSize: 18,
        flex: 1,
    },
    editContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background.tertiary,
        padding: 4,
        borderRadius: 8,
    },
    iconBtn: {
        padding: 10,
    },
    editBtn: {
        padding: 8,
        marginLeft: 8,
        opacity: 0.8,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.background.tertiary,
        marginVertical: theme.spacing.lg,
    },
    sectionTitle: {
        ...theme.typography.caption,
        color: theme.colors.text.tertiary,
        marginBottom: theme.spacing.sm,
        textTransform: 'uppercase',
    }
});

export default PlannerScreen;
