import React, { FC, useState, useEffect } from 'react';
import { TextInput, StyleSheet, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import Animated, { SlideOutRight } from 'react-native-reanimated';
import * as SecureStore from 'expo-secure-store';
import { useQuery } from '@tanstack/react-query';
import Loading from '@/components/loading/Loading';
import { Colors } from '../../constants/colors';
import { View, Text } from '@/components/Themed';
import UserIcon from '@/assets/images/user2.png';
import PhoneIcon from '@/assets/images/mobile2.png';
import EmailIcon from '@/assets/images/email2.png';
import HomeIcon from '@/assets/images/location2.png';
import UserDisableIcon from '@/assets/images/userDisable.png';
import PhoneDisableIcon from '@/assets/images/mobileDisable.png';
import EmailDisableIcon from '@/assets/images/emailDisable.png';
import HomeDisableIcon from '@/assets/images/locationDisable.png';
import UserErrorIcon from '@/assets/images/userError.png';
import PhoneErrorIcon from '@/assets/images/mobileError.png';
import EmailErrorIcon from '@/assets/images/emailError.png';
import HomeErrorIcon from '@/assets/images/locationError.png';
import { Profile } from '@/utils/index';

type Props = {
    onActivateChange: (isActivate: boolean) => void;
};

type ErrorKeys = 'fullName' | 'phone' | 'email' | 'address';

const PersonalInfo: FC<Props> = ({ onActivateChange }) => {
    const { data: authUser, isLoading } = useQuery<Profile>({ queryKey: ['authUser'] });
    const [fullName, setFullName] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [address, setAddress] = useState<string>('');
    const [focusedInput, setFocusedInput] = useState<string | null>(null);
    const [checkoutData, setCheckoutData] = useState<any>(null);

    useEffect(() => {
        if (authUser) {
            setFullName(authUser?.fullName || '');
            setPhone(authUser.phone ? authUser.phone.toString() : '');
            setEmail(authUser.email || '');
            setAddress(authUser.address || '');
        }
    }, [authUser]);

    useEffect(() => {
        const fetchCustomerData = async () => {
            try {
                const customerInfo = await fetchCustomerInfo();

                const fullName = authUser?.fullName || customerInfo?.fullName || '';
                const phone = authUser?.phone?.toString() || customerInfo?.phone || '';
                const email = authUser?.email || customerInfo?.email || '';
                const address = authUser?.address || customerInfo?.address || '';

                setFullName(fullName);
                setPhone(phone);
                setEmail(email);
                setAddress(address);

                setCheckoutData(customerInfo);

                const hasCompleteInfo = (fullName && phone && email && address);

                if (hasCompleteInfo) {
                    onActivateChange(true);
                } else {
                    onActivateChange(false);
                }
            } catch (error) {
                console.error('Failed to retrieve customer info securely:', error);
            }
        };

        fetchCustomerData();
    }, []);

    const saveCustomerInfo = async (customerInfo: any) => {
        try {
            await SecureStore.setItemAsync('customerInfo', JSON.stringify(customerInfo));
        } catch (error) {
            console.error('Failed to save customer info securely:', error);
        }
    };

    const fetchCustomerInfo = async () => {
        try {
            const customerInfo = await SecureStore.getItemAsync('customerInfo');
            if (customerInfo) {
                return JSON.parse(customerInfo);
            }
        } catch (error) {
            console.error('Failed to retrieve customer info securely:', error);
        }
        return null;
    };

    useEffect(() => {
        if (fullName && phone && email && address) {
            const customerInfo = { fullName, phone, email, address };
            saveCustomerInfo(customerInfo);
            onActivateChange(true);
        } else {
            onActivateChange(false);
        }
    }, [fullName, phone, email, address]);

    const [errors, setErrors] = useState({
        fullName: '',
        phone: '',
        email: '',
        address: ''
    });

    const handleFocus = (input: string) => {
        setFocusedInput(input);
    };

    const handleBlur = () => {
        setFocusedInput(null);
        validateInputs();
    };

    const validateInputs = () => {
        let valid = true;
        let newErrors: Record<ErrorKeys, string> = { fullName: '', phone: '', email: '', address: '' };

        if (!fullName.trim()) {
            newErrors.fullName = 'Full Name is required';
            valid = false;
        }

        if (!phone.trim() || !/^\d+$/.test(phone)) {
            newErrors.phone = 'Phone number must contain only digits';
            valid = false;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Invalid email format';
            valid = false;
        }

        if (!address.trim()) {
            newErrors.address = 'Address is required';
            valid = false;
        }

        setErrors(newErrors);
        onActivateChange(valid);
    };

    const getIcon = (field: ErrorKeys) => {
        if (errors[field]) {
            switch (field) {
                case 'fullName':
                    return UserErrorIcon;
                case 'phone':
                    return PhoneErrorIcon;
                case 'email':
                    return EmailErrorIcon;
                case 'address':
                    return HomeErrorIcon;
                default:
                    return UserDisableIcon;
            }
        } else if (focusedInput === field) {
            switch (field) {
                case 'fullName':
                    return UserIcon;
                case 'phone':
                    return PhoneIcon;
                case 'email':
                    return EmailIcon;
                case 'address':
                    return HomeIcon;
                default:
                    return UserDisableIcon;
            }
        } else {
            switch (field) {
                case 'fullName':
                    return UserDisableIcon;
                case 'phone':
                    return PhoneDisableIcon;
                case 'email':
                    return EmailDisableIcon;
                case 'address':
                    return HomeDisableIcon;
                default:
                    return UserDisableIcon;
            }
        }
    };

    const getLabelStyle = (field: ErrorKeys) => {
        if (errors[field]) {
            return styles.labelError;
        } else if (focusedInput === field) {
            return styles.label;
        } else {
            return styles.labelDisAble;
        }
    };

    const handlePressOutside = () => {
        Keyboard.dismiss();
    };

    if (isLoading) {
        return (
            <Loading />
        )
    }

    return (
        <TouchableWithoutFeedback onPress={handlePressOutside}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === "ios" ? 280 : 0}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
                    <Animated.View exiting={SlideOutRight} style={styles.innerContainer}>
                        <View style={styles.labelContainer}>
                            <View style={styles.iconCover}>
                                <Image source={getIcon('fullName')} alt='icon' style={styles.icon} contentFit='contain' />
                            </View>
                            <Text style={getLabelStyle('fullName')}>Full Name *</Text>
                        </View>
                        <TextInput
                            style={[
                                styles.input,
                                focusedInput === 'fullName' && styles.focusedInput,
                                errors.fullName ? styles.errorInput : null
                            ]}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder='Full Name'
                            onFocus={() => handleFocus('fullName')}
                            onBlur={handleBlur}
                        />
                        {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}

                        {/* Repeat the same structure for other inputs */}
                        <View style={styles.labelContainer}>
                            <View style={styles.iconCover}>
                                <Image source={getIcon('phone')} alt='icon' style={styles.icon} contentFit='contain' />
                            </View>
                            <Text style={getLabelStyle('phone')}>Phone *</Text>
                        </View>
                        <TextInput
                            style={[
                                styles.input,
                                focusedInput === 'phone' && styles.focusedInput,
                                errors.phone ? styles.errorInput : null
                            ]}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder='Phone'
                            keyboardType='phone-pad'
                            onFocus={() => handleFocus('phone')}
                            onBlur={handleBlur}
                        />
                        {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}

                        <View style={styles.labelContainer}>
                            <View style={styles.iconCover}>
                                <Image source={getIcon('email')} alt='icon' style={styles.icon} contentFit='contain' />
                            </View>
                            <Text style={getLabelStyle('email')}>Email *</Text>
                        </View>
                        <TextInput
                            style={[
                                styles.input,
                                focusedInput === 'email' && styles.focusedInput,
                                errors.email ? styles.errorInput : null
                            ]}
                            value={email}
                            onChangeText={setEmail}
                            placeholder='Email'
                            keyboardType='email-address'
                            onFocus={() => handleFocus('email')}
                            onBlur={handleBlur}
                        />
                        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

                        <View style={styles.labelContainer}>
                            <View style={styles.iconCover}>
                                <Image source={getIcon('address')} alt='icon' style={styles.icon} contentFit='contain' />
                            </View>
                            <Text style={getLabelStyle('address')}>Delivery address *</Text>
                        </View>
                        <TextInput
                            style={[
                                styles.input,
                                focusedInput === 'address' && styles.focusedInput,
                                errors.address ? styles.errorInput : null
                            ]}
                            value={address}
                            onChangeText={setAddress}
                            placeholder='Address'
                            onFocus={() => handleFocus('address')}
                            onBlur={handleBlur}
                        />
                        {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

export default PersonalInfo;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'stretch',
        backgroundColor: '#fff',
    },
    innerContainer: {
        width: 360,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    labelContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 2,
        paddingLeft: 8,
        backgroundColor: '#fff',
    },
    iconCover: {
        width: 18,
        height: 18,
        marginRight: 10,
        backgroundColor: '#fff',
    },
    icon: {
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
    },
    label: {
        fontSize: 18,
        fontFamily: '300',
        color: Colors.light.primary,
    },
    labelDisAble: {
        fontSize: 18,
        fontFamily: '300',
        color: "#757575",
    },
    labelError: {
        fontSize: 18,
        fontFamily: '300',
        color: Colors.light.error,
    },
    input: {
        width: '100%',
        height: 60,
        fontSize: 18,
        fontFamily: '300',
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 10,
        backgroundColor: '#E2EAF0',
        borderWidth: 1 / 3,
        borderColor: '#CFCFCF',
    },
    focusedInput: {
        shadowColor: '#757575',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        borderColor: Colors.light.primary,
        borderWidth: 1,
        backgroundColor: '#F5F8FB',
    },
    errorInput: {
        borderWidth: 1,
        borderColor: Colors.light.error,
    },
    errorText: {
        width: '100%',
        color: Colors.light.error,
        textAlign: 'left',
        paddingLeft: 10,
        fontSize: 14,
    },
});