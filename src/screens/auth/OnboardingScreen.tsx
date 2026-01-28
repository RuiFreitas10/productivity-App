import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    Dimensions,
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { theme } from '../../theme/theme';

const { width } = Dimensions.get('window');

const onboardingData = [
    {
        title: 'Despesas automáticas com fotos',
        description: 'Gerencie seus gastos num piscar de olhos com nossa tecnologia de IA.',
        emoji: '📷',
    },
    {
        title: 'Calendário inteligente',
        description: 'Organize suas tarefas e eventos com lembretes personalizados.',
        emoji: '📅',
    },
    {
        title: 'Planner de hábitos',
        description: 'Acompanhe seus objetivos e hábitos diários com facilidade.',
        emoji: '✅',
    },
];

export const OnboardingScreen: React.FC<{ onFinish: () => void }> = ({
    onFinish,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        if (currentIndex < onboardingData.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onFinish();
        }
    };

    const currentSlide = onboardingData[currentIndex];

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.imageContainer}>
                    <View style={styles.imagePlaceholder}>
                        <Text style={styles.emoji}>{currentSlide.emoji}</Text>
                    </View>
                </View>

                <Text style={styles.title}>{currentSlide.title}</Text>
                <Text style={styles.description}>{currentSlide.description}</Text>

                <View style={styles.pagination}>
                    {onboardingData.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === currentIndex && styles.dotActive,
                            ]}
                        />
                    ))}
                </View>
            </View>

            <View style={styles.footer}>
                <Button
                    title="Continuar"
                    onPress={handleNext}
                    fullWidth
                    size="lg"
                />
                <Text style={styles.skipText} onPress={onFinish}>
                    Entrar / Criar conta
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.xl,
    },
    imageContainer: {
        width: width * 0.8,
        height: width * 0.8,
        marginBottom: theme.spacing.xl,
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emoji: {
        fontSize: 120,
    },
    title: {
        ...theme.typography.h2,
        color: theme.colors.text.primary,
        textAlign: 'center',
        marginBottom: theme.spacing.md,
    },
    description: {
        ...theme.typography.body,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    pagination: {
        flexDirection: 'row',
        marginTop: theme.spacing.xl,
        gap: theme.spacing.sm,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.text.tertiary,
    },
    dotActive: {
        backgroundColor: theme.colors.accent.primary,
        width: 24,
    },
    footer: {
        paddingHorizontal: theme.spacing.xl,
        paddingBottom: theme.spacing.xl,
    },
    skipText: {
        ...theme.typography.body,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginTop: theme.spacing.md,
    },
});
