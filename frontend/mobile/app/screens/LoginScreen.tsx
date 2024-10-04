import React, { useState, useEffect } from 'react';
import { TouchableOpacity, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Image } from 'expo-image';
import { Text, View } from '@/components/Themed';
import { useMutation } from '@tanstack/react-query';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import OtpScreen from './OtpScreen';
import { useQuery } from '@tanstack/react-query';
import { Profile } from '@/utils/index';
import OtpEmailImage from '@/assets/images/opt-email.png';
import CloseIcon from '@/assets/images/close.png';
import axiosClient from '@/app/api/axiosClient';
import { NavigationProps } from '@/utils/navi-props';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
    const navigation = useNavigation<NavigationProps>();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [focusedInput, setFocusedInput] = useState(false);
    const [showOtpScreen, setShowOtpScreen] = useState(false);
    const slideAnimation = useSharedValue(0);
    const { data: authUser, isLoading } = useQuery<Profile>({ queryKey: ['authUser'] });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: withTiming(slideAnimation.value, { duration: 300 }) }],
        };
    });

    useEffect(() => {
        if (authUser) {
            navigation.navigate('modal');
        }
    }, [authUser]);

    const { mutate: sendOtpMutation, isPending } = useMutation({
        mutationFn: async () => {
            try {
                const response = await axiosClient.post('/customers/requestotp', {
                    contact: email,
                });
                if (!response.data) throw new Error('Failed to send an OTP, please try it again later');
                return response.data;
            } catch (error) {
                throw new Error('Failed to send an OTP, please try it again later');
            }
        },
        onSuccess: () => {
            slideAnimation.value = withTiming(-400, { duration: 300 }, (finished) => {
                if (finished) {
                    runOnJS(setShowOtpScreen)(true);
                }
            });
        },
        onError: () => {
            setError('Failed to send an OTP, please try it again later');
            setFocusedInput(false);
        },
    });

    const handleSendOTP = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            setError('Please enter a valid email address');
            setFocusedInput(false)
            return;
        }
        if (!emailRegex.test(email)) {
            setError('Please check your email address');
            setFocusedInput(false)
            return;
        }

        sendOtpMutation();
    };

    const handleClose = () => {
        navigation.navigate('(tabs)');
    };

    if (showOtpScreen) {
        return <OtpScreen email={email} setShowOtpScreen={setShowOtpScreen} slideAnimation={slideAnimation} />;
    } else {
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
                >
                    <Animated.View style={[styles.container, animatedStyle]}>
                        {/* Close Button */}
                        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                            <Image alt='image' source={CloseIcon} style={styles.closeIcon} />
                        </TouchableOpacity>
                        <Text style={styles.headerText}>Login / Sign up</Text>
                        <Image alt='image' source={OtpEmailImage} style={styles.image} />
                        <Text style={styles.descriptionText}>Please enter your email address to get a one-time password</Text>
                        <TextInput
                            style={[styles.input,
                            error ? styles.errorInput : null,
                            focusedInput && styles.focusedInput,
                            ]}
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            onFocus={() => setFocusedInput(true)}
                            onBlur={() => setFocusedInput(false)}
                        />
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}
                        <TouchableOpacity style={styles.btn} onPress={handleSendOTP}>
                            <Text style={styles.btnText}>{isPending ? 'Sending...' : 'Send OTP'}</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        color: Colors.light.text,
    },
    headerText: {
        fontSize: 22,
        fontFamily: '500',
        textAlign: 'center',
        marginBottom: 10,
        color: Colors.light.text,
    },
    closeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 30,
        height: 30,
        borderRadius: 50,
        zIndex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
        backgroundColor: '#E6E6E6',
    },
    closeIcon: {
        width: 12,
        height: 12,
    },
    image: {
        width: 200,
        height: 200,
        marginVertical: 20,
        marginBottom: 40,
    },
    descriptionText: {
        width: 270,
        fontSize: 18,
        fontFamily: '400',
        textAlign: 'center',
        marginVertical: 15,
        color: Colors.light.secondary,
    },
    input: {
        width: 300,
        padding: 15,
        borderWidth: 1,
        fontSize: 18,
        fontFamily: '400',
        color: Colors.light.text,
        borderColor: Colors.GRAY,
        borderRadius: 10,
        marginVertical: 10,
    },
    focusedInput: {
        borderWidth: 1,
        borderColor: Colors.light.primary,
    },
    errorInput: {
        width: 300,
        padding: 15,
        borderWidth: 1,
        borderColor: Colors.light.error,
        borderRadius: 10,
        marginVertical: 10,
    },
    errorText: {
        color: Colors.light.error,
        marginBottom: 10,
    },
    btn: {
        width: 300,
        backgroundColor: Colors.PRIMARY,
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginTop: 20,
    },
    btnText: {
        fontSize: 18,
        fontFamily: '400',
        textAlign: 'center',
        color: '#fff',
    },
});