import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ExpensesScreen } from '../screens/expenses/ExpensesScreen';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth.service';
import { MainTabNavigator } from './MainTabNavigator';

const Stack = createStackNavigator();

export const RootNavigator: React.FC = () => {
    const { user, isLoading, setIsLoading } = useAuthStore();
    const [showOnboarding, setShowOnboarding] = useState(true);
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        // Check for existing session
        const initAuth = async () => {
            try {
                await authService.getCurrentSession();
            } catch (error) {
                console.error('Error loading session:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();

        // Listen to auth changes
        const { data: authListener } = authService.onAuthStateChange(() => {
            setIsLoading(false);
        });

        return () => {
            authListener?.subscription?.unsubscribe();
        };
    }, []);

    // Show splash screen first
    if (showSplash) {
        return <SplashScreen onFinish={() => setShowSplash(false)} />;
    }

    // Show loading while checking auth
    if (isLoading) {
        console.log('RootNavigator: Still Loading...');
        return <View style={{ flex: 1, backgroundColor: 'red', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: 'white' }}>A Carregar App... (Debug)</Text></View>;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: '#121212' },
                }}
            >
                {!user ? (
                    // Auth Stack
                    <>
                        {showOnboarding && (
                            <Stack.Screen name="Onboarding">
                                {() => (
                                    <OnboardingScreen
                                        onFinish={() => setShowOnboarding(false)}
                                    />
                                )}
                            </Stack.Screen>
                        )}
                        <Stack.Screen name="Login">
                            {({ navigation }) => (
                                <LoginScreen
                                    onNavigateToRegister={() =>
                                        navigation.navigate('Register' as never)
                                    }
                                />
                            )}
                        </Stack.Screen>
                        <Stack.Screen name="Register">
                            {({ navigation }) => (
                                <RegisterScreen
                                    onNavigateToLogin={() =>
                                        navigation.navigate('Login' as never)
                                    }
                                />
                            )}
                        </Stack.Screen>
                    </>
                ) : (
                    // Main App Stack (Tab Navigator)
                    <Stack.Screen name="MainApp" component={MainTabNavigator} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
