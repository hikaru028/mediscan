import React, { FC, useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Image } from 'expo-image';
import CartIcon from '../../assets/images/cart4.png';
import { Colors } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '@/utils/navi-props';
import { OrderItem, Order, Product } from '@/utils/index';

type Props = {
    order: Order;
    setProductName: (value: string) => void;
    setProductDetail: (value: boolean) => void;
};

const MyOrderHistory: FC<Props> = ({ order, setProductName, setProductDetail }) => {
    const navigation = useNavigation<NavigationProps>();
    const [preTotalPrice, setPreTotalPrice] = useState<number>(0);
    const [shippingCost, setShippingCost] = useState<number>(0);
    const [totalQuantity, setTotalQuantity] = useState(0);

    useEffect(() => {
        if (order) {
            let total = 0;
            let totalQuantity = 0;

            order.items.forEach(item => {
                total += item.priceAtPurchase * item.quantity;
                totalQuantity += item.quantity;
            });

            setPreTotalPrice(total);
            setTotalQuantity(totalQuantity);
            const roundedTotal = Math.round(total * 100) / 100;
            const shipping = roundedTotal >= 70.00 ? 0 : 5;
            setShippingCost(shipping);
        }
    }, [order]);

    const showProductDetail = async (item: OrderItem) => {
        setProductName(item.productName);
        setProductDetail(true);
    };

    const truncateText = (text: string | undefined, maxLength: number) => {
        if (text && text.length > maxLength) {
            return `${text.slice(0, maxLength)}...`;
        }
        return text;
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.productScrollView}>
                {order.items.map((item: any, index: number) => (
                    <View key={index} style={styles.productWrap}>
                        <View style={styles.imageContainer}>
                            <View style={styles.imageWrap}>
                                <Image source={`https://datawithimages.s3.ap-southeast-2.amazonaws.com/images/${item.productId}.jpg`} style={styles.image} alt='image' contentFit='contain' />
                            </View>
                            <View style={styles.textWrap}>
                                <Text style={styles.quantityText}>× {item.quantity}</Text>
                            </View>
                        </View>
                        <View style={styles.itemInfoWrap}>
                            <View style={styles.itemDetailWrap}>
                                <Text style={styles.productNumberText}>#{item.productId}</Text>
                                <Text style={styles.productNameText}>
                                    {truncateText(item.productName, 40)}
                                </Text>
                                <Text style={styles.priceText}>
                                    ${item.priceAtPurchase ? item.priceAtPurchase.toFixed(2) : 'N/A'}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => showProductDetail(item)} style={styles.buyButtonWrap}>
                            <View style={styles.buyButtonCover}>
                                <Image source={CartIcon} style={styles.cartIcon} alt='image' contentFit='contain' />
                                <Text style={styles.buyButtonText}>Buy</Text>
                                <Text style={styles.buyButtonText}>again</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                ))
                }
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
                                <Text style={styles.preTotalPriceText}>$ </Text>
                                <Text style={styles.preTotalPriceText}> {preTotalPrice.toFixed(2)}</Text>
                            </View>
                            <View style={styles.costCover}>
                                <Text style={styles.preTotalPriceText}>$ </Text>
                                <Text style={styles.preTotalPriceText}> {shippingCost.toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.verticalLine}></View>
                    <View style={styles.totalAmountCover}>
                        <Text style={styles.totalDollarText}>$</Text>
                        <Text style={styles.totalAmountText}>{(preTotalPrice + shippingCost).toFixed(2)}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default MyOrderHistory;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        minHeight: '100%',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        backgroundColor: '#fff',
        zIndex: 0,
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
        fontFamily: '500',
        color: Colors.light.text,
    },
    noProductText: {
        fontSize: 18,
        fontFamily: '300',
        color: Colors.light.text,
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
    imageContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
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
        width: 190,
        height: 85,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    quantityText: {
        fontSize: 17,
        fontFamily: '500',
        color: Colors.light.background,
    },
    textWrap: {
        position: 'absolute',
        top: -10,
        right: 10,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        backgroundColor: Colors.light.impact,
    },
    itemDetailWrap: {
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 7,
        backgroundColor: '#EBF1F6',
    },
    buyButtonWrap: {
        width: 60,
        height: 85,
        paddingLeft: 5,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.light.primary,
    },
    productNumberText: {
        fontSize: 16,
        fontFamily: '400',
        color: '#757575',
    },
    productNameText: {
        fontSize: 18,
        fontFamily: '600',
        color: Colors.light.text,
        marginBottom: 15,
    },
    priceText: {
        fontSize: 18,
        fontFamily: '400',
        color: Colors.light.text,
    },
    buyButtonCover: {
        width: '100%',
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.primary,
    },
    cartIcon: {
        width: 22,
        height: 22,
        marginBottom: 5,
    },
    buyButtonText: {
        fontSize: 16,
        fontFamily: '400',
        color: '#fff',
    },
    footerContainer: {
        width: '90%',
        height: 220,
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
        fontFamily: '400',
        color: '#757575',
        marginBottom: 2,
    },
    preTotalPriceText: {
        fontSize: 18,
        fontFamily: '600',
        color: Colors.light.text,
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
        fontFamily: '500',
        color: Colors.light.text,
        marginTop: 2,
        marginRight: 5,
    },
    totalAmountText: {
        fontSize: 30,
        fontFamily: '700',
        color: Colors.light.text,
    },
});
