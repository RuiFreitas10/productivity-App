import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { theme } from '../../theme/theme';

interface CardProps extends ViewProps {
    children: React.ReactNode;
    variant?: 'default' | 'elevated';
}

export const Card: React.FC<CardProps> = ({
    children,
    variant = 'default',
    style,
    ...props
}) => {
    return (
        <View
            style={[
                styles.card,
                variant === 'elevated' && styles.elevated,
                style,
            ]}
            {...props}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
    },
    elevated: {
        ...theme.shadows.md,
    },
});
