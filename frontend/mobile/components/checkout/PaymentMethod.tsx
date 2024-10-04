import React, { FC, useState, useEffect } from 'react';
import { TextInput, StyleSheet, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { View, Text } from '@/components/Themed';
import Animated, { SlideInRight } from 'react-native-reanimated';
import * as SecureStore from 'expo-secure-store';
import RNPickerSelect from 'react-native-picker-select';
import { Colors } from '../../constants/colors';
import { useQuery } from '@tanstack/react-query';
import ApplePayIcon from '@/assets/images/applepay.png';
import ApplePay2Icon from '@/assets/images/applepay2.png';
import GooglePayIcon from '@/assets/images/googlepay.png';
import GooglePay2Icon from '@/assets/images/googlepay2.png';
import CreditCardIcon from '@/assets/images/creditcard.png';
import CreditCard2Icon from '@/assets/images/creditcard2.png';
import Loading from '../loading/Loading';

type Props = {
    onActivateChange: (isActivate: boolean) => void;
    setPaymentMethod: (paymentMethod: string) => void;
};

type ErrorKeys = 'cardHolder' | 'cardNumber' | 'expirationMonth' | 'expirationYear' | 'CVV';

const PaymentMethod: FC<Props> = ({ onActivateChange, setPaymentMethod }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [cardCompany, setCardCompany] = useState<string>('');
    const [selectedPayment, setSelectedPayment] = useState<string>('creditCard'); // State for selected payment method
    const [cardHolder, setCardHolder] = useState<string>('');
    const [cardNumber, setCardNumber] = useState<string>('');
    const [expirationMonth, setExpirationMonth] = useState<string>('');
    const [expirationYear, setExpirationYear] = useState<string>('');
    const [CVV, setCVV] = useState<string>('');
    const [focusedInput, setFocusedInput] = useState<string | null>(null);
    const [checkoutData, setCheckoutData] = useState<any>(null);

    const [errors, setErrors] = useState({
        cardHolder: '',
        cardNumber: '',
        expirationMonth: '',
        expirationYear: '',
        CVV: '',
    });

    const savePaymentInfo = async (paymentInfo: any) => {
        try {
            await SecureStore.setItemAsync('paymentInfo', JSON.stringify(paymentInfo));
        } catch (error) {
            console.error('Failed to save payment info securely:', error);
        }
    };

    const fetchPaymentInfo = async () => {
        try {
            const paymentInfo = await SecureStore.getItemAsync('paymentInfo');
            if (paymentInfo) {
                return JSON.parse(paymentInfo);
            }
        } catch (error) {
            console.error('Failed to retrieve payment info securely:', error);
        }
        return null;
    };

    const fetchCheckoutData = async () => {
        try {
            const paymentInfo = await fetchPaymentInfo();
            if (paymentInfo) {
                setCardCompany(paymentInfo.cardCompany || '');
                setCardHolder(paymentInfo.cardHolder || '');
                setCardNumber(paymentInfo.cardNumber || '');
                setExpirationMonth(paymentInfo.expirationMonth || '');
                setExpirationYear(paymentInfo.expirationYear || '');
                setCVV(paymentInfo.CVV || '');
                setCheckoutData(paymentInfo);

                if (paymentInfo.cardCompany && paymentInfo.cardHolder && paymentInfo.cardNumber && paymentInfo.expirationMonth && paymentInfo.expirationYear && paymentInfo.CVV) {
                    onActivateChange(true);
                } else {
                    onActivateChange(false);
                }
            }
        } catch (error) {
            console.error('Failed to retrieve payment info securely:', error);
        }
    };

    useEffect(() => {
        const fetchCheckoutData = async () => {
            try {
                const paymentInfo = await fetchPaymentInfo();
                if (paymentInfo) {
                    setCardCompany(paymentInfo.cardCompany || '');
                    setCardHolder(paymentInfo.cardHolder || '');
                    setCardNumber(paymentInfo.cardNumber || '');
                    setExpirationMonth(paymentInfo.expirationMonth || '');
                    setExpirationYear(paymentInfo.expirationYear || '');
                    setCVV(paymentInfo.CVV || '');
                    setCheckoutData(paymentInfo);

                    if (paymentInfo.cardCompany && paymentInfo.cardHolder && paymentInfo.cardNumber && paymentInfo.expirationMonth && paymentInfo.expirationYear && paymentInfo.CVV) {
                        onActivateChange(true);
                    } else {
                        onActivateChange(false);
                    }
                }
            } catch (error) {
                console.error('Failed to retrieve payment info securely:', error);
            }
        };

        fetchCheckoutData();
    }, []);

    useEffect(() => {
        setCardCompany(getCardCompany(cardNumber));
        if (selectedPayment === 'creditCard') {
            const isValid = cardCompany && cardHolder && cardNumber && expirationMonth && expirationYear && CVV;

            if (isValid) {
                const paymentInfo = {
                    cardCompany,
                    cardHolder,
                    cardNumber,
                    expirationMonth,
                    expirationYear,
                    CVV,
                };
                savePaymentInfo(paymentInfo);
            }
        } else {
            onActivateChange(true);
        }
    }, [cardCompany, cardHolder, cardNumber, expirationMonth, expirationYear, CVV]);


    const getCardCompany = (cardNumber: string) => {
        const cleanNumber = cardNumber.replace(/\s/g, '');

        if (/^4/.test(cleanNumber)) {
            return 'Visa';
        } else if (/^5[1-5]/.test(cleanNumber)) {
            return 'MasterCard';
        } else if (/^3[47]/.test(cleanNumber)) {
            return 'American Express';
        } else if (/^6(?:011|5)/.test(cleanNumber)) {
            return 'Discover';
        } else if (/^3(?:0[0-5]|[68])/.test(cleanNumber)) {
            return 'Diners Club';
        } else if (/^35/.test(cleanNumber)) {
            return 'JCB';
        } else if (/^62/.test(cleanNumber)) {
            return 'UnionPay';
        } else {
            return 'Visa'; // Should be changed later
        }
    };

    const handleCardNumberChange = (input: string) => {
        const digitsOnly = input.replace(/\D/g, '');
        const limitedDigits = digitsOnly.slice(0, 16);
        const formattedInput = limitedDigits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();

        setCardNumber(formattedInput);
    };

    const handleFocus = (input: string) => {
        setFocusedInput(input);
    };

    const handleBlur = () => {
        setFocusedInput(null);
        validateInputs();
    };

    const validateInputs = () => {
        let valid = true;
        let newErrors: Record<ErrorKeys, string> = { cardHolder: '', cardNumber: '', expirationMonth: '', expirationYear: '', CVV: '' };

        if (!cardHolder.trim()) {
            newErrors.cardHolder = 'Cardholder name is required';
            valid = false;
        }

        if (!/^\d{4} \d{4} \d{4} \d{4}$/.test(cardNumber)) {
            newErrors.cardNumber = 'Credit card number must be 16 digits';
            valid = false;
        }

        if (!expirationMonth.trim()) {
            newErrors.expirationMonth = 'Expiration month is required';
            valid = false;
        }

        if (!expirationYear.trim()) {
            newErrors.expirationYear = 'Expiration year is required';
            valid = false;
        }

        if (!/^\d{3,4}$/.test(CVV)) {
            newErrors.CVV = 'CVV must be 3 or 4 digits';
            valid = false;
        }

        setErrors(newErrors);
        onActivateChange(valid);
    };

    const getPaymentIcon = (method: string) => {
        switch (method) {
            case 'applePay':
                return selectedPayment === 'applePay' ? ApplePayIcon : ApplePay2Icon;
            case 'googlePay':
                return selectedPayment === 'googlePay' ? GooglePayIcon : GooglePay2Icon;
            case 'creditCard':
            default:
                return selectedPayment === 'creditCard' ? CreditCardIcon : CreditCard2Icon;
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

    const handlePaymentSelection = async (method: string) => {
        setPaymentMethod(method);
        setSelectedPayment(method)

        await fetchCheckoutData();
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <TouchableWithoutFeedback onPress={handlePressOutside}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === "ios" ? 280 : 0}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
                    <Animated.View exiting={SlideInRight} style={styles.innerContainer}>
                        {/* Payment Method Selection */}
                        <View style={styles.cardsContainer}>
                            <TouchableOpacity onPress={() => handlePaymentSelection('creditCard')} style={styles.paymentOption}>
                                <Image source={getPaymentIcon('creditCard')} alt='Credit Card' style={styles.paymentIcon} contentFit='contain' />
                            </TouchableOpacity>
                            <View style={styles.separator} />
                            <TouchableOpacity onPress={() => handlePaymentSelection('applePay')} style={styles.paymentOption}>
                                <Image source={getPaymentIcon('applePay')} alt='Apple Pay' style={styles.paymentIcon} contentFit='contain' />
                            </TouchableOpacity>
                            <View style={styles.separator} />
                            <TouchableOpacity onPress={() => handlePaymentSelection('googlePay')} style={styles.paymentOption}>
                                <Image source={getPaymentIcon('googlePay')} alt='Google Pay' style={styles.paymentIcon} contentFit='contain' />
                            </TouchableOpacity>
                        </View>

                        {/* Card information section (only visible if 'creditCard' is selected) */}
                        {selectedPayment === 'applePay' && (
                            <Animated.View exiting={SlideInRight} style={styles.innerContainer}>
                                <View style={styles.paymentContainer}>
                                    <Image source={ApplePayIcon} alt='Apple Pay' style={styles.paymentImage} contentFit='contain' />
                                    <Text style={styles.paymentText}>Please go to the next step</Text>
                                </View>
                            </Animated.View>
                        )}
                        {selectedPayment === 'googlePay' && (
                            <Animated.View exiting={SlideInRight} style={styles.innerContainer}>
                                <View style={styles.paymentContainer}>
                                    <Image source={GooglePayIcon} alt='Google Pay' style={styles.paymentImage} contentFit='contain' />
                                    <Text style={styles.paymentText}>Please go to the next step</Text>
                                </View>
                            </Animated.View>
                        )}
                        {selectedPayment === 'creditCard' && (
                            <>
                                <View style={styles.labelContainer}>
                                    <Text style={getLabelStyle('cardHolder')}>Cardholder Name *</Text>
                                </View>
                                <TextInput
                                    style={[
                                        styles.input,
                                        focusedInput === 'cardHolder' && styles.focusedInput,
                                        errors.cardHolder ? styles.errorInput : null
                                    ]}
                                    value={cardHolder}
                                    onChangeText={setCardHolder}
                                    placeholder='Cardholder Name'
                                    onFocus={() => handleFocus('cardHolder')}
                                    onBlur={handleBlur}
                                />
                                {errors.cardHolder ? <Text style={styles.errorText}>{errors.cardHolder}</Text> : null}

                                <View style={styles.labelContainer}>
                                    <Text style={getLabelStyle('cardNumber')}>Credit Card Number *</Text>
                                </View>
                                <TextInput
                                    style={[
                                        styles.input,
                                        focusedInput === 'cardNumber' && styles.focusedInput,
                                        errors.cardNumber ? styles.errorInput : null
                                    ]}
                                    value={cardNumber}
                                    onChangeText={handleCardNumberChange}
                                    placeholder='1234 5678 9012 3456'
                                    keyboardType='number-pad'
                                    onFocus={() => handleFocus('cardNumber')}
                                    onBlur={handleBlur}
                                    maxLength={19}
                                />
                                {errors.cardNumber ? <Text style={styles.errorText}>{errors.cardNumber}</Text> : null}

                                {/* Expiration Date and CVV Row */}
                                <View style={styles.expirationCVVContainer}>
                                    <View style={styles.expirationContainer}>
                                        <View style={styles.labelContainer}>
                                            <Text style={getLabelStyle('expirationYear')}>Expiration Date *</Text>
                                        </View>
                                        <View style={styles.dateContainer}>
                                            <View style={styles.pickerContainer}>
                                                <RNPickerSelect
                                                    onValueChange={(value) => setExpirationMonth(value)}
                                                    items={[
                                                        { label: '01', value: '01' },
                                                        { label: '02', value: '02' },
                                                        { label: '03', value: '03' },
                                                        { label: '04', value: '04' },
                                                        { label: '05', value: '05' },
                                                        { label: '06', value: '06' },
                                                        { label: '07', value: '07' },
                                                        { label: '08', value: '08' },
                                                        { label: '09', value: '09' },
                                                        { label: '10', value: '10' },
                                                        { label: '11', value: '11' },
                                                        { label: '12', value: '12' },
                                                    ]}
                                                    style={{
                                                        ...pickerSelectStyles,
                                                        inputIOS: [pickerSelectStyles.inputIOS, errors.expirationMonth ? pickerSelectStyles.inputError : {}],
                                                        inputAndroid: [pickerSelectStyles.inputAndroid, errors.expirationMonth ? pickerSelectStyles.inputError : {}],
                                                    }}
                                                    placeholder={{ label: 'Month', value: '' }}
                                                    value={expirationMonth}
                                                />
                                            </View>
                                            <View style={styles.slashSeparator} />
                                            <View style={styles.pickerContainer}>
                                                <RNPickerSelect
                                                    onValueChange={(value) => setExpirationYear(value)}
                                                    items={[
                                                        { label: '2024', value: '2024' },
                                                        { label: '2025', value: '2025' },
                                                        { label: '2026', value: '2026' },
                                                        { label: '2027', value: '2027' },
                                                        { label: '2028', value: '2028' },
                                                        { label: '2029', value: '2029' },
                                                        { label: '2030', value: '2030' },
                                                        { label: '2031', value: '2031' },
                                                        { label: '2032', value: '2032' },
                                                        { label: '2033', value: '2033' },
                                                        { label: '2034', value: '2034' },
                                                        { label: '2035', value: '2035' },
                                                        { label: '2036', value: '2036' },
                                                    ]}
                                                    style={{
                                                        ...pickerSelectStyles,
                                                        inputIOS: [pickerSelectStyles.inputIOS, errors.expirationYear ? pickerSelectStyles.inputError : {}],
                                                        inputAndroid: [pickerSelectStyles.inputAndroid, errors.expirationYear ? pickerSelectStyles.inputError : {}],
                                                    }}
                                                    placeholder={{ label: 'Year', value: '' }}
                                                    value={expirationYear}
                                                />
                                            </View>
                                        </View>
                                        {errors.expirationMonth && !errors.expirationYear ? <Text style={styles.errorText}>{errors.expirationMonth}</Text> : null}
                                        {errors.expirationYear && !errors.expirationMonth ? <Text style={styles.errorText}>{errors.expirationYear}</Text> : null}
                                        {errors.expirationMonth && errors.expirationYear ? <Text style={styles.errorText}>{errors.expirationMonth}, {errors.expirationYear}</Text> : null}
                                    </View>

                                    {/* CVV section */}
                                    <View style={styles.cvvContainer}>
                                        <View style={styles.labelContainer}>
                                            <Text style={getLabelStyle('CVV')}>CVV *</Text>
                                        </View>
                                        <TextInput
                                            style={[
                                                styles.input,
                                                focusedInput === 'CVV' && styles.focusedInput,
                                                errors.CVV ? styles.errorInput : null
                                            ]}
                                            value={CVV}
                                            onChangeText={setCVV}
                                            placeholder='CVV'
                                            keyboardType='number-pad'
                                            onFocus={() => handleFocus('CVV')}
                                            onBlur={handleBlur}
                                            maxLength={4}
                                        />
                                        {errors.CVV ? <Text style={styles.errorText}>{errors.CVV}</Text> : null}
                                    </View>
                                </View>
                            </>
                        )}
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

export default PaymentMethod;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'stretch',
    },
    innerContainer: {
        width: 360,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    paymentContainer: {
        width: '100%',
        height: 300,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
    },
    paymentImage: {
        width: 100,
        height: 100,
    },
    paymentText: {
        fontSize: 20,
        fontFamily: '300',
        color: Colors.light.primary,
    },
    cardsContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        marginTop: 30,
        marginBottom: 5,
    },
    paymentOption: {
        width: 'auto',
        borderColor: '#E2EAF0',
        shadowColor: '#757575',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    paymentIcon: {
        width: 50,
        height: 50,
    },
    separator: {
        width: 0.5,
        height: 30,
        borderRadius: 5,
        backgroundColor: '#757575',
        marginHorizontal: 10,
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
        width: 20,
        height: 20,
        marginRight: 10,
        backgroundColor: 'transparent',
    },
    icon: {
        width: '100%',
        height: '100%',
    },
    label: {
        fontSize: 18,
        fontFamily: '300',
        color: Colors.light.primary,
        backgroundColor: '#fff',
    },
    labelDisAble: {
        fontSize: 18,
        fontFamily: '300',
        color: "#757575",
        backgroundColor: '#fff',
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
    expirationCVVContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
        height: 200,
    },
    expirationContainer: {
        width: 240,
        height: 150,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        paddingLeft: 3,
    },
    pickerContainer: {
        width: 100,
        height: 60,
        marginRight: 10,
    },
    cvvContainer: {
        width: 100,
        height: 150,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    slashSeparator: {
        width: 1,
        height: 30,
        borderRadius: 5,
        backgroundColor: '#757575',
        transform: [{ rotate: '15deg' }],
        marginRight: 10,
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        width: 100,
        height: 60,
        fontSize: 18,
        fontFamily: '300',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1 / 3,
        borderColor: '#CFCFCF',
        borderRadius: 8,
        color: '#002020',
        paddingRight: 30,
        backgroundColor: '#E2EAF0',
    },
    inputAndroid: {
        width: 100,
        height: 60,
        fontSize: 18,
        fontFamily: '300',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderWidth: 0.5,
        borderColor: '#CFCFCF',
        borderRadius: 8,
        color: '#002020',
        paddingRight: 30,
        backgroundColor: '#E2EAF0',
    },
    inputError: {
        borderWidth: 1,
        borderColor: Colors.light.error,
    },
});