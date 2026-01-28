import React, { useState } from 'react';
import {
    TextInput,
    View,
    Text,
    StyleSheet,
    TextInputProps,
    TouchableOpacity,
} from 'react-native';
import { theme } from '../../theme/theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    icon,
    rightIcon,
    style,
    secureTextEntry,
    ...props
}) => {
    const [isSecure, setIsSecure] = useState(secureTextEntry);

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[styles.inputContainer, error && styles.inputError]}>
                {icon && <View style={styles.icon}>{icon}</View>}
                <TextInput
                    style={[styles.input, style]}
                    placeholderTextColor={theme.colors.text.tertiary}
                    secureTextEntry={isSecure}
                    {...props}
                />
                {secureTextEntry && (
                    <TouchableOpacity
                        onPress={() => setIsSecure(!isSecure)}
                        style={styles.icon}
                    >
                        <Text style={styles.eyeIcon}>{isSecure ? '👁️' : '👁️‍🗨️'}</Text>
                    </TouchableOpacity>
                )}
                {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.md,
    },
    label: {
        color: theme.colors.text.primary,
        fontSize: 14,
        fontWeight: '500',
        marginBottom: theme.spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background.input,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    input: {
        flex: 1,
        color: theme.colors.text.primary,
        fontSize: 16,
        paddingVertical: theme.spacing.md,
    },
    icon: {
        marginRight: theme.spacing.sm,
    },
    eyeIcon: {
        fontSize: 20,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
        marginTop: theme.spacing.xs,
    },
});
