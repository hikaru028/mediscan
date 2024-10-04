import React, { useState, useEffect, useRef } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Button, StyleSheet, Text, TouchableOpacity, View, SafeAreaView } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/colors';
import Slider from '@react-native-community/slider';
import MinusIcon from '../../assets/images/minus.png';
import PlusIcon from '../../assets/images/plus.png';
import UploadIcon from '../../assets/images/upload.png';
import SwapIcon from '../../assets/images/swap.png';
import PhotoPreviewScreen from '../screens/PhotoPreviewScreen';

export default function CameraScreen() {
  const [zoom, setZoom] = useState(0);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<any>(null);
  const [isUploadedImage, setIsUploadedImage] = useState(false);
  const [canShowPreview, setCanShowPreview] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);

  if (!permission || !permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const takePhoto = async () => {
    setIsUploadedImage(false);
    if (!cameraRef.current) return;

    const options = {
      quality: 0.2,
      base64: false,
      exif: true,
    };

    const newPhoto = await cameraRef.current.takePictureAsync(options);
    if (newPhoto) {
      setPhoto(newPhoto);
      setCanShowPreview(true);
    } else {
      console.error("Failed to take photo");
    }
  };

  const uploadImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.4,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uploadedImage = result.assets[0];

      if (uploadedImage) {
        setIsUploadedImage(true);
        setPhoto(uploadedImage);
        setCanShowPreview(true);
      }
    }
  };


  const retakePhoto = () => {
    setPhoto(null);
    setIsUploadedImage(false);
    setCanShowPreview(false);
  };

  const swapCamera = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const handleZoomIncrement = () => {
    setZoom((zoom) => Math.min(zoom + 0.05, 1));
  };

  const handleZoomDecrement = () => {
    setZoom((zoom) => Math.max(zoom - 0.05, 0));
  };

  return (
    <SafeAreaView style={styles.container}>
      <CameraView style={styles.container} facing={facing} ref={cameraRef} zoom={zoom}>
        <View style={styles.buttonsCover}>
          <TouchableOpacity style={styles.swapButtonWrap} onPress={swapCamera}>
            <Image alt='image' source={SwapIcon} style={styles.icon} />
          </TouchableOpacity>

          <View style={styles.shootButtonWrap}>
            <TouchableOpacity onPress={takePhoto} style={styles.shootButton}></TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.uploadButtonWrap} onPress={uploadImage}>
            <Image alt='image' source={UploadIcon} style={styles.uploadIcon} />
          </TouchableOpacity>

          <View style={styles.zoomSliderContainer}>
            <TouchableOpacity onPress={handleZoomIncrement}>
              <View style={styles.zoomIconCover}>
                <Image alt='image' source={PlusIcon} style={styles.zoomIcon} contentFit='contain' />
              </View>
            </TouchableOpacity>
            <Slider
              style={styles.zoomSlider}
              minimumValue={0}
              maximumValue={1}
              value={zoom}
              onValueChange={(value) => setZoom(value)}
              minimumTrackTintColor="#85ccb8"
              maximumTrackTintColor="#d3d3d3"
            />
            <TouchableOpacity onPress={handleZoomDecrement}>
              <View style={styles.zoomIconCover}>
                <Image alt='image' source={MinusIcon} style={styles.zoomIcon} contentFit='contain' />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>

      {canShowPreview &&
        <PhotoPreviewScreen photo={photo} isUploadedImage={isUploadedImage} retakePhoto={retakePhoto} />
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#fff',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  swapButtonWrap: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 50,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  uploadButtonWrap: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 50,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  icon: {
    width: 18,
    height: 18,
  },
  uploadIcon: {
    width: 18,
    height: 18,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  zoomControls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 10,
  },
  zoomButton: {
    marginBottom: 10,
  },
  buttonsCover: {
    width: '100%',
    height: 'auto',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  shootButtonWrap: {
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: '#85ccb8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  shootButton: {
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: '#85ccb8',
    borderWidth: 2,
    borderColor: '#F5F8FB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    alignSelf: 'stretch',
    flex: 1,
  },
  zoomSliderContainer: {
    position: 'absolute',
    top: -130,
    right: 20,
    width: 40,
    height: 150,
    borderRadius: 50,
    backgroundColor: '#E2EBE9',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 'auto',
  },
  zoomSlider: {
    width: 80,
    height: 40,
    transform: [{ rotate: '-90deg' }],
  },
  zoomIconCover: {
    width: 20,
    height: 37,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomIcon: {
    width: 15,
    height: 15,
  },
});