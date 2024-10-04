import React, { FC } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from '@/components/Themed';
import { Product } from '@/utils/index';
import Star1 from '@/assets/images/star-1.png';
import Star075 from '@/assets/images/start-0.75.png';
import Star05 from '@/assets/images/star-0.5.png';
import Star025 from '@/assets/images/star-0.25.png';
import Star0 from '@/assets/images/star-0.png';
import { Colors } from '@/constants/colors';

type Props = {
    productData?: Product;
};

export const GeneralCard: FC<Props> = ({ productData }) => {
    return (
        <View style={styles.cardContainer}>
            <Text style={styles.title}>👨🏼‍⚕️ What is {productData?.productName} ...</Text>
            <View style={styles.mainUnderBar} />
            <Text style={styles.description}>
                {productData ? productData.description : 'No product data available.'}
            </Text>
            <View style={styles.cardContainer}>
                <Text style={styles.title}>💁🏼‍♂️ General Information</Text>
                <View style={styles.subUnderBar} />
                <Text style={styles.detail}>Brand: {productData?.brandName}</Text>
                <Text style={styles.detail}>Formulation: {productData?.formulation}</Text>
                <Text style={styles.detail}>Generic Name: {productData?.genericName}</Text>
                <Text style={styles.detail}>Brand: {productData?.brandName}</Text>
                <Text style={styles.detail}>manufacturer: {productData?.manufacturer}</Text>
            </View>
        </View>
    );
};

export const DetailCard: FC<Props> = ({ productData }) => {
    return (
        <View style={styles.cardContainer}>
            <Text style={styles.title}>👨🏼‍💼 More about our product ...</Text>
            <View style={styles.mainUnderBar} />

            <View style={styles.sectionContainer}>
                <Text style={styles.title}>Systemic Category</Text>
                <View style={styles.subUnderBar} />
                <Text style={styles.detail}>Price: ${productData?.price.toFixed(2)}</Text>
                <Text style={styles.detail}>since: {productData?.since}</Text>
                <Text style={styles.detail}>updated: {productData?.updated}</Text>
                <Text style={styles.detail}>Therapeutic Class: {productData?.therapeuticClass}</Text>
                <Text style={styles.detail}>Drug Class: {productData?.drugClass}</Text>
            </View>

            <View style={styles.sectionContainer}>
                <Text style={styles.title}>Composition and Formulation</Text>
                <View style={styles.subUnderBar} />
                <Text style={styles.detail}>Active Ingredients: {productData?.activeIngredients}</Text>
                <Text style={styles.detail}>Inactive Ingredients: {productData?.inactiveIngredients}</Text>
                <Text style={styles.detail}>Formulation: {productData?.formulation}</Text>
                <Text style={styles.detail}>Strength: {productData?.strength}</Text>
            </View>

            <View style={styles.sectionContainer}>
                <Text style={styles.title}>Usage and Administration</Text>
                <View style={styles.subUnderBar} />
                <Text style={styles.detail}>Dosage: {productData?.dosage}</Text>
                <Text style={styles.detail}>Route of Administration: {productData?.routeOfAdministration}</Text>
                <Text style={styles.detail}>Indications: {productData?.indications}</Text>
                <Text style={styles.detail}>Contraindications: {productData?.contraindications}</Text>
            </View>

            <View style={styles.sectionContainer}>
                <Text style={styles.title}>Safety and Storage</Text>
                <View style={styles.subUnderBar} />
                <Text style={styles.detail}>Side Effects: {productData?.sideEffects}</Text>
                <Text style={styles.detail}>Interactions: {productData?.interactions}</Text>
                <Text style={styles.detail}>Warnings: {productData?.warnings}</Text>
                <Text style={styles.detail}>Storage Conditions: {productData?.storageConditions}</Text>
            </View>

            <View style={styles.sectionContainer}>
                <Text style={styles.title}>Regulatory Information</Text>
                <View style={styles.subUnderBar} />
                <Text style={styles.detail}>Usage Duration: {productData?.usageDuration}</Text>
                <Text style={styles.detail}>Approval Date: {productData?.approvalDate}</Text>
                <Text style={styles.detail}>Expiry Date: {productData?.expiryDate}</Text>
                <Text style={styles.detail}>Batch Number: #{productData?.batchNumber}</Text>
            </View>
        </View>
    );
};

export const ReviewCard: FC<Props> = ({ productData }) => {
    return (
        <View style={styles.cardContainer}>
            <View style={styles.reviewSection}>
                <Text style={styles.title}>User 1</Text>
                <View>
                    <View style={styles.starCover}>
                        <Image source={Star1} style={styles.ratingStar} alt='image' />
                        <Image source={Star1} style={styles.ratingStar} alt='image' />
                        <Image source={Star1} style={styles.ratingStar} alt='image' />
                        <Image source={Star1} style={styles.ratingStar} alt='image' />
                        <Image source={Star05} style={styles.ratingStar} alt='image' />
                    </View>
                    <Text style={styles.review}>This product is excellent and meets all expectations!</Text>
                </View>
            </View>
            <View style={styles.reviewSection}>
                <Text style={styles.title}>User 2</Text>
                <View>
                    <View style={styles.starCover}>
                        <Image source={Star1} style={styles.ratingStar} alt='image' />
                        <Image source={Star1} style={styles.ratingStar} alt='image' />
                        <Image source={Star1} style={styles.ratingStar} alt='image' />
                        <Image source={Star1} style={styles.ratingStar} alt='image' />
                        <Image source={Star1} style={styles.ratingStar} alt='image' />
                    </View>
                    <Text style={styles.review}>This product is excellent and meets all expectations!</Text>
                </View>
            </View>
            <View style={styles.reviewSection}>
                <Text style={styles.title}>User 3</Text>
                <View>
                    <View style={styles.starCover}>
                        <Image source={Star1} style={styles.ratingStar} alt='image' />
                        <Image source={Star1} style={styles.ratingStar} alt='image' />
                        <Image source={Star1} style={styles.ratingStar} alt='image' />
                        <Image source={Star1} style={styles.ratingStar} alt='image' />
                        <Image source={Star1} style={styles.ratingStar} alt='image' />
                    </View>
                    <Text style={styles.review}>This product is excellent and meets all expectations!</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: '100%',
        height: '100%',
        padding: 20,
        marginVertical: 10,
    },
    mainUnderBar: {
        width: 50,
        height: 3,
        backgroundColor: '#4d68b0',
        marginTop: 1,
        marginBottom: 10,
        borderRadius: 50,
    },
    subUnderBar: {
        width: 50,
        height: 3,
        backgroundColor: '#E2EAF0',
        marginTop: 1,
        marginBottom: 10,
        borderRadius: 50,
    },
    sectionContainer: {
        width: '100%',
        height: 'auto',
        padding: 20,
        marginVertical: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        lineHeight: 22,
        color: '#333',
    },
    detail: {
        fontSize: 16,
        lineHeight: 22,
        color: '#555',
        marginBottom: 5,
    },
    reviewSection: {
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E2EAF0',
        paddingBottom: 15,
    },
    ratingText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    starCover: {
        flexDirection: 'row',
        marginTop: 5,
        marginBottom: 10,
    },
    ratingStar: {
        width: 18,
        height: 18,
        marginRight: 2,
    },
    review: {
        fontSize: 16,
        fontStyle: 'italic',
        color: Colors.light.secondary,
    },
});

export default { GeneralCard, DetailCard, ReviewCard };
