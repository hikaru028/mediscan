import React, { FC, useState, useRef, useEffect, useCallback } from 'react';
import { CameraCapturedPicture } from 'expo-camera';
import { StyleSheet, TouchableOpacity, View, Animated, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Text } from '@/components/Themed';
import { shareAsync } from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import ConfirmModal from '../../components/modals/ConfirmModal';
import { Product } from '@/utils/index';
import { Colors } from '@/constants/colors';
import BinIcon from '../../assets/images/bin.png';
import ShareIcon from '../../assets/images/share.png';
import SaveIcon from '../../assets/images/save.png';
import SearchPhotoIcon from '../../assets/images/search-photo.png';
import SearchPrescriptionIcon from '../../assets/images/search-prescription.png'
import SearchResultScreen from './SearchResultScreen';
import axios from 'axios';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import LoadingDark from '@/components/loading/LoadingDark';
import { NGROK_API } from '@/app/api/ngrok';

type Props = {
    photo: CameraCapturedPicture;
    isUploadedImage: boolean;
    retakePhoto: () => void;
};

const fetchProductByName = async (productName: string): Promise<Product> => {
    const response = await axios.get(`${NGROK_API}/api/products/name/${productName}`);
    return response.data as Product;
};

const { width, height } = Dimensions.get('window');

const PhotoPreviewScreen: FC<Props> = ({ photo, isUploadedImage, retakePhoto }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [isPackageLoading, setIsPackageLoading] = useState(false);
    const [isPrescriptionLoading, setIsPrescriptionLoading] = useState(false);
    const [slideAnimation, setSlideAnimation] = useState(false);
    const slideAnim = useRef(new Animated.Value(height)).current;
    const queryClient = useQueryClient();

    const searchByPackageMutation = useMutation({
        mutationFn: async () => {
            setIsPackageLoading(true);
            try {
                const formData = new FormData();
                formData.append('image', {
                    uri: photo.uri,
                    type: 'image/jpeg',
                    name: 'photo.jpg',
                } as any);

                const predictResponse = await axios.post(`${NGROK_API}/api/predict/mobile`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                if (predictResponse.data && predictResponse.data.predicted_class) {
                    const predictedClass = predictResponse.data.predicted_class;
                    const product = await fetchProductByName(predictedClass);

                    return product;
                } else {
                    throw new Error('Prediction failed');
                }
            } catch (error) {
                console.error('Product not found');
            } finally {
                setIsPackageLoading(false);
            }
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['currentProduct'], data);
            queryClient.invalidateQueries({ queryKey: ['currentProduct'] });
            setSlideAnimation(true)
            slideUp();
        },
        onError: () => {
            alert('The product could not be found');
        },
    });

    const searchByPrescriptionMutation = useMutation({
        mutationFn: async () => {
            setIsPrescriptionLoading(true);
            try {
                const formData = new FormData();
                formData.append('image', {
                    uri: photo.uri,
                    type: 'image/jpeg',
                    name: 'photo.jpg',
                } as any);
                const shareResponse = await axios.post(`${NGROK_API}/api/prescribe`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                if (shareResponse.data && shareResponse.data.predicted_class) {
                    const predictedClass = shareResponse.data.predicted_class;
                    const product = await fetchProductByName(predictedClass);
                    return product;
                } else {
                    throw new Error('Share failed');
                }
            } catch (error) {
                console.error('Product not found');
            } finally {
                setIsPrescriptionLoading(false);
            }
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['currentProduct'], data);
            queryClient.invalidateQueries({ queryKey: ['currentProduct'] });
            setSlideAnimation(true);
            slideUp();
        },
        onError: () => {
            alert('The product could not be found');
        },
    });



    const slideUp = () => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const slideDown = () => {
        Animated.timing(slideAnim, {
            toValue: height,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const sharePhoto = async () => {
        if (photo?.uri) {
            try {
                await shareAsync(photo.uri);
            } catch (error) {
                console.error('Failed to share photo:', error);
            }
        }
    };

    const savePhoto = async () => {
        try {
            if (photo) {
                const asset = await MediaLibrary.createAssetAsync(photo.uri);
                const album = await MediaLibrary.getAlbumAsync('MedicinePhotos');
                if (!album) {
                    await MediaLibrary.createAlbumAsync('MedicinePhotos', asset, false);
                } else {
                    await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
                }
                alert('Photo saved successfully!');
            }
        } catch (error) {
            console.error('Failed to save photo:', error);
        }
    };

    const deletePhoto = () => {
        setModalVisible(true);
    };

    return (
        <View>
            <View style={styles.box}>
                <Image alt='image' source={{ uri: photo.uri }} style={{ width, height }} />
            </View>
            <View style={styles.optionButtonsContainer}>

                <TouchableOpacity onPress={sharePhoto} style={styles.optionButton}>
                    <View style={styles.iconWrap}>
                        <Image alt='image' source={ShareIcon} style={styles.optionIcon} contentFit='contain' />
                    </View>
                    <Text style={styles.optionButtonText}>Share</Text>
                </TouchableOpacity>
                {/* save button */}
                {!isUploadedImage && (
                    <TouchableOpacity onPress={savePhoto} style={[styles.optionButton, { position: 'absolute', top: -50, left: 10 }]}>
                        <View style={styles.iconWrap}>
                            <Image alt='image' source={SaveIcon} style={styles.optionIcon} contentFit='contain' />
                        </View>
                        <Text style={styles.optionButtonText}>Save</Text>
                    </TouchableOpacity>
                )}
                {/* from prescription button */}
                <TouchableOpacity onPress={() => searchByPrescriptionMutation.mutate()} style={styles.optionButtonMiddle}>
                    {isPrescriptionLoading ? (
                        <>
                            <View style={{ position: 'absolute', top: 17, left: 28, backgroundColor: 'transparent' }}>
                                <LoadingDark />
                            </View>
                            <Text style={[{ marginTop: -50, position: 'absolute', bottom: 23, left: 13 }, styles.optionButtonTextMiddle]}>Searching...</Text>
                        </>
                    ) : (
                        <>
                            <View style={styles.iconWrapMiddle}>
                                <Image alt='image' source={SearchPrescriptionIcon} style={styles.optionIconMiddle} contentFit='contain' />
                            </View>
                            <Text style={styles.optionButtonTextMiddle}>Prescription</Text>
                        </>
                    )}
                </TouchableOpacity>
                {/* from photo button */}
                <TouchableOpacity onPress={() => searchByPackageMutation.mutate()} style={styles.optionButtonMiddle}>
                    {isPackageLoading ? (
                        <>
                            <View style={{ position: 'absolute', top: 17, left: 28, backgroundColor: 'transparent' }}>
                                <LoadingDark />
                            </View>
                            <Text style={[{ marginTop: -50, position: 'absolute', bottom: 23, left: 13 }, styles.optionButtonTextMiddle]}>Searching...</Text>
                        </>
                    ) : (
                        <>
                            <View style={styles.iconWrapMiddle}>
                                <Image alt='image' source={SearchPhotoIcon} style={styles.optionIconMiddle} contentFit='contain' />
                            </View>
                            <Text style={styles.optionButtonTextMiddle}>Image</Text>
                        </>
                    )}
                </TouchableOpacity>
                <TouchableOpacity onPress={deletePhoto} style={styles.optionButton}>
                    <View style={styles.iconWrap}>
                        <Image alt='image' source={BinIcon} style={styles.optionIcon} contentFit='contain' />
                    </View>
                    <Text style={styles.optionButtonText}>Discard</Text>
                </TouchableOpacity>
            </View>

            {slideAnimation && (
                <Animated.View style={[styles.animatedView, { transform: [{ translateY: slideAnim }] }]}>
                    <SearchResultScreen
                        retakePhoto={retakePhoto}
                        slideDown={slideDown}
                    />
                </Animated.View>
            )}


            {modalVisible && (
                <ConfirmModal
                    question="Would you delete this?"
                    modalVisible={modalVisible}
                    setModalVisible={setModalVisible}
                    retakePhoto={retakePhoto}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    box: {
        width: '100%',
        height: '84%',
        justifyContent: 'center',
        alignItems: "center",
    },
    previewContainer: {
        width: '100%',
        height: '100%',
    },
    mirrorImage: {
        transform: [{ scaleX: -1 }],
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: "center",
        width: '100%',
    },

    headerIconWrap: {
        width: '100%',
        height: 35,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        padding: 10,
        marginTop: 20,
    },
    headerIconCover: {
        width: 35,
        height: 35,
        borderRadius: 50,
        backgroundColor: Colors.light.secondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeIcon: {
        width: 12,
        height: 12,
        backgroundColor: Colors.light.secondary,
    },
    optionButtonsContainer: {
        width: '100%',
        height: 118,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        marginHorizontal: 'auto',
        paddingVertical: 10,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 10,
    },
    optionButton: {
        width: 70,
        height: 70,
        backgroundColor: Colors.light.tint,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 'auto',
    },
    optionButtonMiddle: {
        width: 95,
        height: 95,
        backgroundColor: Colors.light.primary,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 'auto',
    },
    optionButtonTextMiddle: {
        color: Colors.light.text,
        fontSize: 16,
        fontWeight: '400',
        marginTop: 10,
    },
    optionButtonText: {
        color: '#002020',
        fontSize: 14,
        fontWeight: '400',
        marginTop: 10,
    },
    iconWrapMiddle: {
        width: 25,
        height: 25,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.light.primary,
    },
    iconWrap: {
        width: 17,
        height: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionIconMiddle: {
        width: 35,
        height: 35,
        marginLeft: 5,
    },
    optionIcon: {
        width: 17,
        height: 17,
        backgroundColor: Colors.light.tint,
    },
    animatedView: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '99%',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 10,
        zIndex: 20,
    },
});

export default PhotoPreviewScreen;