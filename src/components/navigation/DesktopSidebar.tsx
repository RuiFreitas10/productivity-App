import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';

interface DesktopSidebarProps {
    state: any;
    navigation: any;
}

const SIDEBAR_WIDTH = 240;

const NAV_ITEMS = [
    { name: 'Expenses', label: 'Despesas', icon: '💰' },
    { name: 'Calendar', label: 'Calendário', icon: '📅' },
    { name: 'Planner', label: 'Planner', icon: '✅' },
    { name: 'Coach', label: 'AI Coach', icon: '🤖' },
];

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ state, navigation }) => {
    const currentRoute = state.routes[state.index].name;

    return (
        <View style={styles.sidebar}>
            <View style={styles.header}>
                <Text style={styles.appName}>Personal Assistant</Text>
            </View>

            <View style={styles.nav}>
                {NAV_ITEMS.map((item) => {
                    const isActive = currentRoute === item.name;
                    return (
                        <TouchableOpacity
                            key={item.name}
                            style={[styles.navItem, isActive && styles.navItemActive]}
                            onPress={() => navigation.navigate(item.name)}
                        >
                            <Text style={styles.navIcon}>{item.icon}</Text>
                            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sidebar: {
        width: SIDEBAR_WIDTH,
        backgroundColor: theme.colors.background.secondary,
        borderRightWidth: 1,
        borderRightColor: theme.colors.background.tertiary,
        paddingTop: 20,
    },
    header: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.background.tertiary,
    },
    appName: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
    },
    nav: {
        paddingTop: theme.spacing.lg,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        marginHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
    },
    navItemActive: {
        backgroundColor: theme.colors.background.tertiary,
    },
    navIcon: {
        fontSize: 20,
        marginRight: theme.spacing.md,
    },
    navLabel: {
        ...theme.typography.body,
        color: theme.colors.text.secondary,
    },
    navLabelActive: {
        color: theme.colors.accent.primary,
        fontWeight: '600',
    },
});

export { SIDEBAR_WIDTH };
