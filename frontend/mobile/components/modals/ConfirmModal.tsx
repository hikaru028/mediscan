import React, { FC, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '@/app/api/axiosClient';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '@/utils/navi-props';

type Props = {
    question: string;
    authUserId?: number;
    setPhoto?: (photo: { uri: string } | null) => void;
    modalVisible: boolean;
    setModalVisible: (modalVisible: boolean) => void;
    retakePhoto?: () => void,
    slideDown?: () => void;
}

const ConfirmModal: FC<Props> = ({ question, authUserId, setPhoto, modalVisible, setModalVisible, retakePhoto, slideDown }) => {
    const queryClient = useQueryClient();
    const navigation = useNavigation<NavigationProps>();

    const { mutate: deleteMutation, isPending } = useMutation({
        mutationFn: async (id: number) => {
            try {
                const token = await SecureStore.getItemAsync('authToken');
                const res = await axiosClient.delete(`/customers/delete/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                return res.data;
            } catch (error: any) {
                throw new Error('Failed to delete');
            }
        },
        onSuccess: () => {
            AsyncStorage.removeItem('authToken');
            queryClient.invalidateQueries({ queryKey: ['authUser'] });
            setModalVisible(false);
            navigation.navigate('screens/LoginScreen');
        },
        onError: (error: any) => {
            console.error('Failed to delete account:', error);
        },
    });

    const confirmYes = () => {
        if (question === 'This action will delete all data.') {
            if (authUserId !== undefined) {
                deleteMutation(authUserId)
            };
        } else if (question === 'Would you delete this result?') {
            retakePhoto?.();
            slideDown?.();
            setModalVisible(false);
        } else if (question === 'Would you like to cancel your order?') {
            navigation.navigate('cart');
            setModalVisible(false);
        } else {
            retakePhoto?.();
            setModalVisible(false);
        }
    }

    const confirmNo = () => {
        setModalVisible(false);
    }

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={confirmYes}
        >
            <BlurView style={styles.blurContainer} intensity={7}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>{question}</Text>
                        <View style={styles.modalButtonWrap}>
                            <TouchableOpacity onPress={confirmNo} style={styles.modalButton}>
                                <Text style={styles.modalButtonText}>No</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={confirmYes} style={styles.modalButton}>
                                {isPending ? (
                                    <Text style={styles.modalButtonText}>Loading...</Text>
                                ) : (
                                    <Text style={styles.modalButtonText}>Yes</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </BlurView>
        </Modal>
    )
}

export default ConfirmModal;

const styles = StyleSheet.create({
    blurContainer: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContainer: {
        width: '100%',
        height: '100%',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        paddingVertical: 30,
        paddingHorizontal: 20,
        backgroundColor: '#FFF',
        borderRadius: 20,
        alignItems: 'center',
    },
    modalText: {
        fontSize: 20,
        marginBottom: 30,
        textAlign: 'center',
    },
    modalButtonWrap: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        width: '45%',
        paddingVertical: 15,
        paddingHorizontal: 15,
        backgroundColor: '#85ccb8',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#FFF',
        fontSize: 18,
    },
});