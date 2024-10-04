import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Dimensions, Animated, Easing } from 'react-native';
import { Image } from 'expo-image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MinusIcon from '../../assets/images/minus.png';
import PlusIcon from '../../assets/images/plus.png';
import TrashIcon from '../../assets/images/trash.png';
import { Colors } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '@/utils/navi-props';
import { fetchCartItems } from '../../hooks/useUserDataFetch';
import axiosClient from '@/app/api/axiosClient';
import Loading from '@/components/loading/Loading';

const { width } = Dimensions.get('window');

interface CartItem {
    productId: string;
    productName: string;
    brandName: string;
    genericName: string;
    quantity: number;
    priceAtPurchase: number;
    opacity: Animated.Value;
    translateX: Animated.Value;
}

const CartScreen: React.FC = () => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const navigation = useNavigation<NavigationProps>();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [shippingCost, setShippingCost] = useState<number>(0);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [isFetching, setIsFetching] = useState(false);
    const queryClient = useQueryClient();

    const { data: cartItemsData, isLoading } = useQuery({
        queryKey: ['cartItems'],
        queryFn: fetchCartItems,
        retry: false,
        refetchOnWindowFocus: true,
    });

    const { mutate: updateCartItemMutation } = useMutation({
        mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
            const cartId = await AsyncStorage.getItem('cart_id');
            const response = await axiosClient.put('/carts/update',
                { cart_id: cartId, product_id: productId, quantity: quantity }
            );
            return response.data;
        },
        onSuccess: (data, variables) => {
            invalidateCartItems();
        },
        onError: (error) => {
            console.error('Failed to update cart:', error);
        },
    });

    const invalidateCartItems = () => {
        queryClient.invalidateQueries({ queryKey: ['cartItems'] });
    };

    // Price & Quantity calculation
    const increaseQuantity = (index: number, productId: string) => {
        const newQuantity = cartItems[index].quantity + 1;
        const updatedCartItems = [...cartItems];
        updatedCartItems[index].quantity = newQuantity;
        setCartItems(updatedCartItems);
        calculateTotal(updatedCartItems);
        updateCartItemMutation({ productId, quantity: newQuantity });
    };

    const decreaseQuantity = (index: number, productId: string) => {
        if (cartItems[index].quantity > 1) {
            const newQuantity = cartItems[index].quantity - 1;
            const updatedCartItems = [...cartItems];
            updatedCartItems[index].quantity = newQuantity;
            setCartItems(updatedCartItems);
            calculateTotal(updatedCartItems);
            updateCartItemMutation({ productId, quantity: newQuantity });
        }
    };

    const calculateTotal = (items: CartItem[]) => {
        let total = 0;
        let totalQuantity = 0;

        items.forEach(item => {
            total += item.priceAtPurchase * item.quantity;
            totalQuantity += item.quantity;
        });

        setTotalPrice(total);
        setTotalQuantity(totalQuantity);
        const roundedTotal = Math.round(total * 100) / 100;
        const shipping = roundedTotal >= 70.00 ? 0 : 5;
        setShippingCost(shipping);
    };

    const combineDuplicateProducts = (items: CartItem[]) => {
        const combinedItems = items.reduce((acc, item) => {
            const existingItem = acc.find(i => i.productId === item.productId);
            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                acc.push({ ...item });
            }
            return acc;
        }, [] as CartItem[]);
        return combinedItems;
    };


    // Deleting operations
    const deleteItemMutation = useMutation({
        mutationFn: async (productId: string) => {
            const cartId = await AsyncStorage.getItem('cart_id');
            await axiosClient.delete('/carts/remove', {
                data: { cart_id: cartId, product_id: productId },
            });
            return productId;
        },
        onSuccess: (productId) => {
            queryClient.invalidateQueries({ queryKey: ['cartItems'] });

            const updatedItems = cartItems.filter(item => item.productId !== productId);
            setCartItems(updatedItems);
            calculateTotal(updatedItems);
        },
        onError: (error) => {
            console.error('Failed to delete cart item:', error);
        },
    });

    const deleteItem = (index: number, productId: string) => {
        Animated.parallel([
            Animated.timing(cartItems[index].opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(cartItems[index].translateX, {
                toValue: 300,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            const updatedCartItems = [...cartItems];
            updatedCartItems.splice(index, 1);
            setCartItems(updatedCartItems);
            calculateTotal(updatedCartItems);
            deleteItemMutation.mutate(productId);
        });
    };

    const handleDeleteItem = (index: number, productId: string) => {
        Alert.alert(
            'Confirm Deletion',
            'Are you sure you want to delete this item from the cart?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', onPress: () => deleteItem(index, productId) },
            ]
        );
    };

    useEffect(() => {
        setIsFetching(true)
        if (cartItemsData?.items) {
            const combinedItems = combineDuplicateProducts(cartItemsData.items);
            const itemsWithAnimations = combinedItems.map((item: CartItem) => ({
                ...item,
                opacity: new Animated.Value(1),
                translateX: new Animated.Value(0),
            }));
            setCartItems(itemsWithAnimations);
            calculateTotal(itemsWithAnimations);
        }
        setIsFetching(false)
    }, [cartItemsData]);

    // Checkout operation
    const handleCheckout = async () => {
        const checkoutData = {
            customerNumber: await AsyncStorage.getItem('cart_id'),
            cartItems: cartItems.map(item => ({
                productName: item.productName,
                priceAtPurchase: item.priceAtPurchase,
                quantity: item.quantity,

            })),
            totalPrice: totalPrice,
            shippingCost: shippingCost,
            totalCost: totalPrice + shippingCost,
        };

        await AsyncStorage.setItem('checkoutData', JSON.stringify(checkoutData));

        navigation.navigate('screens/DeliveryAndPaymentInfoScreen');
    };

    const truncateText = (text: string | undefined, maxLength: number) => {
        if (text && text.length > maxLength) {
            return `${text.slice(0, maxLength)}...`;
        }
        return text;
    };

    return (
        <View>
            {cartItems.length === 0 && !isLoading ? (
                <Text style={styles.noProductText}>No product in your cart</Text>
            ) : (
                <View style={styles.container}>
                    <ScrollView style={styles.productScrollView}>
                        {isLoading && isFetching ? (
                            <Loading />
                        ) : (
                            cartItems.map((item, index) => (
                                <Animated.View
                                    key={index}
                                    style={[
                                        styles.productWrap,
                                        {
                                            opacity: item.opacity,
                                            transform: [{ translateX: item.translateX }],
                                        },
                                    ]}
                                >
                                    <View style={styles.imageWrap}>
                                        <Image
                                            source={`https://datawithimages.s3.ap-southeast-2.amazonaws.com/images/${item.productId}.jpg`}
                                            style={styles.image}
                                            alt='product'
                                            contentFit='contain' />
                                    </View>
                                    <View style={styles.itemInfoWrap}>
                                        <View style={styles.itemDetailWrapA}>
                                            <Text style={styles.productNameText}>
                                                {truncateText(item.productName, 20)}
                                            </Text>
                                            <Text style={styles.priceText}>
                                                ${item.priceAtPurchase ? item.priceAtPurchase.toFixed(2) : 'N/A'}
                                            </Text>
                                        </View>
                                        <View style={styles.itemDetailWrapB}>
                                            <Text style={styles.categoryLabel}>Brand: </Text><Text style={styles.categoryText}>{item.brandName}</Text>
                                            <Text style={styles.categoryLabel}>Generic: </Text><Text style={styles.categoryText}>{item.genericName}</Text>
                                        </View>
                                        <View style={styles.itemDetailWrapB}>
                                            <View style={styles.quantityContainer}>
                                                <TouchableOpacity onPress={() => decreaseQuantity(index, item.productId)}>
                                                    <View style={styles.iconCover}>
                                                        <Image source={MinusIcon} style={styles.mathSymbol} alt='image' contentFit='contain' />
                                                    </View>
                                                </TouchableOpacity>
                                                <View style={styles.textWrap}>
                                                    <Text style={styles.quantityText}>{item.quantity}</Text>
                                                </View>
                                                <TouchableOpacity onPress={() => increaseQuantity(index, item.productId)}>
                                                    <View style={styles.iconCover}>
                                                        <Image source={PlusIcon} style={styles.mathSymbol} alt='image' contentFit='contain' />
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                            <TouchableOpacity onPress={() => handleDeleteItem(index, item.productId)}>
                                                <View style={styles.trashIconCover}>
                                                    <Image source={TrashIcon} style={styles.trashIcon} alt='image' contentFit='contain' />
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </Animated.View>
                            ))
                        )}
                    </ScrollView>

                    {/* Footer section */}
                    <View style={styles.footerContainer}>
                        <View style={styles.horizontalLine}></View>
                        <View style={styles.totalAmountContainer}>
                            <View style={styles.totalAmountWrap}>
                                <View>
                                    <Text style={styles.totalLabelText}>Price: </Text>
                                    <Text style={styles.totalLabelText}>Shipping: </Text>
                                </View>
                                <View>
                                    <View style={styles.costCover}>
                                        <Text style={styles.totalPriceText}>$ </Text>
                                        <Text style={styles.totalPriceText}> {totalPrice.toFixed(2)}</Text>
                                    </View>
                                    <View style={styles.costCover}>
                                        <Text style={styles.totalPriceText}>$ </Text>
                                        <Text style={styles.totalPriceText}> {shippingCost.toFixed(2)}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.verticalLine}></View>
                            <View style={styles.totalAmountCover}>
                                <Text style={styles.totalDollarText}>$</Text>
                                <Text style={styles.totalAmountText}>{(totalPrice + shippingCost).toFixed(2)}</Text>
                            </View>
                        </View>
                        <View style={styles.buttonWrap}>
                            <TouchableOpacity onPress={handleCheckout} style={styles.checkout}>
                                <Text style={styles.checkoutText}>Go to checkout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

export default CartScreen;


const styles = StyleSheet.create({
    container: {
        width: '100%',
        minHeight: '100%',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        marginHorizontal: 'auto',
        backgroundColor: '#fff'
    },
    titleWrap: {
        width: '100%',
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 'auto',
        marginTop: 60,
    },
    titleText: {
        fontSize: 22,
        fontWeight: '500',
        color: '#002020',
    },
    noProductText: {
        fontSize: 18,
        fontWeight: '300',
        color: '#002020',
        marginTop: 20,
        marginHorizontal: 'auto',
    },
    productScrollView: {
        width: '100%',
        height: '100%',
        margin: 'auto',
        padding: 10,
    },
    productWrap: {
        width: '100%',
        height: 120,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 20,
        marginHorizontal: 'auto',
        marginBottom: 10,
        borderRadius: 20,
        backgroundColor: '#EBF1F6',
    },
    imageWrap: {
        width: 85,
        height: 85,
        backgroundColor: '#fff',
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 20,
    },
    image: {
        width: 60,
        height: 60,
    },
    itemInfoWrap: {
        width: '70%',
        height: 85,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    itemDetailWrapA: {
        width: '100%',
        height: 20,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 7,
    },
    itemDetailWrapB: {
        width: '100%',
        height: 28,
        paddingLeft: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    productNameText: {
        fontSize: 20,
        fontWeight: '500',
        color: '#002020',
    },
    priceText: {
        fontSize: 20,
        fontWeight: '500',
        color: '#002020',
    },
    categoryWrap: {
        width: 100,
        height: 30,
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    categoryLabel: {
        fontSize: 14,
        fontWeight: '200',
        color: '#002020',
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#002020',
    },
    quantityContainer: {
        width: 110,
        height: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        marginTop: 10,
    },
    textWrap: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    productNumberCover: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    quantityText: {
        color: '#002020',
        fontSize: 17,
        fontWeight: '500',
    },
    iconCover: {
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconWrap: {
        width: 12,
        height: 12,
    },
    mathSymbol: {
        width: 10,
        height: 10,
    },
    trashIconCover: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    trashIcon: {
        width: 18,
        height: 20,
    },
    footerContainer: {
        width: '90%',
        height: 170,
        flexDirection: 'column',
        marginHorizontal: 'auto',
    },
    horizontalLine: {
        width: '100%',
        height: 0.5,
        borderRadius: 5,
        backgroundColor: '#757575',
        marginBottom: 5,
        marginHorizontal: 'auto',
    },
    totalAmountContainer: {
        width: '100%',
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 'auto',
        marginBottom: 20,
    },
    totalAmountWrap: {
        width: 'auto',
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginHorizontal: 'auto',
    },
    costCover: {
        width: 'auto',
        height: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 2,
    },
    totalLabelText: {
        fontSize: 18,
        fontWeight: '400',
        color: '#757575',
        marginBottom: 2,
    },
    totalPriceText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#002020',
        marginLeft: 5,
    },
    verticalLine: {
        width: 0.5,
        height: 50,
        borderRadius: 5,
        backgroundColor: '#757575',
        marginHorizontal: 10,
    },
    totalAmountCover: {
        width: 'auto',
        height: 30,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        marginHorizontal: 'auto',
    },
    totalDollarText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#002020',
        marginTop: 2,
        marginRight: 5,
    },
    totalAmountText: {
        fontSize: 30,
        fontWeight: '700',
        color: '#002020',
    },
    buttonWrap: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        marginHorizontal: 'auto',
    },
    checkout: {
        width: '100%',
        height: 60,
        padding: 5,
        backgroundColor: '#85ccb8',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 'auto',
    },
    cancel: {
        width: 170,
        height: 60,
        padding: 5,
        backgroundColor: Colors.GRAY,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 'auto',
    },
    checkoutText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '400',
    },
    cancelText: {
        color: '#002020',
        fontSize: 20,
        fontWeight: '400',
    },
    paymentInfoContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: width,
        backgroundColor: '#FFFFFF',
        zIndex: 10,
    },
});
