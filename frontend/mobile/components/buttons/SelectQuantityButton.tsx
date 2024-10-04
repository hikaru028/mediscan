import React, { FC, useRef, useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Image } from 'expo-image';
import { Text, View } from '@/components/Themed';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '@/utils/navi-props';
import { Product } from '../../utils/index';
import Loading from '../loading/LoadingDark';
import MinusIcon from '../../assets/images/minus.png';
import PlusIcon from '../../assets/images/plus.png';
import PlusWIcon from '../../assets/images/plusW.png';
import { Colors } from '@/constants/colors';
import axiosClient from '@/app/api/axiosClient';

type Props = {
    productData?: Product;
};

const SelectQuantityButton: FC<Props> = ({ productData }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const [orderQuantity, setOrderQuantity] = useState(1);
    const navigation = useNavigation<NavigationProps>();
    const queryClient = useQueryClient();

    const saveCartId = async (newCartId: any) => {
        try {
            await AsyncStorage.setItem('cart_id', newCartId);
        } catch (error) {
            console.error('Failed to save cart_id:', error);
        }
    };

    const addToCartMutation = useMutation({
        mutationFn: async () => {
            try {
                const cartId = await AsyncStorage.getItem('cart_id');
                const res = await axiosClient.post('/carts/add', {
                    product_id: productData?.productId,
                    cart_id: cartId,
                    quantity: orderQuantity,
                });

                if (!cartId) {
                    const newCartId = res.data;
                    if (newCartId) {
                        await saveCartId(newCartId);
                    }
                }

                return res.data;
            } catch (error: any) {
                console.error('Error adding to cart:', error);
                throw new Error('Failed to add to cart');
            }
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['cartItems'] });
            // await queryClient.invalidateQueries({ queryKey: ['cartTotalQuantity'] });
        },
        onError: (error) => {
            console.error('Mutation failed:', error);
        },
    });

    useEffect(() => {
        if (addToCartMutation.isSuccess) {
            navigation.navigate('cart');
        }
    }, [addToCartMutation.isSuccess, navigation]);


    const handleAddToCart = () => {
        if (!addToCartMutation.isPending && !addToCartMutation.isSuccess) {
            addToCartMutation.mutate();
        }
    };

    const increaseQuantity = () => {
        setOrderQuantity(orderQuantity + 1);
    };

    const decreaseQuantity = () => {
        if (orderQuantity > 1) {
            setOrderQuantity(orderQuantity - 1);
        }
    };

    const moveUp = () => {
        animateQuantityChange('up');
        increaseQuantity();
    };

    const moveDown = () => {
        animateQuantityChange('down');
        decreaseQuantity();
    };

    const animateQuantityChange = (direction: 'up' | 'down') => {
        animatedValue.setValue(direction === 'up' ? -1 : 1);
        Animated.timing(animatedValue, {
            toValue: 0,
            duration: 200,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    };

    const translateY = animatedValue.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [20, 0, -20],
    });


    return (
        <View style={styles.quantityContainer}>
            <View style={styles.quantityWrap}>
                <TouchableOpacity onPress={moveDown}>
                    <View style={styles.iconCover}>
                        <View style={styles.iconWrap}>
                            <Image alt='image' source={MinusIcon} style={styles.mathSymbol} contentFit='contain' />
                        </View>
                    </View>
                </TouchableOpacity>
                <View style={styles.textWrap}>
                    <Animated.Text style={[styles.quantityText, { transform: [{ translateY }] }]}>
                        {orderQuantity}
                    </Animated.Text>
                </View>
                <TouchableOpacity onPress={moveUp}>
                    <View style={styles.iconCover}>
                        <View style={styles.iconWrap}>
                            <Image alt='image' source={PlusIcon} style={styles.mathSymbol} contentFit='contain' />
                        </View>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Checkout */}
            <View style={styles.buttonWrap}>
                <TouchableOpacity
                    onPress={handleAddToCart}
                    style={[styles.checkout, addToCartMutation.isPending && styles.disabledButton]}
                    disabled={addToCartMutation.isPending}
                >
                    {addToCartMutation.isPending ? (
                        <Loading />
                    ) : (
                        <View style={styles.buttonCover}>
                            <Image alt='image' source={PlusWIcon} style={{ width: 15, height: 15, marginRight: 8, marginBottom: 0 }} />
                            <Text style={styles.checkoutText}>Add to cart</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default SelectQuantityButton;

const styles = StyleSheet.create({
    quantityContainer: {
        width: '100%',
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        margin: 'auto',
        backgroundColor: 'transparent'
    },
    quantityWrap: {
        width: '50%',
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        backgroundColor: 'transparent'
    },
    buttonWrap: {
        width: '50%',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        flexDirection: 'column',
        marginHorizontal: 'auto',
        backgroundColor: 'transparent'
    },
    iconCover: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: '#EAFAF5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconWrap: {
        width: 12,
        height: 20,
        backgroundColor: '#EAFAF5',
    },
    mathSymbol: {
        width: 15,
        height: 20,
    },
    textWrap: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
        backgroundColor: 'transparent'
    },
    quantityText: {
        color: Colors.light.text,
        fontSize: 40,
        fontFamily: '700'
    },
    buttonCover: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.light.primary,
    },
    checkout: {
        width: 140,
        height: 50,
        backgroundColor: Colors.light.primary,
        borderRadius: 15,
        marginLeft: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkoutText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '500',
        backgroundColor: Colors.light.primary,
    },
    disabledButton: {
        opacity: 0.5,
    },
});