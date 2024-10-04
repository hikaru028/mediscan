import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '@/app/api/axiosClient';
import { Order } from '@/utils';

export const fetchOrders = async (): Promise<Order[]> => {
    try {
        const response = await axiosClient.get(`/orders`);

        if (!response.data) {
            console.error('Error fetching order histories');
            return [];
        }

        return response.data.orders;
    } catch (error) {
        console.error('Failed to fetch order histories:', error);
        throw error;
    }
};
