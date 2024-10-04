import React, { FC, useState } from 'react';
import { StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Image } from 'expo-image';
import { Product } from '../../utils/index';
import ProductImage from '../../assets/images/product.png';
import BoardIcon from '../../assets/images/board.png';
import { Colors } from '../../constants/colors';

type Props = {
    productData?: Product;
};

const ProductRecommendCard: FC<Props> = ({ productData }) => {
    return (
        <>
            <View style={styles.card}>
                <View style={styles.imageCover}>
                    <Image alt='image' source={productData?.images || ProductImage} style={styles.cardImage} contentFit='contain' />
                </View>
                <View style={styles.textCover}>
                    <Text style={styles.text}>{productData?.productName}</Text>
                    <Text style={styles.textBrand}>{productData?.brandName}</Text>
                </View>
                <View style={styles.priceCover}>
                    <Text style={styles.price}>${productData?.price}</Text>
                </View>
                <View style={styles.moreIconCover}>
                    <Image alt='image' source={BoardIcon} style={styles.moreIcon} contentFit='contain' />
                </View>
            </View>
        </>
    );
};

export default ProductRecommendCard;

const styles = StyleSheet.create({
    card: {
        width: 150,
        height: 150,
        backgroundColor: '#EBF1F6',
        borderRadius: 15,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    imageCover: {
        width: '100%',
        height: 60,
        overflow: 'hidden',
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    cardImage: {
        width: 60,
        height: 60,
        marginVertical: 10,
    },
    textCover: {
        width: '100%',
        height: 30,
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: '#EBF1F6',
    },
    text: {
        fontSize: 16,
        fontFamily: '500',
        color: Colors.light.text
    },
    textBrand: {
        fontSize: 14,
        fontFamily: '300',
        color: Colors.light.text
    },
    priceCover: {
        position: 'absolute',
        bottom: 6,
        left: 2,
        width: 70,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EBF1F6',
        // borderWidth: 1,
        // borderRadius: 50,
        // borderColor: Colors.light.primary,
    },
    price: {
        fontSize: 20,
        fontFamily: '700',
        color: Colors.light.text,
    },
    moreIconCover: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 30,
        height: 30,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7F7F7'
    },
    moreIcon: {
        width: 15,
        height: 15,
    },
});