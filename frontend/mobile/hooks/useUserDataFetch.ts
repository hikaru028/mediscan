import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import axiosClient from '@/app/api/axiosClient';
import uuid from 'react-native-uuid';

export const fetchUserProfile = async () => {
    try {
        const token = await AsyncStorage.getItem('authToken');

        const response = await axiosClient.get('/customers/me');
        if (!response.data || !token) {
            console.warn('No user data found');
            return null;
        }
        return response.data;
    } catch (error) {
        return null;
    }
};

export const fetchCartItems = async () => {
    try {
        const cartId = await AsyncStorage.getItem('cart_id');

        if (!cartId) {
            console.error('Error fetching cart items: No cart ID found.');
            return { items: [] };
        }

        const response = await axiosClient.get(`/carts/view?cart_id=${cartId}`);
        if (!response.data || !response.data.items) {
            console.error('Error fetching cart items: No data found.');
            return { items: [] };
        }

        return response.data;
    } catch (error) {
        console.error('Failed to fetch cart items:', error);
        return { items: [] };
    }
};

export const fetchContacts = async () => {
    try {
        const tempUserId = await getOrCreateTemporaryUserId();

        const response = await axiosClient.get('/contacts', {
            headers: {
                'Temporary-UserId': tempUserId,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch contacts:', error);
        throw error;
    }
};

export const getOrCreateTemporaryUserId = async (): Promise<string> => {
    let tempUserId = await SecureStore.getItemAsync('temporary_user_id');
    if (!tempUserId) {
        const newUuid = uuid.v4() as string;
        tempUserId = newUuid;
        await SecureStore.setItemAsync('temporary_user_id', tempUserId);
    }
    return tempUserId;
};