import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '@/app/api/axiosClient';
import { Product } from '@/utils';

export const fetchProducts = async () => {
    try {
        const response = await axiosClient.get(`/products/mobile/all`);

        if (!response.data || !response.data.items) {
            console.error('Error fetching products: No data found.');
            return { items: [] };
        }

        return response.data.items;
    } catch (error) {
        console.error('Failed to fetch products:', error);
        throw error;
    }
};

export const fetchProduct = async (productName: string): Promise<Product | null> => {
    try {
        const response = await axiosClient.get(`/products/name/${productName}`);

        if (!response.data) {
            console.error('Error fetching the product: No data found.');
            return null;
        }

        return response.data;
    } catch (error) {
        console.error('Failed to fetch the product:', error);
        return null;
    }
};

export const fetchEachProduct = async (page: number, pageSize: number): Promise<Product[]> => {
    try {
        const response = await axiosClient.get(`/products?page=${page}&pageSize=${pageSize}`);

        if (!response.data) {
            console.error('Error fetching products: No data found.');
            return [];
        }

        return response.data;
    } catch (error) {
        console.error('Failed to fetch products:', error);
        throw error;
    }
};