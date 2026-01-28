import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { theme } from '../../theme/theme';
import { authService } from '../../services/auth.service';

export const RegisterScreen: React.FC<{ onNavigateToLogin: () => void }> = ({
    onNavigateToLogin,
}) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            setError('As passwords não coincidem');
            return;
        }

        if (password.length < 6) {
            setError('A password deve ter pelo menos 6 caracteres');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await authService.signUp(email, password, fullName);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Erro ao criar conta');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <View style={styles.container}>
                <View style={styles.successContainer}>
                    <Text style={styles.successIcon}>✅</Text>
                    <Text style={styles.successTitle}>Conta Criada!</Text>
                    <Text style={styles.successText}>
                        Verifique o seu email para confirmar a conta.
                    </Text>
                    <Button
                        title="Ir para Login"
                        onPress={onNavigateToLogin}
                        fullWidth
                        size="lg"
                        style={styles.button}
                    />
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Criar Conta</Text>
                    <Text style={styles.subtitle}>
                        Preencha os seus dados para começar
                    </Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Nome Completo"
                        placeholder="João Silva"
                        value={fullName}
                        onChangeText={setFullName}
                        autoCapitalize="words"
                    />

                    <Input
                        label="Email"
                        placeholder="name@example.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <Input
                        label="Password"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <Input
                        label="Confirmar Password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <Button
                        title="Criar Conta"
                        onPress={handleRegister}
                        loading={loading}
                        fullWidth
                        size="lg"
                        style={styles.button}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Já tem conta?{' '}
                        <Text style={styles.loginLink} onPress={onNavigateToLogin}>
                            Entrar
                        </Text>
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: theme.spacing.xl,
        paddingTop: theme.spacing.xxl * 2,
    },
    header: {
        marginBottom: theme.spacing.xxl,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.text.secondary,
    },
    form: {
        marginBottom: theme.spacing.xl,
    },
    errorText: {
        color: theme.colors.error,
        marginBottom: theme.spacing.md,
        textAlign: 'center',
    },
    button: {
        marginTop: theme.spacing.md,
    },
    footer: {
        marginTop: 'auto',
        paddingBottom: theme.spacing.xl,
        alignItems: 'center',
    },
    footerText: {
        ...theme.typography.body,
        color: theme.colors.text.secondary,
    },
    loginLink: {
        color: theme.colors.accent.primary,
        fontWeight: '600',
    },
    successContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.xl,
    },
    successIcon: {
        fontSize: 80,
        marginBottom: theme.spacing.xl,
    },
    successTitle: {
        ...theme.typography.h1,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.md,
    },
    successText: {
        ...theme.typography.body,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginBottom: theme.spacing.xxl,
    },
});
