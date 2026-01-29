import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Platform,
} from 'react-native';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { theme } from '../../theme/theme';
import { expensesService } from '../../services/expenses.service';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface ManualExpenseModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: {
        merchant?: string;
        amount?: number;
        date?: string | Date;
        currency?: string;
    } | null;
    type?: 'expense' | 'income';
}

export const ManualExpenseModal: React.FC<ManualExpenseModalProps> = ({
    visible,
    onClose,
    onSuccess,
    initialData,
    type = 'expense'
}) => {
    const { user } = useAuthStore();
    const [amount, setAmount] = useState('');
    const [merchant, setMerchant] = useState('');
    const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
    const [date, setDate] = useState(new Date());
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    // Load categories when opening
    React.useEffect(() => {
        if (visible && user) {
            loadCategories();

            // Pre-fill data if available
            if (initialData) {
                if (initialData.amount) setAmount(initialData.amount.toString());
                if (initialData.merchant) setMerchant(initialData.merchant);
                if (initialData.date) setDate(new Date(initialData.date));
            } else {
                // Reset if opening empty
                setAmount('');
                setMerchant('');
                setDate(new Date());
            }
        }
    }, [visible, user, initialData, type]);

    const loadCategories = async () => {
        if (!user) return;
        try {
            // If user wants same categories, we can fetch all or just expenses. 
            // The user asked for "same categories" for income, so we fetch all or force 'expense' logic.
            // Let's fetch ALL for now so they can pick any.
            const queryType = type === 'income' ? 'all' : type;
            const data = await expensesService.getCategories(user.id, queryType as any);
            setCategories(data);
        } catch (error) {
            console.log('Error loading categories', error);
        }
    };

    const handleSubmit = async () => {
        if (!user || !amount || !categoryId) return;

        try {
            setLoading(true);
            await expensesService.createExpense(user.id, {
                amount: parseFloat(amount.replace(/,/g, '.')),
                currency: 'EUR',
                date: date,
                merchant: merchant || 'Despesa Manual',
                categoryId: categoryId,
                notes: notes,
            });
            onSuccess();
            onClose();
            // Reset form
            setAmount('');
            setMerchant('');
            setNotes('');
        } catch (error) {
            console.error('Error creating expense', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{type === 'income' ? 'Nova Receita' : 'Nova Despesa'}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        <Text style={styles.label}>Valor (€)</Text>
                        <TextInput
                            style={styles.amountInput}
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0.00"
                            keyboardType="numeric"
                            placeholderTextColor={theme.colors.text.tertiary}
                            autoFocus
                        />

                        <Input
                            label="Comerciante"
                            placeholder="Ex: Supermercado"
                            value={merchant}
                            onChangeText={setMerchant}
                        />

                        <Text style={styles.label}>Categoria</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesList}>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.categoryChip,
                                        categoryId === cat.id && { backgroundColor: cat.color || theme.colors.accent.primary }
                                    ]}
                                    onPress={() => setCategoryId(cat.id)}
                                >
                                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                                    <Text style={[
                                        styles.categoryName,
                                        categoryId === cat.id && { color: '#FFF' }
                                    ]}>{cat.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Input
                            label="Notas (Opcional)"
                            placeholder="Detalhes da despesa..."
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            numberOfLines={3}
                            style={{ height: 80, textAlignVertical: 'top' }}
                        />
                    </ScrollView>

                    <View style={styles.footer}>
                        <Button
                            title="Guardar Despesa"
                            onPress={handleSubmit}
                            loading={loading}
                            fullWidth
                            size="lg"
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: theme.colors.background.secondary,
        borderTopLeftRadius: theme.borderRadius.xl,
        borderTopRightRadius: theme.borderRadius.xl,
        height: '85%',
        paddingTop: theme.spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
        marginBottom: theme.spacing.xl,
    },
    title: {
        ...theme.typography.h2,
        color: theme.colors.text.primary,
    },
    closeButton: {
        fontSize: 24,
        color: theme.colors.text.tertiary,
    },
    content: {
        paddingHorizontal: theme.spacing.xl,
    },
    label: {
        ...theme.typography.label,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.sm,
    },
    amountInput: {
        fontSize: 48,
        color: theme.colors.text.primary,
        fontWeight: 'bold',
        marginBottom: theme.spacing.xl,
        textAlign: 'center',
    },
    categoriesList: {
        flexDirection: 'row',
        marginBottom: theme.spacing.xl,
        paddingVertical: theme.spacing.xs,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background.tertiary,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.full,
        marginRight: theme.spacing.sm,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    categoryIcon: {
        marginRight: theme.spacing.xs,
        fontSize: 16,
    },
    categoryName: {
        ...theme.typography.caption,
        color: theme.colors.text.secondary,
        fontWeight: '500',
    },
    footer: {
        padding: theme.spacing.xl,
        borderTopWidth: 1,
        borderTopColor: theme.colors.background.tertiary,
        paddingBottom: Platform.OS === 'ios' ? 40 : theme.spacing.xl,
    },
});
