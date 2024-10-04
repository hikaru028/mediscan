import React, { FC, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Image } from 'expo-image';
import Animated, { SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { Product } from '../../utils/index';
import { Colors } from '../../constants/colors';
import SelectQuantityButton from '@/components/buttons/SelectQuantityButton'
import ArrowLeftIcon from '@/assets/images/arrow-left.png';
import Star1 from '@/assets/images/star-1.png';
import Star075 from '@/assets/images/start-0.75.png'
import Star05 from '@/assets/images/star-0.5.png';
import Star025 from '@/assets/images/star-0.25.png';
import Star0 from '@/assets/images/star-0.png';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/utils/navi-props';
import { useQuery } from '@tanstack/react-query';
import { GeneralCard, DetailCard, ReviewCard } from '@/components/cards/ProductDetailCard';
import chatImage from '@/assets/images/chat.png';

type Props = {
    product: Product;
    setProductDetail: React.Dispatch<React.SetStateAction<boolean>>;
    recommendedProduct?: Product;
};

type ProductDetailScreenRouteProp = RouteProp<RootStackParamList, 'screens/ProductDetailScreen'>;

const ProductDetailScreen: FC<Props> = ({ product, setProductDetail }) => {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState<'general' | 'details' | 'review'>('general');
    const { data: currentProduct } = useQuery<Product>({ queryKey: ['currentProduct'] });
    const route = useRoute<ProductDetailScreenRouteProp>();
    const productData = route.params?.product || product;
    const imageSource = route.params?.image
        || `https://datawithimages.s3.ap-southeast-2.amazonaws.com/images/${productData?.productId}.jpg`;

    const goPreviousPage = () => {
        if (product) {
            setProductDetail(false);
        } else {
            navigation.goBack();
        }
    };

    const renderCard = () => {
        switch (activeTab) {
            case 'general':
                return <GeneralCard productData={productData} />;
            case 'details':
                return <DetailCard productData={productData} />;
            case 'review':
                return <ReviewCard productData={productData} />;
            default:
                return null;
        }
    };

    const truncateText = (text: string | undefined, maxLength: number) => {
        if (text && text.length > maxLength) {
            return `${text.slice(0, maxLength)}...(more in General tab)`;
        }
        return text;
    };

    return (
        <Animated.View
            entering={SlideInRight}
            exiting={SlideOutRight}
            style={styles.container}
        >
            <SafeAreaView style={styles.productContainer}>
                {/* Header section */}
                <View style={styles.headerSection}>
                    <TouchableOpacity style={styles.iconCover} onPress={goPreviousPage}>
                        <Image source={ArrowLeftIcon} style={styles.arrowIcon} alt='image' contentFit='contain' />
                    </TouchableOpacity>
                    <View style={styles.imageCover}>
                        <Image
                            alt='image'
                            source={imageSource}
                            style={styles.image}
                            contentFit='contain'
                        />
                    </View>
                    {/* <TouchableOpacity style={styles.chatCover}>
                        <Image
                            alt='image'
                            source={chatImage}
                            style={styles.chatImage}
                            contentFit='contain'
                        />
                    </TouchableOpacity> */}
                </View>

                {/* Body section */}
                <View style={styles.detailContainer}>
                    <View style={styles.detailHeader}>
                        <View style={styles.textCover}>
                            <Text style={styles.productNameText}>{productData?.productName}</Text>
                            <Text style={styles.brandNameText}>{productData?.brandName}</Text>
                        </View>
                        <View style={styles.priceCover}>
                            <Text style={styles.dollarText}>$</Text>
                            <Text style={styles.priceText}>{productData?.price}</Text>
                        </View>
                    </View>

                    <View style={styles.separator} />

                    <View style={styles.detailHeader}>
                        <View style={styles.textCover}>
                            <Text style={styles.textDescription}>
                                {truncateText(productData?.description, 75)}
                            </Text>
                            <View style={styles.stockCover}>
                                <Text style={styles.stockLabel}>Stock:</Text>
                                <Text style={styles.stock}>{productData?.stock}</Text>
                            </View>
                        </View>
                        <View style={styles.ratingCover}>
                            <View style={styles.ratingTextCover}>
                                <Text style={styles.ratingLabel}>Rating:</Text>
                                <Text style={styles.ratingNumber}>4.5</Text>
                            </View>
                            <View style={styles.starCover}>
                                <Image source={Star1} style={styles.ratingStar} alt='image' contentFit='contain' />
                                <Image source={Star1} style={styles.ratingStar} alt='image' contentFit='contain' />
                                <Image source={Star1} style={styles.ratingStar} alt='image' contentFit='contain' />
                                <Image source={Star1} style={styles.ratingStar} alt='image' contentFit='contain' />
                                <Image source={Star05} style={styles.ratingStar} alt='image' contentFit='contain' />
                            </View>
                        </View>
                    </View>

                    <View style={styles.infoContainer}>
                        {/* Navigation */}
                        <View style={styles.navBar}>
                            <TouchableOpacity
                                style={[
                                    styles.navTextCover,
                                    activeTab === 'general' && styles.focusNavTextCover
                                ]}
                                onPress={() => setActiveTab('general')}
                            >
                                <Text style={activeTab === 'general' ? styles.focusNavText : styles.navText}>
                                    General
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.navTextCover,
                                    activeTab === 'details' && styles.focusNavTextCover
                                ]}
                                onPress={() => setActiveTab('details')}
                            >
                                <Text style={activeTab === 'details' ? styles.focusNavText : styles.navText}>
                                    Details
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.navTextCover,
                                    activeTab === 'review' && styles.focusNavTextCover
                                ]}
                                onPress={() => setActiveTab('review')}
                            >
                                <Text style={activeTab === 'review' ? styles.focusNavText : styles.navText}>
                                    Review
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Detail information */}
                        <View style={styles.scrollView}>
                            <ScrollView
                                horizontal={false}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.infoCover}
                            >
                                {renderCard()}
                            </ScrollView>
                        </View>

                        <View style={styles.quantityButtonCover}>
                            <SelectQuantityButton productData={productData} />
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </Animated.View>
    );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    productContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: Colors.light.tint,
    },
    headerSection: {
        width: '100%',
        height: 180,
        marginBottom: 5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.tint,
        overflow: 'hidden',
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
        zIndex: 10,
    },
    arrowIcon: {
        width: 15,
        height: 15,
    },
    chatCover: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 50,
        top: 10,
        right: 10,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 10,
        zIndex: 10,
    },
    chatImage: {
        width: 50,
        height: 50,
    },
    imageCover: {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: 'transparent',
    },
    image: {
        minWidth: 150,
        height: 150,
        marginVertical: 10,
    },
    detailContainer: {
        width: '100%',
        height: '100%',
        padding: 20,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        borderTopLeftRadius: 60,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 10,
    },
    detailHeader: {
        width: '80%',
        height: 'auto',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: 10,
    },
    textCover: {
        width: '100%',
        height: 'auto',
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    productNameText: {
        fontSize: 20,
        fontFamily: '700',
        marginRight: 5,
        color: Colors.light.text,
    },
    brandNameText: {
        fontSize: 14,
        fontFamily: '300',
        color: Colors.light.text,
    },
    priceCover: {
        width: 70,
        height: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dollarText: {
        fontSize: 20,
        fontFamily: '600',
        color: Colors.light.text,
    },
    priceText: {
        fontSize: 25,
        fontFamily: '700',
        color: Colors.light.text,
    },
    separator: {
        marginVertical: 4,
        height: 1,
        width: '100%',
        backgroundColor: '#E2EAF0',
    },
    textDescription: {
        width: 260,
        fontSize: 16,
        fontFamily: '300',
        color: Colors.light.text,
    },
    stockCover: {
        width: 100,
        height: 'auto',
        paddingVertical: 4,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.impact,
        borderRadius: 50,
        marginTop: 5,
    },
    stockLabel: {
        fontSize: 14,
        fontFamily: '300',
        color: '#fff',
        marginRight: 5,
    },
    stock: {
        fontSize: 14,
        fontFamily: '600',
        color: '#fff',
    },
    ratingCover: {
        width: 'auto',
        height: 'auto',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginLeft: -20,
    },
    ratingTextCover: {
        width: 'auto',
        flexDirection: 'row',
        marginBottom: 5,
    },
    ratingLabel: {
        fontSize: 14,
        fontFamily: '300',
        color: Colors.light.text,
        marginRight: 5,
    },
    ratingNumber: {
        fontSize: 14,
        fontFamily: '600',
        color: Colors.light.text,
    },
    starCover: {
        width: 'auto',
        height: 'auto',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    ratingStar: {
        width: 17,
        height: 17,
        marginHorizontal: 1,
    },
    infoContainer: {
        width: '100%',
        height: 500,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    navBar: {
        width: '100%',
        height: 'auto',
        paddingVertical: 8,
        borderRadius: 50,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#EBF1F6',
    },
    navTextCover: {
        width: 100,
        height: 'auto',
        paddingVertical: 5,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    focusNavTextCover: {
        width: 100,
        height: 'auto',
        paddingVertical: 5,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.primary,
    },
    navText: {
        fontSize: 18,
        fontFamily: '500',
        color: Colors.light.text,
    },
    focusNavText: {
        fontSize: 20,
        fontFamily: '600',
        color: '#fff',
    },
    scrollView: {
        height: 250,
        marginTop: 10,
        backgroundColor: 'transparent',
    },
    infoCover: {
        paddingVertical: 2,
        paddingHorizontal: 10,
        flexGrow: 1,
        justifyContent: 'flex-start',
    },
    quantityButtonCover: {
        position: 'absolute',
        bottom: 90,
        left: 0,
        width: '100%',
        height: 'auto',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 0,
        padding: 20,
        marginHorizontal: 0,
        borderRadius: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 10,
    },
});
