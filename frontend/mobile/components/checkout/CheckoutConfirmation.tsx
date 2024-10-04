import React, { FC, useState, useEffect } from 'react';
import { StyleSheet, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, Animated, TouchableOpacity, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { View, Text } from '@/components/Themed';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '@/utils/navi-props';
import { Colors } from '../../constants/colors';
import * as SecureStore from 'expo-secure-store';
import Loading from '../loading/Loading';
import ArrowDownIcon from '@/assets/images/arrow-down.png';
import { useQuery } from '@tanstack/react-query';
import { fetchCartItems } from '../../hooks/useUserDataFetch';
import ConfirmModal from '../../components/modals/ConfirmModal';
import ApplePayIcon from '@/assets/images/applepay.png';
import GooglePayIcon from '@/assets/images/googlepay.png';
import VisaIcon from '@/assets/images/visa.png';
import MasterCardIcon from '@/assets/images/mastercard.png';
import AmexIcon from '@/assets/images/amex.png';
import DiscoverIcon from '@/assets/images/discover.png';
import DinersClubIcon from '@/assets/images/dinersclub.png';
import JCBIcon from '@/assets/images/jcb.png';
import UnionPayIcon from '@/assets/images/unionpay.png';
import CreditCardIcon from '@/assets/images/creditcard.png';


type Props = {
    paymentMethod: string;
    setCurrentStep: (step: number) => void;
};

interface CartItem {
    productId: string;
    productName: string;
    brandName: string;
    genericName: string;
    quantity: number;
    priceAtPurchase: number;
}

const CheckoutConfirmation: FC<Props> = ({ paymentMethod, setCurrentStep }) => {
    const navigation = useNavigation<NavigationProps>();
    const [cardCompany, setCardCompany] = useState<string>('creditCard');
    const [cardNumber, setCardNumber] = useState<string>('');
    const [fullName, setFullName] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [address, setAddress] = useState<string>('');
    const [showProductList, setShowProductList] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState(false);
    const arrowRotation = useState(new Animated.Value(0))[0];

    const { data: cartItemsData, isLoading } = useQuery({
        queryKey: ['cartItems'],
        queryFn: fetchCartItems,
        retry: false,
        refetchOnWindowFocus: true,
    });

    useEffect(() => {
        const fetchCheckoutData = async () => {
            try {
                const customerInfo = await SecureStore.getItemAsync('customerInfo');
                if (customerInfo) {
                    const parsedCustomerInfo = JSON.parse(customerInfo);
                    setFullName(parsedCustomerInfo.fullName || '');
                    setPhone(parsedCustomerInfo.phone || '');
                    setEmail(parsedCustomerInfo.email || '');
                    setAddress(parsedCustomerInfo.address || '');
                }

                const paymentInfo = await SecureStore.getItemAsync('paymentInfo');

                if (paymentInfo) {
                    const parsedPaymentInfo = JSON.parse(paymentInfo);
                    setCardCompany(parsedPaymentInfo.cardCompany || '');
                    setCardNumber(parsedPaymentInfo.cardNumber || '');
                } else {
                    console.error('No payment info found.');
                }
            } catch (error) {
                console.error('Failed to retrieve checkout data securely:', error);
            }
        };

        fetchCheckoutData();
    }, []);

    const getPaymentIcon = (method: string) => {
        if (method === 'applePay') return ApplePayIcon;
        if (method === 'googlePay') return GooglePayIcon;

        if (method === 'creditCard') {
            switch (cardCompany) {
                case 'Visa': return VisaIcon;
                case 'MasterCard': return MasterCardIcon;
                case 'American Express': return AmexIcon;
                case 'Discover': return DiscoverIcon;
                case 'Diners Club': return DinersClubIcon;
                case 'JCB': return JCBIcon;
                case 'UnionPay': return UnionPayIcon;
                default: return CreditCardIcon;
            }
        } else {
            return CreditCardIcon;
        }
    };


    const handlePressOutside = () => {
        Keyboard.dismiss();
    };

    const handleToggleProductList = () => {
        Animated.timing(arrowRotation, {
            toValue: showProductList ? 0 : 1,
            duration: 100,
            useNativeDriver: true,
        }).start();

        setShowProductList((prevState) => !prevState);
    };

    const handleEdit = (step: number) => {
        if (step === 0) { setCurrentStep(step); }
        if (step === 1) { setCurrentStep(step); }
    };

    const handleCancel = () => {
        setModalVisible(true);
    };

    if (isLoading) {
        return <Loading />;
    }

    const subtotalCost = cartItemsData?.items.reduce((sum: number, item: CartItem) => sum + item.priceAtPurchase * item.quantity, 0) || 0;
    const roundedTotal = Math.round(subtotalCost * 100) / 100;
    const shippingFee = roundedTotal >= 70.00 ? 0 : 5;
    const totalCost = subtotalCost + shippingFee

    const arrowRotate = arrowRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const truncateText = (text: string | undefined, maxLength: number) => {
        if (text && text.length > maxLength) {
            return `${text.slice(0, maxLength)}...`;
        }
        return text;
    };

    return (
        <TouchableWithoutFeedback onPress={handlePressOutside}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === "ios" ? 280 : 0}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    horizontal={false}
                >
                    <>
                        {/* Header */}
                        <View>
                            <View style={styles.cardsContainer}>
                                <View style={styles.paymentOption}>
                                    <Image source={getPaymentIcon(paymentMethod)} alt='Payment Method' style={styles.paymentIcon} contentFit='contain' />
                                </View>
                                <TouchableOpacity onPress={handleCancel} style={styles.ButtonCover}>
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Detail Information */}
                        {paymentMethod && (
                            <>
                                {/* Name and Physical Address */}
                                <View style={styles.labelContainer}>
                                    <Text style={styles.sectionTitle}>BILLING</Text>
                                    <View style={styles.infoText}>
                                        <Text>{fullName}</Text>
                                        <Text>{address}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => handleEdit(0)} style={styles.ButtonCover}>
                                        <Text style={styles.buttonText}>Edit</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.separator} />

                                {/* Card Information */}
                                <View style={styles.labelContainer}>
                                    <Text style={styles.sectionTitle}>PAYMENT</Text>
                                    <View style={styles.infoText}>
                                        <Text>**** **** **** {cardNumber.slice(-4)}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => handleEdit(1)} style={styles.ButtonCover}>
                                        <Text style={styles.buttonText}>Edit</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.separator} />

                                {/* Contact */}
                                <View style={styles.labelContainer}>
                                    <Text style={styles.sectionTitle}>CONTACT</Text>
                                    <View style={styles.infoText}>
                                        <Text>{email}</Text>
                                        <Text>{phone}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => handleEdit(0)} style={styles.ButtonCover}>
                                        <Text style={styles.buttonText}>Edit</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.separator} />

                                {/* Order Summary */}
                                <View style={styles.productListContainer}>
                                    <View style={styles.labelContainer}>
                                        <Text style={styles.sectionTitle}>COST</Text>
                                        <View>
                                            <Text style={styles.totalPriceLabel}>Total</Text>
                                            <Text style={styles.totalPriceValue}>${totalCost.toFixed(2)}</Text>
                                        </View>
                                        {/* Dropdown Order List */}
                                        <TouchableOpacity onPress={handleToggleProductList}>
                                            <Animated.View style={[styles.iconCover, { transform: [{ rotate: arrowRotate }] }]}>
                                                <Image source={ArrowDownIcon} alt='arrowDown' style={styles.arrowIcon} contentFit='contain' />
                                            </Animated.View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                {showProductList && (
                                    <View style={styles.productListContainer}>
                                        {cartItemsData?.items.map((item: any) => (
                                            <View key={item.productId} style={styles.productItem}>
                                                <Text>
                                                    {truncateText(item.productName, 15)}
                                                </Text>
                                                <Text>$ {item.priceAtPurchase.toFixed(2)}</Text>
                                                <Text>× {item.quantity}</Text>
                                                <Text>$ {(item.priceAtPurchase * item.quantity).toFixed(2)}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </>
                        )}
                    </>
                </ScrollView>

                {/* Modal for confirmation */}
                {modalVisible && (
                    <ConfirmModal question="Would you like to cancel your order?" modalVisible={modalVisible} setModalVisible={setModalVisible} />
                )}
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

export default CheckoutConfirmation;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // width: '100%',
        // height: '100%',
        // alignItems: 'center',
        // justifyContent: 'center',
        backgroundColor: Colors.light.background,
    },
    scrollContainer: {
        flex: 1,
        paddingHorizontal: 5,
        marginTop: 10,
        marginHorizontal: 'auto',
    },
    cardsContainer: {
        width: 350,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    paymentOption: {
        paddingVertical: 3,
        paddingHorizontal: 18,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.light.primary,
    },
    separator: {
        marginVertical: 10,
        height: 1,
        width: 350,
        backgroundColor: '#E2EAF0',
    },
    paymentIcon: {
        width: 70,
        height: 70,
    },
    iconCover: {
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 30,
    },
    arrowIcon: {
        width: 15,
        height: 15,
    },
    labelContainer: {
        width: 350,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
        paddingLeft: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.light.primary,
        flex: 1,
    },
    ButtonCover: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.light.tint,
    },
    buttonText: {
        fontSize: 16,
        color: Colors.light.text,
        fontFamily: '400',
    },
    infoText: {
        fontSize: 16,
        color: Colors.light.text,
        fontFamily: '400',
        marginRight: 15,
    },
    totalPriceLabel: {
        fontSize: 16,
        color: Colors.light.text,
        fontFamily: '700',
    },
    totalPriceValue: {
        fontSize: 18,
        color: Colors.light.primary,
        fontFamily: '700',
    },
    productListContainer: {
        width: 350,
        marginTop: 10,
        flexDirection: 'column'
    },
    productItem: {
        width: 350,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
});