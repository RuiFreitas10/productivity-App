import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacityProps,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { theme } from '../../theme/theme';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline';
    loading?: boolean;
    icon?: React.ReactNode;
    fullWidth?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
    title,
    variant = 'primary',
    loading = false,
    icon,
    fullWidth = false,
    size = 'md',
    style,
    disabled,
    ...props
}) => {
    const buttonStyle: ViewStyle[] = [
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style as ViewStyle,
    ];

    const textStyle: TextStyle[] = [
        styles.text,
        styles[`text_${variant}`],
        styles[`textSize_${size}`],
    ];

    return (
        <TouchableOpacity
            style={buttonStyle}
            disabled={disabled || loading}
            activeOpacity={0.7}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'primary' ? theme.colors.background.primary : theme.colors.accent.primary} />
            ) : (
                <>
                    {icon}
                    <Text style={textStyle}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.borderRadius.md,
        gap: theme.spacing.sm,
    },
    primary: {
        backgroundColor: theme.colors.accent.primary,
    },
    secondary: {
        backgroundColor: theme.colors.background.secondary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.text.primary,
    },
    disabled: {
        opacity: 0.5,
    },
    fullWidth: {
        width: '100%',
    },
    size_sm: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },
    size_md: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
    },
    size_lg: {
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.lg,
    },
    text: {
        fontWeight: '600',
    },
    text_primary: {
        color: theme.colors.background.primary,
    },
    text_secondary: {
        color: theme.colors.text.primary,
    },
    text_outline: {
        color: theme.colors.text.primary,
    },
    textSize_sm: {
        fontSize: 14,
    },
    textSize_md: {
        fontSize: 16,
    },
    textSize_lg: {
        fontSize: 18,
    },
});
