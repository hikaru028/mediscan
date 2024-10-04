import React, { FC } from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Image } from 'expo-image';
import { Product } from '../../utils/index';
import BoardIcon from '../../assets/images/board.png';
import { Colors } from '../../constants/colors';

type Props = {
    productData?: Product;
};

const ProductListCard: FC<Props> = ({ productData }) => {
    const truncateText = (text: string | undefined, maxLength: number) => {
        if (text && text.length > maxLength) {
            return `${text.slice(0, maxLength)}...`;
        }
        return text;
    };

    return (
        <View style={styles.card}>
            <View style={styles.imageCover}>
                <View style={styles.moreIconCover}>
                    <Image alt='image' source={BoardIcon} style={styles.moreIcon} contentFit='contain' />
                </View>
                <Image
                    alt='image'
                    source={`https://datawithimages.s3.ap-southeast-2.amazonaws.com/images/${productData?.productId}.jpg`}
                    style={styles.cardImage}
                    contentFit='contain'
                />
            </View>
            <View style={styles.infoContainer}>
                <View style={styles.textCover}>
                    <Text style={styles.text}>
                        {truncateText(productData?.productName, 40)}
                    </Text>
                    <Text style={styles.textBrand}>{productData?.brandName}</Text>
                </View>

                <View style={styles.priceCover}>
                    <Text style={styles.price}>$ {productData?.price}</Text>
                </View>
            </View>
        </View>
    );
};

export default ProductListCard;

const styles = StyleSheet.create({
    card: {
        width: 180,
        height: 180,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 0,
        margin: 10,
        alignItems: 'center',
        justifyContent: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    imageCover: {
        width: '100%',
        height: 90,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        backgroundColor: '#fff',
    },
    cardImage: {
        width: 85,
        height: 85,
        marginVertical: 10,
    },
    infoContainer: {
        width: '100%',
        height: 90,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        borderTopRightRadius: 60,
        backgroundColor: Colors.light.tint,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
    },
    textCover: {
        width: 140,
        height: 'auto',
        marginTop: 10,
        marginLeft: 10,
        justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: 'transparent',
    },
    text: {
        fontSize: 14,
        fontFamily: '500',
        color: Colors.light.text,
    },
    textBrand: {
        fontSize: 14,
        fontFamily: '300',
        color: '#757575',
    },
    priceCover: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        width: 70,
        height: 30,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.primary,
    },
    price: {
        fontSize: 20,
        fontFamily: '500',
        color: Colors.light.background,
    },
    moreIconCover: {
        position: 'absolute',
        top: 7,
        right: 8,
        width: 30,
        height: 30,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.GRAY,
    },
    moreIcon: {
        width: 15,
        height: 15,
    },
});