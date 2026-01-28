import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme } from '../../theme/theme';

export const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
    const fadeAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.8);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
        ]).start();

        const timer = setTimeout(() => {
            onFinish();
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <View style={styles.logo}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>🤖</Text>
                    </View>
                </View>
                <Text style={styles.title}>A S S I S T A N T</Text>
                <Text style={styles.subtitle}>PERSONAL INTELLIGENCE</Text>
            </Animated.View>
            <Text style={styles.version}>VERSION 1.0</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logo: {
        width: 120,
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.xl,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 24,
        backgroundColor: theme.colors.accent.primary,
        transform: [{ rotate: '45deg' }],
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: theme.colors.accent.secondary,
    },
    icon: {
        fontSize: 48,
        transform: [{ rotate: '-45deg' }],
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text.primary,
        letterSpacing: 8,
        fontWeight: '300',
    },
    subtitle: {
        ...theme.typography.label,
        color: theme.colors.text.secondary,
        marginTop: theme.spacing.sm,
        letterSpacing: 2,
    },
    version: {
        position: 'absolute',
        bottom: theme.spacing.xl,
        ...theme.typography.caption,
        color: theme.colors.text.tertiary,
        letterSpacing: 1,
    },
});
