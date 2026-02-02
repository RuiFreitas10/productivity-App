import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { theme } from '../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '../hooks/useResponsive';
import { DesktopSidebar, SIDEBAR_WIDTH } from '../components/navigation/DesktopSidebar';

// Screens
import { ExpensesScreen } from '../screens/expenses/ExpensesScreen';
import CalendarScreen from '../screens/calendar/CalendarScreen';
import PlannerScreen from '../screens/planner/PlannerScreen';
import { CoachScreen } from '../screens/coach/CoachScreen';
import { ScanScreen } from '../screens/scan/ScanScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => (
    <View style={styles.iconContainer}>
        <View style={[styles.iconBackground, focused && styles.activeIconBackground]}>
            <Text style={[styles.iconText, focused && styles.activeIconText]}>{label}</Text>
        </View>
    </View>
);

const ScanIcon = () => (
    <View style={styles.scanButtonContainer}>
        <View style={styles.scanButton}>
            <Text style={styles.scanIconText}>📸</Text>
        </View>
    </View>
);

export const MainTabNavigator = () => {
    const insets = useSafeAreaInsets();
    const { isDesktop } = useResponsive();

    return (
        <View style={styles.container}>
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarStyle: isDesktop ? { display: 'none' } : styles.tabBar,
                }}
                tabBar={(props) =>
                    isDesktop ? (
                        <DesktopSidebar {...props} />
                    ) : (
                        <View style={styles.tabBar}>
                            {props.state.routes.map((route, index) => {
                                const isFocused = props.state.index === index;
                                const onPress = () => {
                                    const event = props.navigation.emit({
                                        type: 'tabPress',
                                        target: route.key,
                                        canPreventDefault: true,
                                    });

                                    if (!isFocused && !event.defaultPrevented) {
                                        props.navigation.navigate(route.name);
                                    }
                                };

                                let icon;
                                if (route.name === 'Scan') {
                                    icon = <ScanIcon />;
                                } else {
                                    const iconMap: Record<string, string> = {
                                        Expenses: '💰',
                                        Calendar: '📅',
                                        Planner: '✅',
                                        Coach: '🤖',
                                    };
                                    icon = <TabIcon label={iconMap[route.name] || '❓'} focused={isFocused} />;
                                }

                                return (
                                    <View key={route.key} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text onPress={onPress} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                            {icon}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    )
                }
            >
                <Tab.Screen
                    name="Expenses"
                    component={ExpensesScreen}
                    options={{
                        tabBarIcon: ({ focused }) => <TabIcon label="💰" focused={focused} />,
                    }}
                />
                <Tab.Screen
                    name="Calendar"
                    component={CalendarScreen}
                    options={{
                        tabBarIcon: ({ focused }) => <TabIcon label="📅" focused={focused} />,
                    }}
                />

                <Tab.Screen
                    name="Scan"
                    component={ScanScreen}
                    options={{
                        tabBarIcon: () => <ScanIcon />,
                        tabBarStyle: { display: 'none' } // Hide tab bar when inside ScanScreen if desired, or keep it. Keeping it hidden as before.
                    }}
                />

                <Tab.Screen
                    name="Planner"
                    component={PlannerScreen}
                    options={{
                        tabBarIcon: ({ focused }) => <TabIcon label="✅" focused={focused} />,
                    }}
                />
                <Tab.Screen
                    name="Coach"
                    component={CoachScreen}
                    options={{
                        tabBarIcon: ({ focused }) => <TabIcon label="🤖" focused={focused} />,
                    }}
                />
            </Tab.Navigator>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    tabBar: {
        backgroundColor: '#1C1C1E',
        borderTopWidth: 0,
        elevation: 0,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: Platform.OS === 'ios' ? 85 : 65, // Standard height
        paddingBottom: Platform.OS === 'ios' ? 25 : 10, // Standard padding
        flexDirection: 'row',
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBackground: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeIconBackground: {
        backgroundColor: theme.colors.background.tertiary,
    },
    iconText: {
        fontSize: 24,
        opacity: 0.5,
        color: theme.colors.text.tertiary,
    },
    activeIconText: {
        opacity: 1,
        transform: [{ scale: 1.1 }],
    },

    // Scan Button
    scanButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanButton: {
        width: 50, // Same size as other active/focus states
        height: 50,
        borderRadius: 25,
        backgroundColor: theme.colors.accent.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.accent.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    scanIconText: {
        fontSize: 24, // Consistent size
    }
});
