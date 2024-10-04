import React, { FC, useState, useEffect, useRef } from 'react';
import { StyleSheet, SafeAreaView, TouchableOpacity, Animated, Easing } from 'react-native';
import { Image } from 'expo-image';
import { View, Text } from '@/components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProps } from '@/utils/navi-props';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@/constants/colors';
import PersonalInfo from '@/components/checkout/PersonalInfo';
import ArrowLeftIcon from '@/assets/images/arrow-left.png';
import PaymentMethod from '@/components/checkout/PaymentMethod';
import CheckoutConfirmation from '@/components/checkout/CheckoutConfirmation';
import LoadingLight from '@/components/loading/LoadingLight';
import PaymentSuccessScreen from '@/app/screens/PaymentSuccessScreen'
import PaymentFailScreen from '@/app/screens/PaymentFailScreen'
import ConfirmModal from '../../components/modals/ConfirmModal';

const DeliveryAndPaymentInfoScreen: FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [canOrder, setCanOrder] = useState<boolean>(false);
    const [isPaymentSuccessScreen, setIsPaymentSuccessScreen] = useState<boolean>(false);
    const [isPaymentFailScreen, setIsPaymentFailScreen] = useState<boolean>(false);
    const [isPersonalInfoActivate, setIsPersonalInfoActivate] = useState<boolean>(false);
    const [isPaymentMethodActivate, setIsPaymentMethodActivate] = useState<boolean>(false);
    const [isCheckoutConfirmationActivate, setIsCheckoutConfirmationActivate] = useState<boolean>(false);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState<string>('creditCard');
    const [modalVisible, setModalVisible] = useState(false);
    const progressPath1 = useRef(new Animated.Value(0)).current;
    const progressPath2 = useRef(new Animated.Value(0)).current;
    const pointOn = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const fetchCheckoutData = async () => {
            try {
                const data = await AsyncStorage.getItem('checkoutData');
                if (data) {
                    const parsedData = JSON.parse(data);
                    setCurrentStep(parsedData.currentStep || 0);
                    setIsPersonalInfoActivate(parsedData.isPersonalInfoActivate || false);
                    setIsPaymentMethodActivate(parsedData.isPaymentMethodActivate || false);
                    setIsCheckoutConfirmationActivate(parsedData.isCheckoutConfirmationActivate || false);
                }
            } catch (error) {
                console.error('Failed to retrieve checkout data:', error);
            }
        };

        fetchCheckoutData();
    }, []);

    const saveStepData = async () => {
        try {
            const dataToSave = {
                currentStep,
                isPersonalInfoActivate,
                isPaymentMethodActivate,
                isCheckoutConfirmationActivate,
            };
            await AsyncStorage.setItem('checkoutData', JSON.stringify(dataToSave));
        } catch (error) {
            console.error('Failed to save step data:', error);
        }
    };

    const handleClose = async () => {
        await saveStepData();
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            animateProgress(currentStep - 1);
        } else {
            setModalVisible(true)
        }
    };

    const handleNextButton = async () => {
        await saveStepData();

        if (currentStep == 0) {
            setCurrentStep(currentStep + 1);
            animateProgress(currentStep + 1);
        } else if (currentStep === 1) {
            setCurrentStep(currentStep + 1);
            animateProgress(currentStep + 1);
            setCanOrder(true);
        }
    };

    const handlePlaceOrder = () => {
        setIsLoading(true);

        setTimeout(() => {
            const isSuccess = Math.floor(Math.random() * 3) + 1;

            if (isSuccess === 1) {
                setIsPaymentFailScreen(true);
            } else {
                setIsPaymentSuccessScreen(true);
            }
            setIsLoading(false);
        }, 3000);
    }


    const animateProgress = (step: number) => {
        if (step === 1) {
            Animated.timing(progressPath1, {
                toValue: 100,
                duration: 500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }).start(() => {
                Animated.timing(pointOn, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: false,
                }).start();
            });
        }

        if (step === 2) {
            Animated.timing(progressPath2, {
                toValue: 100,
                duration: 500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }).start(() => {
                Animated.timing(pointOn, {
                    toValue: 2,
                    duration: 500,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: false,
                }).start();
            });
        }
    };

    const progressPathWidth1 = progressPath1.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    const progressPathWidth2 = progressPath2.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    const getPointStyle = (index: number) => {
        if (index < currentStep) {
            return styles.pointDone;
        } else if (index === currentStep) {
            return styles.pointOn;
        } else {
            return styles.pointOff;
        }
    };

    return (
        <>
            {/* Payment success */}
            {isPaymentSuccessScreen && <PaymentSuccessScreen isPaymentSuccessScreen={isPaymentSuccessScreen} />}
            {/* Payment failed */}
            {isPaymentFailScreen && <PaymentFailScreen setIsPaymentFailScreen={setIsPaymentFailScreen} />}
            {/* Checkout */}
            {!isPaymentSuccessScreen && !isPaymentFailScreen && (
                <SafeAreaView style={styles.container}>
                    {/* Header */}
                    <View style={styles.headerContainer}>
                        <TouchableOpacity style={styles.bgWhite} onPress={handleClose}>
                            <Image source={ArrowLeftIcon} style={styles.arrowLeftIcon} alt="image" contentFit="contain" />
                        </TouchableOpacity>

                        <Text style={styles.headerText}>Checkout</Text>
                        <View style={styles.bgWhite}></View>
                    </View>

                    {/* Status bar */}
                    <View style={styles.statusContainer}>
                        <View style={styles.statusPointCover}>
                            <Animated.View style={getPointStyle(0)}></Animated.View>
                            <View style={styles.progressPathCover}>
                                <View style={styles.progressPath0}></View>
                                <Animated.View style={[styles.progressPath, { width: progressPathWidth1 }]}></Animated.View>
                            </View>
                            <Animated.View
                                style={[
                                    getPointStyle(1),
                                    isPaymentMethodActivate && currentStep !== 1 ? styles.pointStepOne : null,
                                ]}
                            ></Animated.View>
                            <View style={styles.progressPathCover}>
                                <View style={styles.progressPath0}></View>
                                <Animated.View style={[styles.progressPath, { width: progressPathWidth2 }]}></Animated.View>
                            </View>
                            <Animated.View style={getPointStyle(2)}></Animated.View>
                        </View>
                        <View style={styles.statusTextCover}>
                            <Text style={styles.statusText}>Customer Info</Text>
                            <Text style={styles.statusText}>Payment</Text>
                            <Text style={styles.statusText}>Confirmation</Text>
                        </View>
                    </View>

                    <View style={styles.separator} />

                    {/* Main Section */}
                    <View style={styles.mainContainer}>
                        {currentStep === 0 && <PersonalInfo onActivateChange={setIsPersonalInfoActivate} />}
                        {currentStep === 1 && (
                            <PaymentMethod onActivateChange={setIsPaymentMethodActivate} setPaymentMethod={setPaymentMethod} />
                        )}
                        {currentStep === 2 && (
                            <CheckoutConfirmation paymentMethod={paymentMethod} setCurrentStep={setCurrentStep} />
                        )}
                    </View>

                    {/* Next button */}
                    <View style={styles.buttonContainer}>
                        {canOrder && currentStep === 2 ? (
                            <TouchableOpacity
                                onPress={() => handlePlaceOrder()}
                                style={styles.nextButton}
                                accessibilityLabel="Place order"
                                accessibilityRole="button"
                            >
                                <Text style={styles.nextButtonText}>
                                    {isLoading ? <LoadingLight /> : 'Place order'}
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={() => handleNextButton()}
                                style={[
                                    (currentStep === 0 && isPersonalInfoActivate) ||
                                        (currentStep === 1 && (isPaymentMethodActivate || paymentMethod === 'applePay' || paymentMethod === 'googlePay'))
                                        ? styles.nextButton
                                        : styles.disabledButton,
                                ]}
                                disabled={
                                    !(
                                        (currentStep === 0 && isPersonalInfoActivate) ||
                                        (currentStep === 1 && (isPaymentMethodActivate || paymentMethod === 'applePay' || paymentMethod === 'googlePay'))
                                    )
                                }
                                accessibilityLabel="Next"
                                accessibilityRole="button"
                            >
                                <Text
                                    style={[
                                        (currentStep === 0 && isPersonalInfoActivate) ||
                                            (currentStep === 1 && (isPaymentMethodActivate || paymentMethod === 'applePay' || paymentMethod === 'googlePay'))
                                            ? styles.nextButtonText
                                            : styles.disabledButtonText,
                                    ]}
                                >
                                    Next
                                </Text>
                            </TouchableOpacity>

                        )}
                    </View>
                </SafeAreaView>
            )}
            {/* Modal for confirmation */}
            {modalVisible && (
                <ConfirmModal
                    question="Would you like to cancel your order?"
                    modalVisible={modalVisible}
                    setModalVisible={setModalVisible}
                />
            )}
        </>
    )
};

export default DeliveryAndPaymentInfoScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#fff',
        color: Colors.light.text,
        zIndex: 1,
    },
    headerContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerText: {
        fontSize: 22,
        fontFamily: '500',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    bgWhite: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowLeftIcon: {
        width: 14,
        height: 14,
    },
    statusContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 10,
    },
    statusPointCover: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        marginBottom: 2,
    },
    pointOn: {
        width: 15,
        height: 15,
        borderRadius: 50,
        borderWidth: 2,
        shadowColor: "#42F2C0",
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.9,
        borderColor: "#42F2C0",
        backgroundColor: "#42F2C0",
        zIndex: 201,
    },
    pointOff: {
        width: 15,
        height: 15,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: Colors.light.tint,
        backgroundColor: Colors.light.tint,
    },
    pointDone: {
        width: 15,
        height: 15,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: Colors.light.primary,
        backgroundColor: Colors.light.primary,
    },
    pointStepOne: {
        width: 15,
        height: 15,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: Colors.light.primary,
        backgroundColor: Colors.light.primary,
        zIndex: 101,
    },
    progressPathCover: {
        position: 'relative',
        width: 100,
        height: 2,
    },
    progressPath: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: 2,
        backgroundColor: Colors.light.primary,
        zIndex: 100,
    },
    progressPath0: {
        width: 100,
        height: 2,
        backgroundColor: Colors.light.tint,
        zIndex: 99,
    },
    progress1Path100: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: 2,
        backgroundColor: Colors.light.primary,
        zIndex: 100,
    },
    progress2Path100: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: 2,
        backgroundColor: Colors.light.primary,
        zIndex: 100,
    },
    statusTextCover: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    statusText: {
        fontSize: 12,
        fontFamily: '400',
        color: Colors.light.secondary,
    },
    separator: {
        marginVertical: 10,
        height: 1,
        width: '90%',
        backgroundColor: '#E2EAF0',
    },
    mainContainer: {
        width: '100%',
        height: 550,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    buttonContainer: {
        width: '100%',
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nextButton: {
        width: 360,
        height: 70,
        marginTop: 8,
        paddingVertical: 20,
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.primary,
        borderRadius: 10,
    },
    nextButtonText: {
        fontSize: 20,
        fontFamily: '400',
        color: Colors.light.background,
        textAlign: 'center',
    },
    disabledButton: {
        width: 360,
        height: 70,
        marginTop: 8,
        paddingVertical: 20,
        paddingHorizontal: 10,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.GRAY,
    },
    disabledButtonText: {
        fontSize: 20,
        fontFamily: '400',
        textAlign: 'center',
        color: Colors.light.text,
    },
});