export type Profile = {
    id: number;
    fullName: string;
    ethnicity: string;
    gender: string;
    dob: string;
    phone: number;
    email: string;
    address: string;
}

export type Emergency = {
    id: number;
    name: string;
    address: string;
    phone: string;
}

export type Cart = {
    id: number;
    customerId: number;
    createdAt: string;
    updatedAt: string;
    items: CartItem[];
}

export type CartItem = {
    id: number;
    cartId: number;
    productId: string;
    brandName: string;
    genericName: string;
    imgUrl: string;
    quantity: number;
    priceAtPurchase: number;
    createdAt: string;
    updatedAt: string;
    product: Product;
}

export type Order = {
    id: number;
    orderNumber: string;
    customerId: number;
    totalPrice: number;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
}

export type OrderItem = {
    id: number;
    orderId: number;
    productId: string;
    productName: string;
    quantity: number;
    priceAtPurchase: number;
    createdAt: string;
    updatedAt: string;
}

export type Product = {
    id: string;
    productId: string;
    productName: string;
    brandName: string;
    genericName: string;
    manufacturer: string;
    price: number;
    stock: number;
    since: string;
    updated: string;
    activeIngredients: string;
    inactiveIngredients: string;
    therapeuticClass: string;
    formulation: string;
    systemicCategory: string;
    usageDuration: string;
    targetPopulation: string;
    drugClass: string;
    strength: string;
    dosage: string;
    routeOfAdministration: string;
    indications: string;
    contraindications: string;
    sideEffects: string;
    interactions: string;
    warnings: string;
    storageConditions: string;
    approvalDate: string;
    expiryDate: string;
    batchNumber: string;
    description: string;
    images: any[];
}