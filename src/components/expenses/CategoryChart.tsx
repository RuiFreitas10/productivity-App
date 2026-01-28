import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { theme } from '../../theme/theme';

const screenWidth = Dimensions.get('window').width;

interface CategoryChartProps {
    data: Array<{
        category: string;
        amount: number;
        color: string;
    }>;
    type?: 'bar' | 'pie';
}

export const CategoryChart: React.FC<CategoryChartProps> = ({ data, type = 'bar' }) => {
    // Prepare chart data
    const sortedData = [...data].sort((a, b) => b.amount - a.amount).slice(0, 5);

    if (data.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Sem dados para mostrar</Text>
            </View>
        );
    }

    const chartConfig = {
        backgroundColor: theme.colors.background.secondary,
        backgroundGradientFrom: theme.colors.background.secondary,
        backgroundGradientTo: theme.colors.background.secondary,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(212, 165, 116, ${opacity})`, // Gold color
        labelColor: (opacity = 1) => `rgba(160, 160, 160, ${opacity})`,
        barPercentage: 0.6,
        propsForBackgroundLines: { strokeWidth: 0 },
        propsForLabels: { fontSize: 10 },
    };

    if (type === 'pie') {
        const pieData = sortedData.map(d => ({
            name: d.category,
            population: d.amount,
            color: d.color || '#ccc',
            legendFontColor: theme.colors.text.secondary,
            legendFontSize: 12
        }));

        return (
            <View style={styles.container}>
                <PieChart
                    data={pieData}
                    width={screenWidth - theme.spacing.lg * 2}
                    height={200}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute={false}
                />
            </View>
        );
    }

    // Default to Bar
    const chartData = {
        labels: sortedData.map(d => d.category.substring(0, 8)),
        datasets: [{ data: sortedData.map(d => d.amount) }],
    };

    return (
        <View style={styles.container}>
            <BarChart
                data={chartData}
                width={screenWidth - theme.spacing.xl * 2}
                height={180}
                chartConfig={chartConfig}
                yAxisLabel="€"
                yAxisSuffix=""
                withInnerLines={false}
                showValuesOnTopOfBars
                fromZero
                style={styles.chart}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: theme.spacing.md,
    },
    chart: {
        borderRadius: theme.borderRadius.md,
    },
    emptyContainer: {
        height: 180,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: theme.colors.text.secondary,
    },
});
