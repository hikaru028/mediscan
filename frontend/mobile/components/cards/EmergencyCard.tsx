import React, { FC, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Linking, KeyboardAvoidingView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '@/app/api/axiosClient';
import { Emergency } from '../../utils/index';
import { BlurView } from 'expo-blur';
import PharmacyImage from '../../assets/images/pharmacy.png';
import AmbulanceImage from '../../assets/images/ambulance.png';
import HospitalImage from '../../assets/images/hospital.png';
import GPImage from '../../assets/images/gp.png';
import MoreIcon from '../../assets/images/more-dots.png';
import { Colors } from '../../constants/colors';

const cardImages = [
    { index: 1, image: PharmacyImage },
    { index: 2, image: AmbulanceImage },
    { index: 3, image: HospitalImage },
    { index: 4, image: GPImage },
];

type Props = {
    data: Emergency;
    index: number;
};

const EmergencyCard: FC<Props> = ({ data, index }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [name, setName] = useState(data.name);
    const [address, setAddress] = useState(data.address);
    const [phone, setPhone] = useState(data.phone);
    const [errors, setErrors] = useState<{ name?: string; address?: string; phone?: string }>({});
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    const queryClient = useQueryClient();


    const validateFields = () => {
        let errors: { name?: string; address?: string; phone?: string } = {};
        if (!name.trim()) {
            errors.name = 'Name is required';
        }
        if (!phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (
            phone !== 'XXX-XXX-XXXX' &&
            !/^(09|\(02[1-9]\)|02[1-9])\d{1,3}[-\s]?\d{3}[-\s]?\d{3,4}$/.test(phone) &&
            !/^\d{3}$/.test(phone) &&
            !/^\d{4}$/.test(phone)
        ) {
            errors.phone = 'Invalid phone number';
        }
        return errors;
    };

    const saveContactMutation = useMutation({
        mutationFn: async (updatedData: Emergency) => {
            const res = await axiosClient.post(
                `/contacts/save/${data.id}`,
                updatedData,
                {
                    withCredentials: true,
                }
            );

            if (res.status !== 200) {
                throw new Error('Failed to update');
            }
            return updatedData;
        },
        onSuccess: (updatedData) => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] });

            setName(updatedData.name);
            setAddress(updatedData.address);
            setPhone(updatedData.phone);

            setModalVisible(false);
        },
        onError: (error: any) => {
            console.error('Failed to update data', error);
        },
    });

    const handleSave = () => {
        const validationErrors = validateFields();
        setErrors(validationErrors);
        setFocusedInput(null);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        const updatedData: Emergency = {
            id: data.id,
            name,
            address,
            phone,
        };

        saveContactMutation.mutate(updatedData);
    };

    const handleOpenMap = () => {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        Linking.canOpenURL(url)
            .then((supported) => {
                if (!supported) {
                    alert('Cannot open the map.');
                } else {
                    return Linking.openURL(url);
                }
            })
            .catch((err) => console.error('An error occurred', err));
    };

    const handleCall = () => {
        if (phone === 'XXX-XXX-XXXX') {
            return;
        }
        const url = `tel:${phone}`;
        Linking.canOpenURL(url)
            .then((supported) => {
                if (!supported) {
                    alert('Phone call is not supported on this device.');
                } else {
                    return Linking.openURL(url);
                }
            })
            .catch((err) => console.error('An error occurred', err));
    };

    const handleMore = () => {
        setModalVisible(true);
    };

    const handleCancel = () => {
        setName(data.name);
        setAddress(data.address);
        setPhone(data.phone);
        setErrors({});
        setModalVisible(false);
    };

    return (
        <>
            <View style={styles.card}>
                <TouchableOpacity onPress={handleOpenMap} style={styles.mapCover}>
                    <Image alt='image' source={cardImages.find(img => img.index === index)?.image} style={styles.cardImage} contentFit='contain' />
                    <View style={styles.infoContainer}>
                        <Text style={styles.title}>{name}</Text>
                        <Text style={styles.address}>{address}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCall} style={styles.phoneCover}>
                    <Text style={styles.phone}>{phone}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleMore} style={styles.moreIconCover}>
                    <Image alt='image' source={MoreIcon} style={styles.moreIcon} contentFit='contain' />
                </TouchableOpacity>
            </View >

            {/* Modal for Editing */}
            <Modal
                animationType='fade'
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleCancel}
            >
                <BlurView style={styles.blurContainer} intensity={20}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalContainer}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
                    >
                        <View style={styles.modalContent}>
                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={styles.button} onPress={handleCancel}>
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.button} onPress={handleSave}>
                                    <Text style={styles.buttonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.imageCover}>
                                <Image alt='image' source={cardImages.find(img => img.index === index)?.image} style={styles.modalImage} contentFit='contain' />
                            </View>
                            <TextInput
                                style={[
                                    styles.input,
                                    errors.name ? styles.errorBorder : null,
                                    focusedInput === 'name' && styles.focusedBorder,
                                ]}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter new place name"
                                onFocus={() => setFocusedInput('name')}
                                onBlur={() => setFocusedInput(null)}
                            />
                            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                            <TextInput
                                style={[
                                    styles.input,
                                    errors.address ? styles.errorBorder : null,
                                    focusedInput === 'address' && styles.focusedBorder,
                                ]}
                                value={address}
                                onChangeText={setAddress}
                                placeholder="Enter new address"
                                onFocus={() => setFocusedInput('address')}
                                onBlur={() => setFocusedInput(null)}
                            />
                            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
                            <TextInput
                                style={[
                                    styles.input,
                                    errors.phone ? styles.errorBorder : null,
                                    focusedInput === 'phone' && styles.focusedBorder,
                                ]}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="Enter new phone number"
                                keyboardType="phone-pad"
                                onFocus={() => setFocusedInput('phone')}
                                onBlur={() => setFocusedInput(null)}
                            />
                            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                        </View>
                    </KeyboardAvoidingView>
                </BlurView>
            </Modal >
        </>
    );
};

export default EmergencyCard;

const styles = StyleSheet.create({
    card: {
        width: '49%',
        height: 275,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        shadowColor: '#757575',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    mapCover: {
        width: '100%',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    imageCover: {
        width: 100,
        height: 100,
        overflow: 'hidden',
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardImage: {
        width: 80,
        height: 80,
        marginVertical: 10,
    },
    infoContainer: {
        width: '100%',
        height: 80,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 18,
        fontFamily: '500',
        marginBottom: 5,
    },
    address: {
        fontSize: 15,
        fontFamily: '300',
        color: Colors.light.secondary,
        marginBottom: 20,
    },
    phoneCover: {
        margin: 10,
        backgroundColor: '#F7F7F7',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1 / 3,
        borderColor: '#CFCFCF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    phone: {
        width: 150,
        fontSize: 20,
        fontFamily: '500',
        color: '#85ccb8',
        textAlign: 'center',
    },
    moreIconCover: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 30,
        height: 30,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7F7F7'
    },
    moreIcon: {
        width: 3,
        height: 15,
    },
    blurContainer: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modal: {
        flex: 1,
    },
    modalContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 0,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    buttonText: {
        color: '#4d68b0',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalContent: {
        width: 320,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalImage: {
        width: 80,
        height: 80,
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 40,
        fontSize: 18,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    focusedBorder: {
        borderColor: Colors.light.primary,
    },
    errorBorder: {
        borderColor: '#F06C6C',
    },
    errorText: {
        color: '#F06C6C',
        width: '100%',
        textAlign: 'left',
        fontSize: 14,
        marginTop: -12,
        marginBottom: 10,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
});