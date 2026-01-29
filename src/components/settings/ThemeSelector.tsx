import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { theme } from '../../theme/theme';
import { THEME_PALETTES, useThemeStore, ThemeId } from '../../store/themeStore';

interface ThemeSelectorProps {
    visible: boolean;
    onClose: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ visible, onClose }) => {
    const { currentThemeId, setTheme } = useThemeStore();
    const palettes = Object.values(THEME_PALETTES);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.container}>
                    <Text style={styles.title}>Escolher Tema</Text>

                    <ScrollView contentContainerStyle={styles.grid}>
                        {palettes.map((palette) => (
                            <TouchableOpacity
                                key={palette.id}
                                style={[
                                    styles.card,
                                    currentThemeId === palette.id && styles.activeCard
                                ]}
                                onPress={() => {
                                    setTheme(palette.id as ThemeId);
                                    // We might want to close immediately or let user see selection
                                    // onClose(); 
                                }}
                            >
                                <View style={[styles.preview, { backgroundColor: palette.background }]}>
                                    <View style={[styles.circle, { backgroundColor: palette.primary }]} />
                                    <View style={[styles.circle, { backgroundColor: palette.secondary, marginLeft: -10 }]} />
                                </View>

                                <Text style={[
                                    styles.name,
                                    currentThemeId === palette.id && { color: palette.primary }
                                ]}>
                                    {palette.name}
                                </Text>

                                {currentThemeId === palette.id && (
                                    <View style={[styles.checkBadge, { backgroundColor: palette.primary }]}>
                                        <Text style={styles.check}>✓</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeText}>Fechar</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        padding: 20,
    },
    container: {
        backgroundColor: '#1A1A1A',
        borderRadius: 20,
        padding: 24,
        maxHeight: '80%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 20,
        textAlign: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    card: {
        width: '48%',
        backgroundColor: '#2A2A2A',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
        alignItems: 'center',
    },
    activeCard: {
        borderColor: '#FFF',
        backgroundColor: '#333',
    },
    preview: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: 60,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#444',
    },
    circle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    name: {
        color: '#BBB',
        fontSize: 14,
        fontWeight: '600',
    },
    checkBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    check: {
        color: '#000',
        fontSize: 12,
        fontWeight: 'bold',
    },
    closeButton: {
        marginTop: 12,
        padding: 16,
        backgroundColor: '#333',
        borderRadius: 12,
        alignItems: 'center',
    },
    closeText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
