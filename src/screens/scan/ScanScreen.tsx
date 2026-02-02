import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../theme/theme';
import { ManualExpenseModal } from '../../components/expenses/ManualExpenseModal';
import { ResponsiveContainer } from '../../components/ui/ResponsiveContainer';

export const ScanScreen = ({ navigation }: any) => {
    const [image, setImage] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [scannedData, setScannedData] = useState<any>(null);

    const pickImage = async (source: 'camera' | 'gallery') => {
        let result;
        if (source === 'camera') {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) return Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera.');
            result = await ImagePicker.launchCameraAsync({ quality: 0.5, base64: true });
        } else {
            result = await ImagePicker.launchImageLibraryAsync({ quality: 0.5, base64: true });
        }

        if (!result.canceled && result.assets[0].base64) {
            setImage(result.assets[0].uri);
            analyzeReceipt(result.assets[0].base64);
        }
    };

    const analyzeReceipt = async (base64: string) => {
        setAnalyzing(true);

        // SIMULATION OF AI ANALYSIS (Fallback for Demo/Portfolio)
        setTimeout(() => {
            setAnalyzing(false);

            // Random reliable mock data
            const randomAmount = (Math.random() * 50 + 10).toFixed(2);

            const mockResult = {
                merchant: 'Continente Modelo',
                amount: parseFloat(randomAmount),
                date: new Date(),
                currency: 'EUR',
                categoryId: null
            };

            setScannedData(mockResult);
            setShowEditModal(true);
        }, 3000);
    };

    const handleSave = () => {
        setShowEditModal(false);
        setImage(null);
        setScannedData(null);
        Alert.alert('Sucesso', 'Fatura processada e despesa guardada! ✅');
        navigation.navigate('Wallet'); // Go back to home
    };

    return (
        <ResponsiveContainer style={styles.container}>
            <View style={styles.content}>
                {/* Close Button since TabBar is hidden */}
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => navigation.navigate('Wallet')}
                >
                    <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>

                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>🧾</Text>
                </View>
                <Text style={styles.title}>AI Invoice Scanner</Text>
                <Text style={styles.subtitle}>
                    Tira uma foto da tua fatura e e a AI preenche os detalhes automaticamente.
                </Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.mainButton} onPress={() => pickImage('camera')}>
                        <Text style={styles.mainButtonIcon}>📸</Text>
                        <Text style={styles.mainButtonText}>Tirar Foto</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryButton} onPress={() => pickImage('gallery')}>
                        <Text style={styles.secondaryText}>Abrir Galeria</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Analysis Overlay */}
            {analyzing && (
                <View style={styles.overlay}>
                    <ActivityIndicator size="large" color={theme.colors.accent.primary} />
                    <Text style={styles.overlayText}>🤖 A ler fatura...</Text>
                    <Text style={styles.overlaySubtext}>A extrair comerciante, data e total.</Text>
                </View>
            )}

            {/* Result / Edit Modal */}
            <ManualExpenseModal
                visible={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSuccess={handleSave}
                initialData={scannedData}
            />
        </ResponsiveContainer>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary, justifyContent: 'center' },
    content: { padding: theme.spacing.xl, alignItems: 'center', width: '100%' },
    closeButton: { position: 'absolute', top: 0, right: 20, padding: 10, zIndex: 10 },
    closeButtonText: { fontSize: 30, color: theme.colors.text.secondary },
    iconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.background.secondary, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.lg, marginTop: 40 },
    icon: { fontSize: 40 },
    title: { ...theme.typography.h2, color: theme.colors.text.primary, marginBottom: theme.spacing.sm, textAlign: 'center' },
    subtitle: { ...theme.typography.body, color: theme.colors.text.secondary, textAlign: 'center', marginBottom: theme.spacing.xl },

    buttonContainer: { width: '100%', gap: 15 },
    mainButton: { backgroundColor: theme.colors.accent.primary, padding: 20, borderRadius: theme.borderRadius.lg, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: theme.colors.accent.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
    mainButtonIcon: { fontSize: 24, marginRight: 10, color: '#FFF' },
    mainButtonText: { ...theme.typography.h3, color: '#FFF' },

    secondaryButton: { padding: 15, borderRadius: theme.borderRadius.lg, borderWidth: 1, borderColor: theme.colors.text.tertiary, alignItems: 'center' },
    secondaryText: { ...theme.typography.body, color: theme.colors.text.primary },

    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
    overlayText: { ...theme.typography.h3, color: '#FFF', marginTop: 20 },
    overlaySubtext: { ...theme.typography.caption, color: theme.colors.text.secondary, marginTop: 10 }
});
