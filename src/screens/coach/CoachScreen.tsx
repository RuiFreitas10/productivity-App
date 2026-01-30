import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    ScrollView,
    Modal
} from 'react-native';
import { theme } from '../../theme/theme';
import { useAuthStore } from '../../store/authStore';
import { coachService, ChatMessage } from '../../services/coach.service';
import { reportService } from '../../services/report.service';
import { Card } from '../../components/ui/Card';
import { CategoryChart } from '../../components/expenses/CategoryChart';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { AddGoalModal } from '../../components/coach/AddGoalModal';

const AVATAR_SOURCE = require('../../../assets/robot_avatar.png');

type CoachTab = 'analytics' | 'assistant';
type AdviceState = 'IDLE' | 'Q1_GOAL' | 'Q2_SPENDING' | 'GIVING_ADVICE';

export const CoachScreen = () => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<CoachTab>('analytics');
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    // Analytics & Goals
    const [goals, setGoals] = useState<any[]>([]);
    const [loadingStats, setLoadingStats] = useState(false);
    const [financials, setFinancials] = useState<any>(null);
    const [chartType, setChartType] = useState<'bar' | 'pie'>('bar'); // Chart Selector State

    // Report Modal
    const [showReportModal, setShowReportModal] = useState(false);
    const [generatingReport, setGeneratingReport] = useState(false);

    // Goal Modal
    const [showGoalModal, setShowGoalModal] = useState(false);

    // Advice Wizard State
    const [adviceState, setAdviceState] = useState<AdviceState>('IDLE');
    const [adviceAnswers, setAdviceAnswers] = useState<any>({});

    const loadAnalytics = useCallback(async () => {
        if (!user) return;
        setLoadingStats(true);
        try {
            const currentMonth = format(new Date(), 'yyyy-MM');
            const [goalsData, financialData] = await Promise.all([
                coachService.trackGoalProgress(user.id, currentMonth),
                coachService.analyzeFinancials(user.id)
            ]);
            setGoals(goalsData);
            setFinancials(financialData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingStats(false);
        }
    }, [user]);

    useFocusEffect(
        useCallback(() => {
            if (activeTab === 'analytics') {
                loadAnalytics();
            }
        }, [activeTab, loadAnalytics])
    );

    useEffect(() => {
        if (messages.length === 0) {
            addBotMessage('Selecione uma das opções abaixo para eu começar a trabalhar.');
        }
    }, []);

    const addBotMessage = (text: string) => {
        setMessages(prev => [...prev, {
            id: Date.now().toString() + Math.random().toString(),
            text,
            sender: 'bot',
            timestamp: new Date()
        }]);
    };

    // --- INTERACTIVE ADVICE HANDLER ---

    const startAdviceSession = () => {
        setAdviceState('Q1_GOAL');
        setAdviceAnswers({});
        setMessages([]); // Clear chat for focus
        addBotMessage("Vamos lá! Para te dar o melhor conselho, preciso de saber: \n\nQual é o teu objetivo principal este mês?");
    };

    const handleAnswer = async (answer: string, nextState: AdviceState) => {
        // Add user answer bubble
        setMessages(prev => [...prev, {
            id: Date.now().toString() + Math.random().toString(),
            text: answer,
            sender: 'user',
            timestamp: new Date()
        }]);

        setAdviceAnswers((prev: any) => ({ ...prev, [adviceState]: answer }));

        // Simulate thinking
        setTimeout(async () => {
            if (nextState === 'Q2_SPENDING') {
                setAdviceState('Q2_SPENDING');
                addBotMessage("Entendido. E sentes que tens gastado demais em coisas supérfluas (restaurantes, uber, etc)?");
            } else if (nextState === 'GIVING_ADVICE') {
                setAdviceState('IDLE'); // Reset to interactive
                if (!user) return;

                const advice = await coachService.getAdvice(user.id);
                // Combine answers with actual data
                let msg = `Com base no teu objetivo de **${adviceAnswers['Q1_GOAL'] || 'Poupar'}** e nos teus dados:\n\n`;

                if (advice.spendLess) {
                    msg += `🔴 **Corte Necessário:**\nEstás a gastar muito em ${advice.spendLess.category} (${formatCurrency(advice.spendLess.amount)}). Para atingires a tua meta, reduz aqui!\n\n`;
                }

                if (answer === 'Sim' && advice.spendLess?.category !== 'Restaurantes') {
                    msg += `⚠️ Disseste que gastas muito em supérfluos. Atenção às pequenas despesas diárias!\n\n`;
                }

                if (advice.spendLittle) {
                    msg += `🟢 **Ponto Forte:**\n${advice.spendLittle.message}`;
                }

                addBotMessage(msg);
            }
        }, 800);
    };

    // --- QUICK ACTIONS HANDLERS ---

    const handleGenerateReport = async (type: 'pie' | 'bar' | 'table') => {
        if (!user) return;
        setGeneratingReport(true);
        setShowReportModal(false);
        try {
            const financials = await coachService.analyzeFinancials(user.id);
            const monthLabel = format(new Date(), 'MMMM yyyy', { locale: pt });
            const html = await reportService.generateMonthlyReportHTML(user.email || 'Cliente', monthLabel, financials, type);
            await reportService.createAndSharePDF(html);
            addBotMessage(`✅ Relatório (${type}) gerado com sucesso!`);
        } catch (error) {
            addBotMessage('❌ Erro ao gerar relatório.');
        } finally {
            setGeneratingReport(false);
        }
    };

    const handleHabitReport = async () => {
        if (!user) return;
        const stats = await coachService.analyzeHabits(user.id);
        if (!stats) {
            addBotMessage('Sem dados de hábitos para analisar.');
            return;
        }
        addBotMessage(`📊 **Relatório de Hábitos**\n\n🏆 Melhor: ${stats.bestHabit.title} (${stats.bestHabit.count}x)\n⚠️ Atenção: ${stats.worstHabit.title} (${stats.worstHabit.count}x)`);
    };

    // --- RENDERERS ---

    const renderMessage = ({ item }: { item: ChatMessage }) => {
        const isBot = item.sender === 'bot';
        return (
            <View style={[styles.messageRow, isBot ? styles.botRow : styles.userRow]}>
                {isBot && <Image source={AVATAR_SOURCE} style={styles.messageAvatar} />}
                <View style={[styles.bubble, isBot ? styles.botBubble : styles.userBubble]}>
                    <Text style={[styles.messageText, isBot ? styles.botText : styles.userText]}>{item.text}</Text>
                </View>
            </View>
        );
    };

    const renderAnalytics = () => (
        <ScrollView style={styles.analyticsResult} showsVerticalScrollIndicator={false}>
            {/* Header Stats */}
            <View style={styles.statsRow}>
                <Card style={[styles.statCard, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.statLabel}>Gasto Mensal</Text>
                    <Text style={styles.statValue}>
                        {financials ? formatCurrency(financials.totalSpent) : '...'}
                    </Text>
                    <Text style={[
                        styles.statChange,
                        financials?.isSpendingMore ? { color: theme.colors.error } : { color: theme.colors.success }
                    ]}>
                        {financials ? (financials.isSpendingMore ? '⚠️ Mais que mês passado' : '✅ Menos que mês passado') : ''}
                    </Text>
                </Card>
            </View>

            {/* Goals Section */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Metas do Mês</Text>
                <TouchableOpacity onPress={() => setShowGoalModal(true)}>
                    <Text style={styles.sectionLink}>+ Nova Meta</Text>
                </TouchableOpacity>
            </View>

            {loadingStats ? (
                <ActivityIndicator color={theme.colors.accent.primary} />
            ) : goals.length === 0 ? (
                <Card style={styles.emptyCard}>
                    <Text style={styles.emptyText}>Ainda não tens metas para este mês.</Text>
                    <Button title="Definir Metas" onPress={() => setShowGoalModal(true)} size="sm" variant="outline" />
                </Card>
            ) : (
                goals.map(goal => (
                    <Card key={goal.id} style={styles.goalCard}>
                        <View style={styles.goalHeader}>
                            <View style={styles.goalTitleContainer}>
                                <Text style={styles.goalIcon}>{goal.type === 'expense_budget' ? '💰' : '🏃'}</Text>
                                <Text style={styles.goalTitle}>{goal.title}</Text>
                            </View>
                            <Text style={[styles.goalStatus, goal.is_met ? styles.statusOk : styles.statusWarning]}>
                                {goal.type === 'expense_budget'
                                    ? formatCurrency(goal.current_value)
                                    : `${goal.current_value}x`}
                                / {goal.type === 'expense_budget' ? formatCurrency(goal.target_value) : goal.target_value}
                            </Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    {
                                        width: `${Math.min(goal.progress_percentage, 100)}%`,
                                        backgroundColor: goal.type === 'expense_budget'
                                            ? (goal.current_value > goal.target_value ? theme.colors.error : theme.colors.success)
                                            : (goal.current_value >= goal.target_value ? theme.colors.success : theme.colors.accent.secondary)
                                    }
                                ]}
                            />
                        </View>
                    </Card>
                ))
            )}


            {/* Charts Section with Selector */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Distribuição de Despesas</Text>
                <View style={styles.chartToggle}>
                    <TouchableOpacity onPress={() => setChartType('bar')} style={[styles.toggleBtn, chartType === 'bar' && styles.toggleBtnActive]}>
                        <Text style={[styles.toggleText, chartType === 'bar' && styles.toggleTextActive]}>📊</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setChartType('pie')} style={[styles.toggleBtn, chartType === 'pie' && styles.toggleBtnActive]}>
                        <Text style={[styles.toggleText, chartType === 'pie' && styles.toggleTextActive]}>🥧</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {financials && <Card><CategoryChart data={financials.categories} type={chartType} /></Card>}
        </ScrollView>
    );

    const renderAdviceOptions = () => {
        if (adviceState === 'Q1_GOAL') {
            return (
                <View style={styles.adviceOptions}>
                    <Button title="Poupar Dinheiro" onPress={() => handleAnswer('Poupar Dinheiro', 'Q2_SPENDING')} style={{ marginBottom: 10 }} />
                    <Button title="Investir Mais" onPress={() => handleAnswer('Investir Mais', 'Q2_SPENDING')} style={{ marginBottom: 10 }} />
                    <Button title="Pagar Dívidas" onPress={() => handleAnswer('Pagar Dívidas', 'Q2_SPENDING')} />
                </View>
            );
        }
        if (adviceState === 'Q2_SPENDING') {
            return (
                <View style={styles.adviceOptions}>
                    <Button title="Sim, infelizmente" onPress={() => handleAnswer('Sim', 'GIVING_ADVICE')} style={{ marginBottom: 10 }} />
                    <Button title="Não, sou controlado" onPress={() => handleAnswer('Não', 'GIVING_ADVICE')} />
                </View>
            );
        }
        return null;
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Image source={AVATAR_SOURCE} style={styles.headerAvatar} />
                    <Text style={styles.headerTitle}>AI Coach</Text>
                </View>
                <View style={styles.tabContainer}>
                    <TouchableOpacity style={[styles.tabButton, activeTab === 'analytics' && styles.tabActive]} onPress={() => setActiveTab('analytics')}>
                        <Text style={[styles.tabText, activeTab === 'analytics' && styles.tabTextActive]}>📊 Estatísticas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tabButton, activeTab === 'assistant' && styles.tabActive]} onPress={() => setActiveTab('assistant')}>
                        <Text style={[styles.tabText, activeTab === 'assistant' && styles.tabTextActive]}>🤖 Assistente</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            {activeTab === 'analytics' ? (
                renderAnalytics()
            ) : (
                <View style={{ flex: 1 }}>
                    <FlatList
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                    />

                    {/* Advice Options (Overlay above input area if active) */}
                    {adviceState !== 'IDLE' ? (
                        <View style={styles.adviceContainer}>
                            {renderAdviceOptions()}
                        </View>
                    ) : (
                        /* Quick Actions Area */
                        <View style={styles.quickActionsContainer}>
                            <Text style={styles.quickActionsTitle}>O que queres fazer?</Text>
                            <View style={styles.actionRow}>
                                <TouchableOpacity style={styles.actionCard} onPress={() => setShowReportModal(true)}>
                                    <Text style={styles.actionIcon}>📄</Text>
                                    <Text style={styles.actionLabel}>Relatório PDF</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.actionCard} onPress={startAdviceSession}>
                                    <Text style={styles.actionIcon}>💡</Text>
                                    <Text style={styles.actionLabel}>Conselhos AI</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.actionCard} onPress={handleHabitReport}>
                                    <Text style={styles.actionIcon}>✅</Text>
                                    <Text style={styles.actionLabel}>Hábitos</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            )}

            {/* --- MODALS --- */}
            <AddGoalModal
                visible={showGoalModal}
                onClose={() => setShowGoalModal(false)}
                onGoalCreated={loadAnalytics}
            />

            {/* Report Selection Modal */}
            <Modal visible={showReportModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Gerar Relatório</Text>
                        <Text style={styles.modalSubtitle}>Escolhe o tipo de gráfico:</Text>
                        <Button title="📊 Barras" onPress={() => handleGenerateReport('bar')} fullWidth style={{ marginBottom: 10 }} />
                        <Button title="🥧 Circular" onPress={() => handleGenerateReport('pie')} fullWidth style={{ marginBottom: 10 }} />
                        <Button title="📋 Tabela Detalhada" onPress={() => handleGenerateReport('table')} fullWidth style={{ marginBottom: 10 }} />
                        <Button title="Cancelar" variant="outline" onPress={() => setShowReportModal(false)} fullWidth />
                    </View>
                </View>
            </Modal>

            {generatingReport && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#FFF" />
                    <Text style={{ color: '#FFF', marginTop: 10 }}>A gerar PDF...</Text>
                </View>
            )}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary },
    header: { backgroundColor: theme.colors.background.secondary, paddingTop: Platform.OS === 'ios' ? 50 : theme.spacing.lg, paddingBottom: theme.spacing.md, paddingHorizontal: theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: theme.colors.background.tertiary },
    headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md, justifyContent: 'center' },
    headerAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: theme.spacing.sm },
    headerTitle: { ...theme.typography.h3, color: theme.colors.text.primary },
    tabContainer: { flexDirection: 'row', backgroundColor: theme.colors.background.tertiary, borderRadius: theme.borderRadius.lg, padding: 4 },
    tabButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: theme.borderRadius.md },
    tabActive: { backgroundColor: theme.colors.background.primary },
    tabText: { ...theme.typography.caption, color: theme.colors.text.tertiary, fontWeight: '600' },
    tabTextActive: { color: theme.colors.text.primary },

    analyticsResult: { padding: theme.spacing.lg },
    sectionHeader: { marginTop: 20, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sectionTitle: { ...theme.typography.h3, color: theme.colors.text.primary },
    chartToggle: { flexDirection: 'row', backgroundColor: theme.colors.background.tertiary, borderRadius: 8, padding: 2 },
    toggleBtn: { padding: 6, borderRadius: 6 },
    toggleBtnActive: { backgroundColor: theme.colors.background.primary },
    toggleText: { fontSize: 16, opacity: 0.5 },
    toggleTextActive: { opacity: 1 },

    // Analytics Cards
    statsRow: { flexDirection: 'row', marginBottom: theme.spacing.lg },
    statCard: { padding: theme.spacing.md },
    statLabel: { ...theme.typography.caption, color: theme.colors.text.secondary },
    statValue: { ...theme.typography.h2, color: theme.colors.text.primary, marginVertical: 4 },
    statChange: { ...theme.typography.caption, fontWeight: '600' },
    sectionLink: { ...theme.typography.body, color: theme.colors.accent.primary },
    goalCard: { marginBottom: theme.spacing.md, padding: theme.spacing.md },
    goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    goalTitleContainer: { flexDirection: 'row', alignItems: 'center' },
    goalIcon: { marginRight: 8, fontSize: 16 },
    goalTitle: { fontWeight: '600', color: theme.colors.text.primary },
    goalStatus: { fontSize: 12, fontWeight: 'bold' },
    statusOk: { color: theme.colors.success },
    statusWarning: { color: theme.colors.text.secondary },
    progressBarBg: { height: 8, backgroundColor: theme.colors.background.tertiary, borderRadius: 4, overflow: 'hidden', marginTop: 8 },
    progressBarFill: { height: '100%', borderRadius: 4 },
    emptyCard: { alignItems: 'center', padding: 20, backgroundColor: theme.colors.background.secondary, borderRadius: 12 },
    emptyText: { color: theme.colors.text.secondary, marginBottom: 10 },

    // Chat
    listContent: { padding: theme.spacing.md, paddingBottom: 250 }, // More padding for advice options
    messageRow: { flexDirection: 'row', marginBottom: theme.spacing.md, maxWidth: '85%' },
    botRow: { alignSelf: 'flex-start' },
    userRow: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
    messageAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8, marginTop: 4 },
    bubble: { padding: theme.spacing.md, borderRadius: theme.borderRadius.lg },
    botBubble: { backgroundColor: theme.colors.background.secondary, borderTopLeftRadius: 4 },
    userBubble: { backgroundColor: theme.colors.accent.primary, borderTopRightRadius: 4 },
    messageText: { ...theme.typography.body, fontSize: 15, lineHeight: 22 },
    botText: { color: theme.colors.text.primary },
    userText: { color: '#FFFFFF' },

    quickActionsContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.colors.background.secondary, padding: theme.spacing.lg, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderTopWidth: 1, borderTopColor: theme.colors.background.tertiary, shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
    quickActionsTitle: { ...theme.typography.caption, color: theme.colors.text.secondary, marginBottom: theme.spacing.md, textAlign: 'center' },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    actionCard: { flex: 1, backgroundColor: theme.colors.background.primary, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.background.tertiary },
    actionIcon: { fontSize: 24, marginBottom: 5 },
    actionLabel: { ...theme.typography.caption, color: theme.colors.text.primary, textAlign: 'center', fontWeight: '500' },

    // Advice Wizard
    adviceContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.colors.background.secondary, padding: theme.spacing.lg, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    adviceOptions: { gap: 10 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: theme.spacing.xl },
    modalContent: { backgroundColor: theme.colors.background.primary, borderRadius: theme.borderRadius.lg, padding: theme.spacing.xl },
    modalTitle: { ...theme.typography.h2, color: theme.colors.text.primary, textAlign: 'center', marginBottom: theme.spacing.xs },
    modalSubtitle: { ...theme.typography.body, color: theme.colors.text.secondary, textAlign: 'center', marginBottom: theme.spacing.xl },

    loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }
});
