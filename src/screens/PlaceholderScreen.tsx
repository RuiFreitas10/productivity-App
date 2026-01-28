import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

export const PlaceholderScreen: React.FC<{ title: string; icon: string }> = ({ title, icon }) => (
    <View style={styles.container}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Em breve...</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 64,
        marginBottom: theme.spacing.md,
    },
    title: {
        ...theme.typography.h2,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.text.secondary,
    },
});
