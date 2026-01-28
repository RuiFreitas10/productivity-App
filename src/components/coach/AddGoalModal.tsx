import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { theme } from '../../theme/theme';
import { Button } from '../ui/Button';
import { expensesService } from '../../services/expenses.service';
import { plannerService } from '../../services/planner.service';
import { coachService } from '../../services/coach.service';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';

interface AddGoalModalProps {
    visible: boolean;
    onClose: () => void;
    onGoalCreated: () => void;
}

type GoalType = 'expense_budget' | 'habit_target' | null;

export const AddGoalModal: React.FC<AddGoalModalProps> = ({ visible, onClose, onGoalCreated }) => {
    const { user } = useAuthStore();
    const [step, setStep] = useState(1);
    const [type, setType] = useState<GoalType>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedName, setSelectedName] = useState<string>(''); // To display chosen item
    const [targetValue, setTargetValue] = useState('');
    const [loading, setLoading] = useState(false);

    // Data Lists
    const [categories, setCategories] = useState<any[]>([]);
    const [habits, setHabits] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(false);

    useEffect(() => {
        if (visible && user) {
            resetForm();
            fetchData();
        }
    }, [visible, user]);

    const resetForm = () => {
        setStep(1);
        setType(null);
        setSelectedId(null);
        setSelectedName('');
        setTargetValue('');
    };

    const fetchData = async () => {
        if (!user) return;
        setLoadingData(true);
        try {
            const [cats, habs] = await Promise.all([
                expensesService.getCategories(user.id),
                plannerService.getHabits(user.id)
            ]);
            setCategories(cats);
            setHabits(habs);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingData(false);
        }
    };

    const handleSelectType = (selectedType: GoalType) => {
        setType(selectedType);
        setStep(2);
    };

    const handleSelectItem = (id: string, name: string) => {
        setSelectedId(id);
        setSelectedName(name);
        setStep(3);
    };

    const handleSave = async () => {
        if (!user || !type || !selectedId || !targetValue) return;

        setLoading(true);
        try {
            const currentMonth = format(new Date(), 'yyyy-MM');
            const goalTitle = type === 'expense_budget'
                ? `Gastar menos em ${selectedName}`
                : `Melhorar hábito: ${selectedName}`;

            const goalData = {
                title: goalTitle,
                type: type,
                target_value: parseFloat(targetValue),
                month: currentMonth,
                category_id: type === 'expense_budget' ? selectedId : null,
                habit_id: type === 'habit_target' ? selectedId : null
            };

            await coachService.createGoal(user.id, goalData);
            onGoalCreated();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Erro ao criar meta.');
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <View>
            <Text style={styles.stepTitle}>Que tipo de meta?</Text>
            <TouchableOpacity style={styles.optionCard} onPress={() => handleSelectType('expense_budget')}>
                <Text style={styles.optionIcon}>💰</Text>
                <View>
                    <Text style={styles.optionTitle}>Controlar Gastos</Text>
                    <Text style={styles.optionDesc}>Definir um limite para uma categoria.</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} onPress={() => handleSelectType('habit_target')}>
                <Text style={styles.optionIcon}>🏃</Text>
                <View>
                    <Text style={styles.optionTitle}>Melhorar Hábitos</Text>
                    <Text style={styles.optionDesc}>Definir uma meta de frequência mensal.</Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    const renderStep2 = () => (
        <View style={{ flex: 1 }}>
            <Text style={styles.stepTitle}>
                {type === 'expense_budget' ? 'Escolhe a Categoria' : 'Escolhe o Hábito'}
            </Text>
            <ScrollView style={styles.listContainer}>
                {loadingData ? (
                    <ActivityIndicator color={theme.colors.accent.primary} />
                ) : type === 'expense_budget' ? (
                    categories.map(cat => (
                        <TouchableOpacity key={cat.id} style={styles.itemRow} onPress={() => handleSelectItem(cat.id, cat.name)}>
                            <View style={[styles.colorDot, { backgroundColor: cat.color || '#ccc' }]} />
                            <Text style={styles.itemText}>{cat.name}</Text>
                        </TouchableOpacity>
                    ))
                ) : (
                    habits.map(hab => (
                        <TouchableOpacity key={hab.id} style={styles.itemRow} onPress={() => handleSelectItem(hab.id, hab.title)}>
                            <Text style={styles.habIcon}>{hab.icon || '📝'}</Text>
                            <Text style={styles.itemText}>{hab.title}</Text>
                        </TouchableOpacity>
                    ))
                )}
                {/* Fallback if list is empty */}
                {((type === 'expense_budget' && categories.length === 0) || (type === 'habit_target' && habits.length === 0)) && !loadingData && (
                    <Text style={styles.emptyText}>Nada encontrado.</Text>
                )}
            </ScrollView>
        </View>
    );

    const renderStep3 = () => (
        <View>
            <Text style={styles.stepTitle}>
                {type === 'expense_budget' ? `Qual o orçamento mensal para ${selectedName}?` : `Quantas vezes queres fazer ${selectedName} este mês?`}
            </Text>

            <View style={styles.inputContainer}>
                <Text style={styles.prefix}>{type === 'expense_budget' ? '€' : '#'}</Text>
                <TextInput
                    style={styles.input}
                    value={targetValue}
                    onChangeText={setTargetValue}
                    placeholder="0"
                    keyboardType="numeric"
                    autoFocus
                />
            </View>

            <Button
                title={loading ? "A Guardar..." : "Definir Meta"}
                onPress={handleSave}
                disabled={!targetValue || loading}
                fullWidth
            />
        </View>
    );

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : onClose()}>
                            <Text style={styles.backButton}>{step > 1 ? '← Voltar' : 'Cancelar'}</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Nova Meta ({step}/3)</Text>
                        <View style={{ width: 50 }} />
                    </View>

                    {/* Step Content */}
                    <View style={styles.contentContainer}>
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: theme.colors.background.primary, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: theme.spacing.lg, height: '70%' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg },
    backButton: { color: theme.colors.text.secondary, fontSize: 16 },
    headerTitle: { ...theme.typography.h3, color: theme.colors.text.primary },
    contentContainer: { flex: 1 },
    stepTitle: { ...theme.typography.h2, color: theme.colors.text.primary, marginBottom: theme.spacing.lg, textAlign: 'center' },

    // Step 1
    optionCard: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, backgroundColor: theme.colors.background.secondary, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.background.tertiary },
    optionIcon: { fontSize: 32, marginRight: theme.spacing.md },
    optionTitle: { ...theme.typography.body, fontWeight: 'bold', color: theme.colors.text.primary },
    optionDesc: { ...theme.typography.caption, color: theme.colors.text.secondary },

    // Step 2
    listContainer: { flex: 1 },
    itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.background.tertiary },
    colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
    habIcon: { fontSize: 16, marginRight: 10 },
    itemText: { ...theme.typography.body, color: theme.colors.text.primary },
    emptyText: { textAlign: 'center', color: theme.colors.text.secondary, marginTop: 20 },

    // Step 3
    inputContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.xl },
    prefix: { fontSize: 32, color: theme.colors.text.primary, marginRight: 8, fontWeight: 'bold' },
    input: { fontSize: 32, color: theme.colors.text.primary, borderBottomWidth: 2, borderBottomColor: theme.colors.accent.primary, minWidth: 100, textAlign: 'center' }
});
