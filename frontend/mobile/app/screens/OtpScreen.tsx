import React, { useState, useEffect, FC, useRef } from 'react';
import { TouchableOpacity, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { View, Text } from '@/components/Themed'
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '@/utils/navi-props';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { withTiming, useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Colors } from '@/constants/colors';
import KeyImage from '../../assets/images/key.png';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '@/app/api/axiosClient';
import { Profile } from '@/utils/index';

type Props = {
    email: string;
    setShowOtpScreen: (value: boolean) => void;
    slideAnimation: any;
};

const OtpScreen: FC<Props> = ({ email, setShowOtpScreen, slideAnimation }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [timer, setTimer] = useState(300); // 5 minutes
    const inputRefs = useRef<(TextInput | null)[]>([]);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const queryClient = useQueryClient();
    const otpScreenAnimation = useSharedValue(0);
    const navigation = useNavigation<NavigationProps>();
    const { data: authUser } = useQuery<Profile>({ queryKey: ['authUser'] });

    useEffect(() => {
        if (authUser) {
            navigation.navigate('modal');
        }
    }, [authUser]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: otpScreenAnimation.value }],
        };
    });

    const verifyOtpMutation = useMutation({
        mutationFn: async () => {
            try {
                const response = await axiosClient.post('/customers/verifyotp', {
                    contact: email,
                    otp: otp.join(''),
                });
                if (!response.data) throw new Error('Failed to verify OTP');
                return response.data;
            } catch (error) {
                throw new Error('Failed to verify OTP');
            }
        },
        onSuccess: async (data) => {
            const token = data.token;
            await AsyncStorage.setItem('authToken', token);
            queryClient.invalidateQueries({ queryKey: ['authUser'] });

            navigation.navigate('modal');
        },
        onError: () => {
            setError('Failed to verify OTP');
            setIsVerifying(false);
        },
    });

    const resendOtpMutation = useMutation({
        mutationFn: async () => {
            try {
                const response = await axiosClient.post('/customers/requestotp', {
                    contact: email,
                });
                if (!response.data) throw new Error('Failed to send OTP');
                return response.data;
            } catch (error) {
                throw new Error('Failed to send OTP');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['authUser'] });
            setOtp(['', '', '', '', '', '']);
            setError('');
            setTimer(300);
            setFocusedIndex(null);
            setIsVerifying(false);
            inputRefs.current[0]?.focus();
        },
        onError: () => {
            setError('Failed to send OTP');
        },
    });

    useEffect(() => {
        const countdown = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer <= 1) {
                    clearInterval(countdown);
                    return 0;
                }
                return prevTimer - 1;
            });
        }, 1000);

        return () => clearInterval(countdown);
    }, [timer]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const handleVerifyOTP = () => {
        setIsVerifying(true);
        if (otp.includes('')) {
            setError('Please enter the complete 6-digit OTP');
            setIsVerifying(false);
            return;
        }
        verifyOtpMutation.mutate();
    };

    const handleOtpChange = (value: string, index: number) => {
        setError('');

        if (value.length > 1) {
            // Handle pasted OTP
            const otpArray = value.slice(0, 6).split('');
            setOtp(otpArray);
            otpArray.forEach((char, i) => {
                if (inputRefs.current[i]) {
                    inputRefs.current[i]!.setNativeProps({ text: char });
                }
            });
            if (otpArray.length === 6) {
                inputRefs.current[5]?.focus(); // Focus the last input if OTP is complete
            }
        } else {
            // Handle single character input
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            if (value && index < otp.length - 1) {
                inputRefs.current[index + 1]?.focus();
            }

            if (value === '' && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handleKeyPress = ({ nativeEvent }: any, index: number) => {
        if (nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleResendOtp = () => {
        resendOtpMutation.mutate();
    };

    const handleChangeEmail = () => {
        otpScreenAnimation.value = withTiming(400, { duration: 300 }, () => {
            runOnJS(setShowOtpScreen)(false);
        });
        slideAnimation.value = withTiming(0, { duration: 300 });
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                <Animated.View style={[styles.container, animatedStyle]}>
                    <Text style={styles.headerText}>Verify your email address</Text>
                    <View style={styles.line}></View>
                    <View style={styles.reportContainer}>
                        <View>
                            <Text style={styles.reportText}>
                                A one-time password has been sent to
                            </Text>
                            <Text style={styles.email}>{email}</Text>
                        </View>
                        <Image source={KeyImage} style={styles.keyImage} alt='image' />
                    </View>

                    <Text style={styles.descriptionText}>Please check your inbox and enter the password below to verify your email address. The password will expire in 5 minutes.</Text>
                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                style={[
                                    styles.otpInput,
                                    focusedIndex === index ? styles.focusedOtpInput : null,
                                    error || timer === 0 ? styles.errorOtpInput : null,
                                ]}
                                value={digit}
                                onChangeText={(value) => handleOtpChange(value, index)}
                                keyboardType="numeric"
                                maxLength={6} // Allow up to 6 characters in case of paste
                                onFocus={() => setFocusedIndex(index)}
                                onBlur={() => setFocusedIndex(null)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                            />
                        ))}
                    </View>
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    <Text style={timer > 0 ? styles.timerText : styles.sendAgainText}>
                        {timer > 0 ? `Resend OTP in ${formatTime(timer)}` : 'OTP expired, please send it again.'}
                    </Text>
                    <TouchableOpacity
                        style={[styles.btn, isVerifying && styles.disabledBtn]}
                        onPress={handleVerifyOTP}
                        disabled={isVerifying || timer === 0}
                    >
                        <Text style={[styles.btnText, isVerifying && styles.disableText]}>{(!isVerifying || timer === 0) ? 'Verify' : 'Verifying...'}</Text>
                    </TouchableOpacity>

                    <View style={styles.btnTextCover}>
                        <TouchableOpacity style={styles.resendText} onPress={handleResendOtp}>
                            <Text style={styles.resendText}>Send again</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.resendText} onPress={handleChangeEmail}>
                            <Text style={styles.resendText}>Change email</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default OtpScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        color: Colors.light.text,
    },
    keyImage: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    headerText: {
        fontSize: 22,
        fontFamily: '500',
        textAlign: 'center',
        marginBottom: 10,
        color: Colors.light.text,
    },
    line: {
        backgroundColor: Colors.light.secondary,
        height: 1,
        width: 350,
        marginBottom: 20,
    },
    reportContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    reportText: {
        fontSize: 18,
        fontFamily: '300',
        textAlign: 'left',
        marginBottom: 3,
        color: Colors.light.text,
    },
    email: {
        fontSize: 18,
        fontFamily: '500',
        textAlign: 'left',
        marginBottom: 40,
        color: Colors.light.primary,
    },
    descriptionText: {
        fontSize: 17,
        fontFamily: '300',
        textAlign: 'center',
        width: 350,
        marginBottom: 15,
        color: Colors.light.secondary,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 15,
    },
    otpInput: {
        width: 50,
        height: 50,
        borderWidth: 1,
        borderColor: Colors.light.secondary,
        borderRadius: 10,
        textAlign: 'center',
        fontSize: 20,
        marginHorizontal: 5,
    },
    focusedOtpInput: {
        borderColor: Colors.light.primary,
    },
    errorOtpInput: {
        borderColor: Colors.light.error,
    },
    errorText: {
        color: Colors.light.error,
        marginBottom: 10,
    },
    timerText: {
        fontSize: 16,
        fontFamily: '300',
        marginTop: 14,
        color: Colors.light.secondary,
    },
    sendAgainText: {
        marginTop: 10,
        color: Colors.light.error,
    },
    btn: {
        backgroundColor: Colors.light.primary,
        padding: 16,
        borderRadius: 10,
        marginTop: 30,
        marginBottom: 20,
        width: 350,
    },
    disabledBtn: {
        backgroundColor: Colors.GRAY,
    },
    btnText: {
        textAlign: 'center',
        color: '#fff',
        fontSize: 18,
        fontFamily: '400',
    },
    disableText: {
        textAlign: 'center',
        color: Colors.light.text,
        fontSize: 16,
    },
    btnTextCover: {
        fontSize: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 250,
    },
    resendText: {
        fontSize: 16,
        marginTop: 12,
        color: '#4d68b0',
        textDecorationLine: 'underline',
    },
});