import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../ui/Button';
import { theme } from '../../theme/theme';

interface ReceiptCameraModalProps {
    visible: boolean;
    onClose: () => void;
    onPhotoSelected: (uri: string) => void;
}

export const ReceiptCameraModal: React.FC<ReceiptCameraModalProps> = ({
    visible,
    onClose,
    onPhotoSelected,
}) => {
    const [loading, setLoading] = useState(false);

    const takePhoto = async () => {
        try {
            setLoading(true);
            const { status } = await ImagePicker.requestCameraPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permissão necessária', 'Precisamos de acesso à câmara para tirar fotos das faturas.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.7,
                allowsEditing: true,
            });

            if (!result.canceled && result.assets[0].uri) {
                onPhotoSelected(result.assets[0].uri);
                onClose();
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Erro', 'Não foi possível tirar a foto.');
        } finally {
            setLoading(false);
        }
    };

    const pickFromGallery = async () => {
        try {
            setLoading(true);
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para selecionar faturas.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.7,
                allowsEditing: true,
            });

            if (!result.canceled && result.assets[0].uri) {
                onPhotoSelected(result.assets[0].uri);
                onClose();
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Adicionar Fatura</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.subtitle}>
                            Escolha como quer adicionar a fatura. A IA irá extrair os dados automaticamente.
                        </Text>

                        <View style={styles.buttonsContainer}>
                            <Button
                                title="📸 Tirar Foto"
                                onPress={takePhoto}
                                loading={loading}
                                fullWidth
                                size="lg"
                                style={styles.button}
                            />

                            <Button
                                title="🖼️ Galeria"
                                onPress={pickFromGallery}
                                loading={loading}
                                variant="outline"
                                fullWidth
                                size="lg"
                                style={styles.button}
                            />
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: theme.colors.background.secondary,
        borderTopLeftRadius: theme.borderRadius.xl,
        borderTopRightRadius: theme.borderRadius.xl,
        paddingTop: theme.spacing.lg,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
        marginBottom: theme.spacing.lg,
    },
    title: {
        ...theme.typography.h2,
        color: theme.colors.text.primary,
    },
    closeButton: {
        fontSize: 24,
        color: theme.colors.text.tertiary,
    },
    content: {
        paddingHorizontal: theme.spacing.xl,
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.xl,
        textAlign: 'center',
    },
    buttonsContainer: {
        gap: theme.spacing.md,
    },
    button: {
        marginBottom: theme.spacing.sm,
    },
});
