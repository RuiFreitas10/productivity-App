import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { theme } from '../../theme/theme';
import { authService } from '../../services/auth.service';

export const LoginScreen: React.FC<{ onNavigateToRegister: () => void }> = ({
    onNavigateToRegister,
}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        try {
            setLoading(true);
            setError('');
            await authService.signIn(email, password);
        } catch (err: any) {
            setError(err.message || 'Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

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
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>🤖</Text>
                    </View>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>
                        Please enter your details to sign in.
                    </Text>
                </View>

                <View style={styles.form}>
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

                    <TouchableOpacity style={styles.forgotPassword}>
                        <Text style={styles.forgotPasswordText}>
                            Esqueci-me da palavra-passe
                        </Text>
                    </TouchableOpacity>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <Button
                        title="Entrar"
                        onPress={handleLogin}
                        loading={loading}
                        fullWidth
                        size="lg"
                        style={styles.loginButton}
                    />

                    <Button
                        title="🔐 Login with Face ID"
                        onPress={() => { }}
                        variant="outline"
                        fullWidth
                        size="md"
                        style={styles.faceIdButton}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Don't have an account?{' '}
                        <Text
                            style={styles.signupLink}
                            onPress={onNavigateToRegister}
                        >
                            Sign up
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
        alignItems: 'center',
        marginBottom: theme.spacing.xxl,
    },
    iconContainer: {
        width: 60,
        height: 60,
        backgroundColor: theme.colors.text.primary,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.lg,
    },
    icon: {
        fontSize: 32,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.text.secondary,
        textAlign: 'center',
    },
    form: {
        marginBottom: theme.spacing.xl,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: theme.spacing.lg,
    },
    forgotPasswordText: {
        color: theme.colors.text.secondary,
        fontSize: 14,
    },
    errorText: {
        color: theme.colors.error,
        marginBottom: theme.spacing.md,
        textAlign: 'center',
    },
    loginButton: {
        marginBottom: theme.spacing.md,
    },
    faceIdButton: {
        borderColor: theme.colors.accent.primary,
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
    signupLink: {
        color: theme.colors.accent.primary,
        fontWeight: '600',
    },
});
