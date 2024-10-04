import React, { useState, useEffect, FC } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '@/app/api/axiosClient';
import { useNavigation } from '@react-navigation/native';
import Loading from '@/components/loading/Loading'
import { fetchUserProfile } from '@/hooks/useUserDataFetch';
import ProfileEditorScreen from '@/app/screens/ProfileEditorScreen';
import LoginScreen from '@/app/screens/LoginScreen';
import { NavigationProps } from '@/utils/navi-props';
import { Colors } from '@/constants/colors';
import { Profile } from '@/utils/index';
import UserIcon from '@/assets/images/user2.png';
import EthnicityIcon from '@/assets/images/ethnicity2.png';
import GenderIcon from '@/assets/images/gender2.png';
import DobIcon from '@/assets/images/dob2.png';
import PhoneIcon from '@/assets/images/mobile2.png';
import EmailIcon from '@/assets/images/email2.png';
import AddressIcon from '@/assets/images/location2.png';
import CloseIcon from '@/assets/images/close.png'

const ProfileScreen: FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await axiosClient.post('/customers/logout', {});

        await SecureStore.deleteItemAsync('authToken');
        await SecureStore.deleteItemAsync('customerInfo');
        await SecureStore.deleteItemAsync('paymentInfo');

        await AsyncStorage.clear();
      } catch (error) {
        throw new Error('Failed to logout');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authUser'] });
      queryClient.invalidateQueries();
      queryClient.clear();
      // Force re-fetch or reset query state
      queryClient.setQueryData(['authUser'], null);
      queryClient.refetchQueries({ queryKey: ['authUser'] });
    },
    onError: () => {
      alert('Failed to logout. Please try again.');
    }
  });

  const { data: authUser, isLoading } = useQuery<Profile>({
    queryKey: ['authUser'],
    queryFn: fetchUserProfile,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {

  }, [authUser]);

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'logout', onPress: () => logoutMutation.mutate() },
      ]
    );
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
  };

  const handleClose = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Loading />
      </SafeAreaView>
    );
  }

  if (!authUser) {
    return <LoginScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity style={isEditing ? styles.bgWhite : styles.closeButton} onPress={handleClose}>
        <Image source={CloseIcon} style={styles.closeIcon} alt='image' contentFit='contain' />
      </TouchableOpacity>

      <Text style={styles.headerText}>Personal Information</Text>
      <TouchableOpacity onPress={handleEditProfile} style={styles.editProfileButton}>
        <TouchableOpacity
          onPress={handleEditProfile}
          style={styles.editProfileButton}
          accessibilityLabel="Edit Profile"
          accessibilityRole="button"
        >
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Image source={UserIcon} style={styles.icon} alt='image' contentFit='contain' />
          <Text style={styles.infoText}>{authUser.fullName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Image source={EthnicityIcon} style={styles.icon} alt='image' contentFit='contain' />
          <Text style={styles.infoText}>{authUser.ethnicity}</Text>
        </View>
        <View style={styles.infoRow}>
          <Image source={GenderIcon} style={styles.icon} alt='image' contentFit='contain' />
          <Text style={styles.infoText}>{authUser.gender}</Text>
        </View>
        <View style={styles.infoRow}>
          <Image source={DobIcon} style={styles.icon} alt='image' contentFit='contain' />
          <Text style={styles.infoText}>
            {authUser.dob ? new Date(authUser.dob).toLocaleDateString() : ''}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Image source={PhoneIcon} style={styles.icon} alt='image' contentFit='contain' />
          <Text style={styles.infoText}>{authUser.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Image source={EmailIcon} style={styles.icon} alt='image' contentFit='contain' />
          <Text style={styles.infoText}>{authUser.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Image source={AddressIcon} style={styles.icon} alt='image' contentFit='contain' />
          <Text style={styles.infoText}>{authUser.address}</Text>
        </View>
        {/* Logout button */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Render editor screen */}
      {isEditing && (
        <ProfileEditorScreen
          authUser={authUser}
          onSave={handleSaveProfile}
          onClose={() => setIsEditing(false)}
        />
      )}
    </SafeAreaView>
  );
}

export default ProfileScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    color: Colors.light.text,
    zIndex: 1,
  },
  headerText: {
    fontSize: 22,
    fontFamily: '500',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 50,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    backgroundColor: '#E6E6E6',
  },
  bgWhite: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 50,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    backgroundColor: '#FFF',
  },
  closeIcon: {
    width: 12,
    height: 12,
  },
  infoContainer: {
    width: '85%',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 0,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginHorizontal: 0,
    paddingTop: 30,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomColor: '#E6E6E6',
    borderBottomWidth: 1,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 30,
  },
  infoText: {
    fontSize: 18,
    fontFamily: '300',
    width: '90%',
    color: Colors.light.text,
  },
  editProfileButton: {
    width: '100%',
    marginTop: 0,
    marginRight: 30,
    padding: 10,
  },
  editProfileText: {
    fontSize: 18,
    fontFamily: '300',
    color: '#4d68b0',
    textAlign: 'right',
    textDecorationLine: 'underline',
  },
  logoutButton: {
    width: '100%',
    marginTop: 20,
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: '#E6E6E6',
    borderRadius: 10,
  },
  logoutText: {
    fontSize: 18,
    fontFamily: '400',
    color: Colors.light.text,
    textAlign: 'center',
  },
});