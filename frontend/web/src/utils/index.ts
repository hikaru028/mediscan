import { Product } from '@/components/products/ProductColumns'

export interface DetailProduct {
    productId: string
    activeIngredients: string
    inactiveIngredients: string
    therapeuticClass: string
    formulation: string
    systemicCategory: string
    usageDuration: string
    targetPopulation: string
    drugClass: string
    strength: string
    dosage: string
    routeOfAdministration: string
    indications: string
    contraindications: string
    sideEffects: string
    interactions: string
    warnings: string
    storageConditions: string
    approvalDate: string
    expiryDate: string
    batchNumber: string
    description: string
}

export const getData = async (): Promise<Product[]> => {
    try {
        const response = await fetch('/api/products/all');
        if (!response.ok) {
            throw new Error(`Error fetching products: ${response.statusText}`);
        }
        const data: Product[] = await response.json();
        console.dir(data, { depth: null });
        return data;
    } catch (error) {
        console.error('Failed to fetch product data:', error);
        return [];
    }
};

export const getDetailData = async (): Promise<DetailProduct[]> => {
    try {
        const response = await fetch('/api/products/detail');
        if (!response.ok) {
            throw new Error(`Error fetching product details: ${response.statusText}`);
        }
        const data: DetailProduct[] = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch product details:', error);
        return [];
    }
};
