import React, { FC, useEffect, useState } from 'react';
import { StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '@/utils/navi-props';
import { Image } from 'expo-image';
import { Text, View } from '@/components/Themed';
import { Product } from '@/utils/index';
import { Colors } from '@/constants/colors';
import ProductRecommendCard from '@/components/cards/ProductRecommendCard';
import ConfirmModal from '@/components/modals/ConfirmModal';
import SelectQuantityButton from '@/components/buttons/SelectQuantityButton';
import BoardIcon from '../../assets/images/board.png';
import PillIcon from '../../assets/images/pill.png';
import ArrowRightIcon from '../../assets/images/arrow-right.png';
import CloseIcon from '../../assets/images/close.png';
import { fetchProducts } from '@/hooks/useProductDataFetch';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@react-navigation/native';
import axios from 'axios';
import { NGROK_API } from '@/app/api/ngrok';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.4;

type Props = {
    retakePhoto: () => void;
    slideDown: () => void;
};

const SearchResultScreen: FC<Props> = ({ retakePhoto, slideDown }) => {
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const { data: currentProduct } = useQuery<Product>({ queryKey: ['currentProduct'] });
    const [recommendProducts, setRecommendProducts] = useState<Product[]>([]);
    const productName = currentProduct?.productName;
    const genericName = currentProduct?.genericName;
    const navigation = useNavigation<NavigationProps>();

    useEffect(() => {
        if (productName && genericName) {
            pickupRecommendation(productName, genericName).then(setRecommendProducts);
        }
    }, [productName, genericName]);

    const pickupRecommendation = async (productName: string, genericName: string): Promise<Product[]> => {
        try {
            let allProducts: any[] = [];

            const fetchProducts = async () => {
                try {
                    const response = await axios.get(`${NGROK_API}/api/products/mobile/all`);
                    allProducts = response.data;
                } catch (error) {
                    console.error("Error fetching products:", error);
                }
            };

            await fetchProducts();

            const filteredProducts = allProducts.slice(-6);
            return filteredProducts;
        } catch (error) {
            console.error('Failed to fetch recommended products:', error);
            return [];
        }
    };

    const showProductDetail = (product: Product) => {
        if (currentProduct) {
            navigation.navigate('screens/ProductDetailScreen', {
                image: `https://datawithimages.s3.ap-southeast-2.amazonaws.com/images/${currentProduct.productId}.jpg`,
                product: product,
            });
        }
    };

    const renderProductsPage = () => {
        navigation.navigate('product');
    }


    const confirmDelete = () => {
        setModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerIconWrap}>
                <View></View>
                <View style={styles.headerBar}></View>
                <TouchableOpacity onPress={confirmDelete} style={styles.headerIconCover}>
                    <Image alt="image" source={CloseIcon} style={styles.closeIcon} contentFit='contain' />
                </TouchableOpacity>
            </View>
            {!currentProduct || !currentProduct.productName ? (
                <Text>No product data available</Text>
            ) : (
                <>
                    <View style={styles.productContainer}>
                        {/* Product image */}
                        <TouchableOpacity onPress={() => showProductDetail(currentProduct)} style={styles.productImageWrap}>
                            <Image
                                source={`https://datawithimages.s3.ap-southeast-2.amazonaws.com/images/${currentProduct.productId}.jpg`}
                                style={styles.productImage}
                                alt="image"
                                contentFit='contain'
                            />
                            <Text>{currentProduct.productName}</Text>
                        </TouchableOpacity>
                        {/* Product information */}
                        <View style={styles.infoWrap}>
                            <View style={styles.infoCover}>
                                <View style={styles.iconWrap}>
                                    <Image alt="image" source={BoardIcon} style={styles.infoIcon} contentFit='contain' />
                                </View>
                                <View>
                                    <Text style={styles.stock}>{currentProduct.productName}</Text>
                                    <Text style={styles.detailText}>Brand: {currentProduct.brandName}</Text>
                                    <Text style={styles.detailText}>Generic: {currentProduct.genericName}</Text>
                                    <Text style={styles.detailText}>Formulation: {currentProduct.formulation}</Text>
                                </View>
                            </View>
                            <View style={styles.infoCover}>
                                <View style={styles.iconWrap}>
                                    <Image alt="image" source={PillIcon} style={styles.infoIcon} contentFit='contain' />
                                </View>
                                <View>
                                    <Text style={styles.stockLabel}>Stock:</Text>
                                    <Text style={styles.stock}>{currentProduct.stock}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.priceWrap}>
                            <View style={styles.priceCover}>
                                <Text style={styles.priceText}>${currentProduct.price} / each</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => showProductDetail(currentProduct)} style={styles.seeMoreWrap}>
                            <Text style={styles.seeMoreText}>See more</Text>
                            <Image alt="image" source={ArrowRightIcon} style={styles.arrowIcon} contentFit='contain' />
                        </TouchableOpacity>
                    </View>

                    {/* Quantity Input */}
                    <SelectQuantityButton productData={currentProduct} />

                    <View style={styles.recommendationContainer}>
                        <Text style={styles.recommendationTitle}>Found similarities...</Text>
                        {recommendProducts.length === 0 ? (
                            // <Text>No product data available</Text>
                            <TouchableOpacity onPress={renderProductsPage}>
                                <Text>See all...</Text>
                            </TouchableOpacity>
                        ) : (
                            <ScrollView
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.scrollView}
                            >
                                {recommendProducts.map((product, index) => (
                                    <TouchableOpacity
                                        onPress={() => showProductDetail(product)}
                                        key={index}
                                    >
                                        <ProductRecommendCard productData={product} />
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity onPress={renderProductsPage}>
                                    <Text>See all...</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        )}
                    </View>

                </>
            )}
            {modalVisible && (
                <ConfirmModal
                    question="Would you delete this result?"
                    modalVisible={modalVisible}
                    setModalVisible={setModalVisible}
                    retakePhoto={retakePhoto}
                    slideDown={slideDown}
                />
            )}
        </View>
    );
};

export default SearchResultScreen;

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        minWidth: '100%',
        minHeight: '100%',
    },
    headerBar: {
        width: 60,
        height: 4,
        borderRadius: 3,
        backgroundColor: '#D9D9D9',
        marginBottom: 10,
        marginLeft: 35,
        marginTop: -20
    },
    headerIconWrap: {
        width: '100%',
        height: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    headerIconCover: {
        width: 30,
        height: 30,
        padding: 3,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EBF1F6',
        zIndex: 999,
    },
    closeIcon: {
        width: 12,
        height: 12,
    },
    productContainer: {
        width: 380,
        height: 'auto',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderRadius: 30,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
    productImageWrap: {
        minWidth: '100%',
        maxHeight: 140,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        marginBottom: 20,
        overflow: 'hidden',
        borderRadius: 20,
        // backgroundColor: '#C9D3DB',
    },
    productImage: {
        width: 150,
        maxHeight: 140,
    },
    infoWrap: {
        width: '100%',
        height: 'auto',
        flexDirection: 'row',
        alignItems: 'flex-start',
        columnGap: 25,
    },
    infoCover: {
        width: 155,
        height: 'auto',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        fontWeight: 'regular',
        marginBottom: 5,
    },
    iconWrap: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    infoIcon: {
        width: 15,
        height: 28,
    },
    detailText: {
        color: '#002020',
        fontSize: 16,
        fontFamily: '400',
        marginBottom: 5,
    },
    stockLabel: {
        color: '#002020',
        fontSize: 16,
        fontFamily: '400',
        marginBottom: 5,
        marginTop: 5,
    },
    stock: {
        color: '#002020',
        fontSize: 22,
        fontFamily: '500',
    },
    priceWrap: {
        width: '100%',
        height: 'auto',
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    priceCover: {
        width: 'auto',
        alignItems: 'flex-end',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.light.primary || Colors.dark.primary,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 50,
    },
    priceText: {
        color: '#002020',
        fontSize: 20,
        fontFamily: '600',
        textAlign: 'right',
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    seeMoreWrap: {
        width: 100,
        flexDirection: 'row',
        height: 'auto',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    seeMoreText: {
        color: Colors.light.text || Colors.dark.text,
        fontSize: 16,
        fontFamily: '400',
        marginRight: 5,
    },
    arrowIcon: {
        width: 10,
        height: 10,
        margin: 0,
        padding: 0,
    },
    recommendationContainer: {
        width: '120%',
        height: 'auto',
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    cardContainer: {
        width: CARD_WIDTH,
        marginLeft: 10,
        paddingVertical: 10,
    },
    scrollView: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    recommendationTitle: {
        color: Colors.light.secondary,
        fontSize: 18,
        fontFamily: '400',
        marginBottom: 5,
        marginLeft: 20,
    },
});