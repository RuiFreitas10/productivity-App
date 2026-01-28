import { supabase } from './supabase';
import { expensesService } from './expenses.service';
import { plannerService } from './planner.service';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { pt } from 'date-fns/locale';

export interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    type?: 'text' | 'chart';
    chartData?: any;
    chartType?: 'pie' | 'bar';
}

export const coachService = {
    async analyzeFinancials(userId: string) {
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        const lastMonthEnd = endOfMonth(subMonths(now, 1));

        const [currentStats, lastMonthStats] = await Promise.all([
            expensesService.getExpenseStats(userId, start.toISOString(), end.toISOString()),
            expensesService.getExpenseStats(userId, lastMonthStart.toISOString(), lastMonthEnd.toISOString())
        ]);

        const totalSpent = currentStats.total;
        const lastMonthTotal = lastMonthStats.total;
        const isSpendingMore = totalSpent > lastMonthTotal;

        // Find highest category
        const sortedCategories = currentStats.byCategory.sort((a: any, b: any) => b.amount - a.amount);
        const topCategory: any = sortedCategories[0];

        return {
            totalSpent,
            lastMonthTotal,
            isSpendingMore,
            topCategory,
            categories: currentStats.byCategory
        };
    },

    async analyzeHabits(userId: string) {
        // Simplified habit analysis
        const habits = await plannerService.getHabits(userId);
        if (!habits || habits.length === 0) return null;

        const now = new Date();
        const start = startOfMonth(now).toISOString();
        const end = endOfMonth(now).toISOString();
        const logs = await plannerService.getHabitLogsRange(userId, start, end);

        // Calculate simple consistency
        const habitStats = habits.map(habit => {
            const completedCount = logs?.filter(l => l.habit_id === habit.id && l.is_completed).length || 0;
            return {
                title: habit.title,
                count: completedCount
            };
        });

        const sortedHabits = habitStats.sort((a, b) => a.count - b.count); // Ascending (worst first)

        return {
            worstHabit: sortedHabits[0],
            bestHabit: sortedHabits[sortedHabits.length - 1],
            allStats: habitStats
        };
    },

    async getGoals(userId: string, month: string) {
        const { data, error } = await supabase
            .from('goals')
            .select('*, categories(name, icon), habits(title, icon)')
            .eq('user_id', userId)
            .eq('month', month);

        if (error) throw error;
        return data || [];
    },

    async createGoal(userId: string, goalData: any) {
        const { error } = await supabase
            .from('goals')
            .insert({ ...goalData, user_id: userId });
        if (error) throw error;
    },

    async trackGoalProgress(userId: string, month: string) {
        const goals = await this.getGoals(userId, month);
        const start = `${month}-01`;
        const end = endOfMonth(new Date(start)).toISOString();

        const progressResults = await Promise.all(goals.map(async (goal: any) => {
            let current = 0;

            if (goal.type === 'expense_budget') {
                // Fetch expenses
                let query = supabase.from('expenses').select('amount').eq('user_id', userId).gte('date', start).lte('date', end);
                if (goal.category_id) {
                    query = query.eq('category_id', goal.category_id);
                }
                const { data } = await query;
                current = data?.reduce((sum, item) => sum + item.amount, 0) || 0;
            }
            else if (goal.type === 'habit_target') {
                if (goal.habit_id) {
                    const logs = await plannerService.getHabitLogsRange(userId, start, end);
                    current = logs?.filter(l => l.habit_id === goal.habit_id && l.is_completed).length || 0;
                }
            }

            return {
                ...goal,
                current_value: current,
                progress_percentage: Math.min((current / goal.target_value) * 100, 100),
                is_met: goal.type === 'expense_budget' ? current <= goal.target_value : current >= goal.target_value
            };
        }));

        return progressResults;
    },

    async generateResponse(userId: string, userMessage: string): Promise<ChatMessage[]> {
        const lowerMsg = userMessage.toLowerCase();

        // Response Delay Simulation
        // await new Promise(resolve => setTimeout(resolve, 1000));

        const responses: ChatMessage[] = [];
        const baseMsg = {
            id: Date.now().toString() + Math.random().toString(),
            sender: 'bot' as const,
            timestamp: new Date(),
        };

        if (lowerMsg.includes('ola') || lowerMsg.includes('olá') || lowerMsg.includes('oii')) {
            responses.push({
                ...baseMsg,
                text: 'Olá! Sou o teu Coach Financeiro. Estou aqui para te ajudar a poupar e a manter os teus hábitos. O que queres analisar hoje?'
            });
        }
        else if (lowerMsg.includes('gastei') || lowerMsg.includes('despesa') || lowerMsg.includes('dinheiro')) {
            const insights = await this.analyzeFinancials(userId);

            let text = `Este mês já gastaste €${insights.totalSpent.toFixed(2)}.`;
            if (insights.isSpendingMore) {
                text += ` Cuidado! Estás a gastar mais do que no mês passado (€${insights.lastMonthTotal.toFixed(2)}).`;
            } else {
                text += ` Bom trabalho! Estás a gastar menos que no mês passado.`;
            }

            if (insights.topCategory) {
                text += `\n\nA tua maior despesa é em **${insights.topCategory.category}** (€${insights.topCategory.amount.toFixed(2)}).`;
            }

            responses.push({ ...baseMsg, text });

            // Add Chart Response
            responses.push({
                ...baseMsg,
                id: Date.now().toString() + Math.random().toString() + '_chart',
                text: 'Aqui tens a distribuição dos teus gastos:',
                type: 'chart',
                chartType: 'pie',
                chartData: insights.categories
            });
        }
        else if (lowerMsg.includes('habito') || lowerMsg.includes('hábito') || lowerMsg.includes('treino')) {
            const habitInsights = await this.analyzeHabits(userId);

            if (!habitInsights) {
                responses.push({ ...baseMsg, text: 'Ainda não tens hábitos configurados. Vai ao Planner criar alguns!' });
            } else {
                let text = `O teu hábito mais consistente é **${habitInsights.bestHabit.title}** com ${habitInsights.bestHabit.count} conclusões.`;
                text += `\n\nMas precisas de te esforçar mais em **${habitInsights.worstHabit.title}**!`;

                responses.push({ ...baseMsg, text });
            }
        }
        else {
            responses.push({
                ...baseMsg,
                text: 'Não percebi bem. Podes perguntar "Quanto gastei este mês?" ou "Como estão os meus hábitos?".'
            });
        }

        return responses;
    }
};
