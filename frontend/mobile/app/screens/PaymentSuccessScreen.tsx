import React, { FC, useState, useEffect, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, SafeAreaView, Modal } from 'react-native';
import { Image } from 'expo-image';
import { View, Text } from '@/components/Themed';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '@/utils/navi-props';
import * as SecureStore from 'expo-secure-store';
import { Profile, CartItem } from '@/utils/index';
import { Colors } from '../../constants/colors';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { OrderItem } from '@/utils/index';
import { fetchCartItems } from '../../hooks/useUserDataFetch';
import axiosClient from '@/app/api/axiosClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PaymentSuccessImage from '@/assets/images/pay-success.png';

type Props = {
    isPaymentSuccessScreen: boolean;
}

type Item = {
    image_url: string;
    product_id: string;
    product_name: string;
    price: number;
    quantity: number;
}

interface OrderCreation {
    cartId: string,
    customerId: number,
    orderNumber: string,
    totalPrice: number,
}

const PaymentSuccessScreen: FC<Props> = ({ isPaymentSuccessScreen }) => {
    const navigation = useNavigation<NavigationProps>();
    const queryClient = useQueryClient();
    const [customerId, setCustomerId] = useState<number>(0);
    const [orderNumber, setOrderNumber] = useState<string>('');
    const [fullName, setFullName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [address, setAddress] = useState<string>('');
    const [items, setItems] = useState<Item[]>([]);
    const [subTotalPrice, setSubTotalPrice] = useState<number>(0);
    const [shippingFee, setShippingFee] = useState<number>(0);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [emailSent, setEmailSent] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState(false);
    const { data: authUser, isLoading } = useQuery<Profile>({ queryKey: ['authUser'] });

    const { data: cartItemsData } = useQuery({
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
                    if (authUser) {
                        setCustomerId(authUser.id);
                    }
                    setFullName(parsedCustomerInfo.fullName || '');
                    setEmail(parsedCustomerInfo.email || '');
                    setPhone(parsedCustomerInfo.phone || '');
                    setAddress(parsedCustomerInfo.address || '');
                }

                if (cartItemsData?.items) {
                    const allItems = cartItemsData.items.map((item: any) => ({
                        image_url: `https://datawithimages.s3.ap-southeast-2.amazonaws.com/images/${item.productId}.jpg`,
                        product_id: item.productId,
                        product_name: item.productName,
                        price: item.priceAtPurchase,
                        quantity: item.quantity,
                    }));

                    const subtotalCost = cartItemsData?.items.reduce((sum: number, item: CartItem) => sum + item.priceAtPurchase * item.quantity, 0) || 0;
                    const roundedSubtotalCost = Math.round(subtotalCost * 100) / 100;
                    const finalSubtotalCost = Number(roundedSubtotalCost.toFixed(2));

                    const shippingFee = finalSubtotalCost >= 20.00 ? 0.00 : 5.00;
                    const finalShippingFee = Number(shippingFee.toFixed(2));

                    const totalCost = roundedSubtotalCost + shippingFee;
                    const finalTotalCost = Number(totalCost.toFixed(2));

                    setItems(allItems);
                    setSubTotalPrice(finalSubtotalCost);
                    setShippingFee(finalShippingFee);
                    setTotalPrice(finalTotalCost);
                }
            } catch (error) {
                console.error('Failed to retrieve checkout data securely:', error);
            }
        };

        fetchCheckoutData();
        orderNumberGenerator();
    }, [cartItemsData]);

    const sendEmailAndCreateOrder = useCallback(async () => {
        if (isPaymentSuccessScreen && !emailSent && fullName && email && address && orderNumber && items.length > 0 && subTotalPrice > 0 && totalPrice > 0) {
            try {
                const imageUrls = items.map(item => item.image_url);
                // Send payment success email
                await axiosClient.post('/payment-success', {
                    username: fullName,
                    email,
                    address,
                    items,
                    orderNumber,
                    subtotalPrice: subTotalPrice,
                    shippingFee,
                    totalPrice,
                    imageUrls
                });
                console.log('Email sent successfully:');
                setEmailSent(true);

                // Create order history
                if (authUser && cartItemsData) {
                    const orderData: OrderCreation = {
                        customerId: authUser.id,
                        cartId: cartItemsData.cart_id,
                        orderNumber,
                        totalPrice
                    };

                    createOrderHistoryMutation({ data: orderData });
                } else {
                    await AsyncStorage.removeItem('cart_id');
                    await AsyncStorage.removeItem('checkoutData');
                    await SecureStore.deleteItemAsync('customerInfo');
                    await SecureStore.deleteItemAsync('paymentInfo');
                    clearCartItems();
                    console.log('data deleted successfully')
                    setIsSuccess(true)
                }
            } catch (error) {
                console.error('Failed to process order and send email:', error);
            }
        } else {
            console.error('Email not sent: Required data is missing.');
        }
    }, [authUser, emailSent, fullName, email, address, orderNumber, items, subTotalPrice, shippingFee, totalPrice]);

    const { mutate: createOrderHistoryMutation } = useMutation({
        mutationFn: async ({ data }: { data: OrderCreation }) => {
            try {
                const token = await AsyncStorage.getItem('authToken');
                const res = await axiosClient.post('/orders/create', data, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    withCredentials: true,
                });

                const newOrder = res.data;
                await AsyncStorage.removeItem('cart_id');
                await AsyncStorage.removeItem('checkoutData');
                await SecureStore.deleteItemAsync('customerInfo');
                await SecureStore.deleteItemAsync('paymentInfo');

                return newOrder;
            } catch (error) {
                throw new Error('Failed to record order history');
            }
        }
        , onSuccess: (newOrder) => {
            queryClient.invalidateQueries({ queryKey: ['cartItems'] });
            queryClient.refetchQueries({ queryKey: ['cartItems'] });
            queryClient.setQueryData(['orderData'], (oldData: any) => {
                if (oldData) {
                    return [...oldData, newOrder];
                } else {
                    return [newOrder];
                }
            });
            queryClient.invalidateQueries({ queryKey: ['orderData'] });

            console.log('data deleted successfully')
            setIsSuccess(true)
        }, onError: (error) => {
            console.error('Order history recording failed:', error);
        }
    });

    const clearCartItems = async () => {
        await queryClient.invalidateQueries({ queryKey: ['cartItems'] });
        await queryClient.refetchQueries({ queryKey: ['cartItems'] });
    };

    const handleSubscribe = async () => {
        try {
            const customerInfo = await SecureStore.getItemAsync('customerInfo');
            if (customerInfo) {
                const parsedCustomerInfo = JSON.parse(customerInfo);

                const res = await axiosClient.post('/customers/create', {
                    fullName: parsedCustomerInfo.fullName,
                    email: parsedCustomerInfo.email,
                    phone: parsedCustomerInfo.phone,
                    address: parsedCustomerInfo.address,
                });

                const token = res.data.token;
                await AsyncStorage.setItem('authToken', token);

                const orderItems: OrderItem[] = items.map((item, index) => ({
                    id: index + 1,
                    orderId: 0,
                    productId: item.product_id,
                    productName: item.product_name,
                    quantity: item.quantity,
                    priceAtPurchase: item.price,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }));

                const orderData: OrderCreation = {
                    customerId: parsedCustomerInfo.id,
                    cartId: cartItemsData.cart_id,
                    orderNumber: orderNumber,
                    totalPrice: totalPrice,
                };

                createOrderHistoryMutation({ data: orderData });
            }
        } catch (error) {
            console.error('Subscription failed:', error);
        }
    };

    const orderNumberGenerator = () => {
        const randomNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        setOrderNumber(randomNumber);
    }

    const handleButton = () => {
        navigation.navigate('cart');
    }

    const closeModalAndNavigate = () => {
        setModalVisible(false);
        navigation.navigate('cart');
    }

    useEffect(() => {
        if (isPaymentSuccessScreen && !emailSent) {
            sendEmailAndCreateOrder();
        }
    }, [isPaymentSuccessScreen, emailSent, sendEmailAndCreateOrder]);

    useEffect(() => {
        if (isSuccess) {
            navigation.navigate('cart');
        }
    }, [isSuccess, navigation]);

    return (
        <SafeAreaView style={styles.container}>
            {/* Success image and message */}
            <View style={styles.mainSection}>
                <Image source={PaymentSuccessImage} alt='image' style={styles.mainImage} contentFit='contain' />
                <Text style={styles.mainText}>Thank you!</Text>
                <Text style={styles.mainSubText}>Payment processed successfully</Text>
                <Text style={styles.mainSubText}>We've sent an email, please review your inbox or junk mail</Text>
            </View>

            <View style={styles.separator} />

            {/* Subscribe button */}
            {!authUser && (
                <>
                    <View style={styles.promptCover}>
                        <Text style={styles.promptText}>Not a member yet? Make your next order easier!
                        </Text>
                    </View>
                    <TouchableOpacity style={[styles.ButtonCover, { backgroundColor: Colors.light.primary, }]} onPress={handleSubscribe}>
                        <Text style={styles.buttonText}>Subscribe</Text>
                    </TouchableOpacity>
                </>
            )}

            {/* Redirect button */}
            <TouchableOpacity
                style={[
                    styles.ButtonCover,
                    {
                        backgroundColor: authUser ? Colors.light.primary : Colors.GRAY,
                        marginTop: 20,
                    },
                ]}
                onPress={handleButton}
            >
                <Text style={styles.buttonText}>Go to Camera</Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModalAndNavigate}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>Thank you for subscribing with us!</Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={closeModalAndNavigate}
                        >
                            <Text style={styles.modalButtonText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

export default PaymentSuccessScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.light.background,
    },
    mainSection: {
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        width: '75%',
    },
    mainImage: {
        width: 200,
        height: 200,
    },
    mainText: {
        fontSize: 40,
        fontFamily: '700',
        color: Colors.light.primary,
        textAlign: 'center',
        marginBottom: 10,
    },
    mainSubText: {
        fontSize: 20,
        fontFamily: '400',
        color: Colors.light.primary,
        textAlign: 'center',
    },
    separator: {
        marginVertical: 20,
        height: 1,
        width: '80%',
        paddingHorizontal: 15,
        backgroundColor: '#E2EAF0',
    },
    promptCover: {
        width: '80%',
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    promptText: {
        fontSize: 16,
        fontFamily: '400',
        textAlign: 'center',
    },
    ButtonCover: {
        width: '80%',
        height: 70,
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 20,
        fontFamily: '400',
        textAlign: 'center',
        color: Colors.light.background,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalText: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
        color: Colors.light.text,
    },
    modalButton: {
        backgroundColor: Colors.light.primary,
        padding: 10,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
    },
});