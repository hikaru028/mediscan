import React, { FC, useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Image } from 'expo-image';
import Animated, { SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { Order, Product } from '@/utils/index';
import { fetchProduct } from '@/hooks/useProductDataFetch';
import ArrowLeftIcon from '@/assets/images/arrow-left.png';
import MyOrderHistory from '@/components/history/MyOrderHistory';
import TrackOrder from '@/components/history/TrackOrder';
import ProductDetailScreen from '@/app/screens/ProductDetailScreen';
import axiosClient from '@/app/api/axiosClient';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '@/utils/navi-props';
import Loading from '@/components/loading/Loading';

type Props = {
    order: Order;
    onClose: () => void;
};

const OrderDetailScreen: FC<Props> = ({ order, onClose }) => {
    const [myOrder, setMyOrder] = useState<boolean>(true);
    const [trackOrder, setTrackOrder] = useState<boolean>(false);
    const [orderDate, setOrderDate] = useState<string>('');
    const [productDetail, setProductDetail] = useState(false);
    const [productName, setProductName] = useState('');
    const [product, setProduct] = useState<Product | undefined>();
    const [loadingProduct, setLoadingProduct] = useState<boolean>(false);
    const navigation = useNavigation<NavigationProps>();

    useEffect(() => {
        const formattedDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        setOrderDate(formattedDate);
    }, [order.createdAt]);

    useEffect(() => {
        const fetchProductData = async () => {
            if (productDetail && productName) {
                setLoadingProduct(true); // Start loading
                const fetchedProduct = await fetchProduct(productName);
                if (fetchedProduct) {
                    setProduct(fetchedProduct);
                }
                setLoadingProduct(false); // End loading
            }
        };
        fetchProductData();
    }, [productDetail, productName]);

    const goMyOrder = () => {
        setMyOrder(true);
        setTrackOrder(false);
    };

    const goTrackOrder = () => {
        setMyOrder(false);
        setTrackOrder(true);
    };

    const goPreviousPage = () => {
        onClose();
    };

    if (productDetail) {
        if (loadingProduct) {
            return (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Loading />
                </View>
            );
        } else if (product) {
            return <ProductDetailScreen product={product} setProductDetail={setProductDetail} />;
        }
    }

    return (
        <Animated.View
            entering={SlideInRight}
            exiting={SlideOutRight}
            style={styles.container}
        >
            <SafeAreaView style={styles.productContainer}>
                <View style={styles.headerSection}>
                    <TouchableOpacity style={styles.iconCover} onPress={goPreviousPage}>
                        <Image source={ArrowLeftIcon} style={styles.arrowIcon} alt='image' contentFit='contain' />
                    </TouchableOpacity>
                    <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 30 }}>
                        <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                        <Text style={{ color: "#757575", fontSize: 16, fontFamily: '400' }}>Ordered: {orderDate}</Text>
                    </View>
                </View>

                <View style={styles.NavContainer}>
                    <TouchableOpacity onPress={goMyOrder} style={[styles.NavTabCover, { backgroundColor: myOrder ? Colors.light.primary : '#EBF1F6' }]}>
                        <Text style={[styles.NavTabText, { color: myOrder ? Colors.light.background : Colors.light.text }]}>
                            My Order
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={goTrackOrder}
                        style={[styles.NavTabCover, { backgroundColor: trackOrder ? Colors.light.primary : '#EBF1F6' }]}>
                        <Text
                            style={[styles.NavTabText, { color: trackOrder ? Colors.light.background : Colors.light.text }]}>
                            Track Order
                        </Text>
                    </TouchableOpacity>
                </View>

                <View>
                    {myOrder && <MyOrderHistory order={order} setProductName={setProductName} setProductDetail={setProductDetail} />}
                    {trackOrder && <TrackOrder order={order} />}
                </View>
            </SafeAreaView>
        </Animated.View >
    );
};

export default OrderDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    productContainer: {
        width: '100%',
        height: '100%',
        paddingHorizontal: 20,
        backgroundColor: Colors.light.background,
    },
    headerSection: {
        width: '100%',
        height: 60,
        marginBottom: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconCover: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 50,
        top: 10,
        left: 10,
        backgroundColor: '#EBF1F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowIcon: {
        width: 15,
        height: 15,
    },
    orderNumber: {
        fontSize: 22,
        fontFamily: '500',
        color: '#002020',
    },
    NavContainer: {
        width: '100%',
        height: 60,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        paddingHorizontal: 6,
        marginTop: 10,
        borderBottomWidth: 2,
        borderBottomColor: Colors.light.primary
    },
    NavTabCover: {
        width: '50%',
        height: 40,
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    NavTabText: {
        fontSize: 18,
        fontFamily: '500'
    },
});