'use client'

import { ColumnDef } from '@tanstack/react-table'
import { SortData } from '@/components'
import Image from 'next/image'

export type Product = {
    image: string;
    productId: string;
    productName: string;
    brandName: string;
    genericName: string;
    manufacturer: string;
    price: number;
    stock: number;
    since: string;
    updated: string;
}

const getStockClassNames = (stock: number) => {
    if (stock >= 40) {
        return 'text-green-700 bg-green-200 border border-1 border-green-700';
    } else if (stock > 20) {
        return 'text-yellow-700 bg-yellow-200 border border-1 border-yellow-700';
    } else {
        return 'text-red-700 bg-red-200 border border-1 border-red-700';
    }
};

export const columns: ColumnDef<Product>[] = [
    {
        accessorKey: "image",
        header: "",
        cell: ({ row }) => {
            return (
                <div className="w-24 h-14 flex justify-center items-center bg-background rounded-lg overflow-hidden">
                    <Image
                        src={`https://datawithimages.s3.ap-southeast-2.amazonaws.com/images/${row.original.productId}.jpg`}
                        alt={row.original.productName}
                        width={40}
                        height={40}
                        style={{ objectFit: 'cover' }}
                    />
                </div>
            );
        },
    },
    {
        accessorKey: "productId",
        header: ({ column }) => (
            <SortData column={column} title="PRODUCT ID" />
        ),
        cell: ({ row }) => (
            <div className="text-left">{row.getValue('productId')}</div>
        ),
    },
    {
        accessorKey: "productName",
        header: ({ column }) => (
            <SortData column={column} title="PRODUCT NAME" />
        ),
        cell: ({ row }) => (
            <div className="text-left">{row.getValue('productName')}</div>
        ),
    },
    {
        accessorKey: "brandName",
        header: ({ column }) => (
            <SortData column={column} title="BRAND" />
        ),
        cell: ({ row }) => (
            <div className="text-left">{row.getValue('brandName')}</div>
        ),
    },
    {
        accessorKey: "genericName",
        header: ({ column }) => (
            <SortData column={column} title="GENERIC" />
        ),
        cell: ({ row }) => (
            <div className="text-left">{row.getValue('genericName')}</div>
        ),
    },
    {
        accessorKey: "manufacturer",
        header: ({ column }) => (
            <SortData column={column} title="MANUFACTURER" />
        ),
        cell: ({ row }) => (
            <div className="text-left">{row.getValue('manufacturer')}</div>
        ),
    },
    {
        accessorKey: "price",
        header: ({ column }) => (
            <SortData column={column} title="PRICE" />
        ),
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('price'));
            const formatted = new Intl.NumberFormat("en-GB", {
                style: 'currency',
                currency: 'NZD',
            }).format(amount);

            return <div className="text-right">{formatted}</div>;
        },
    },
    {
        accessorKey: "stock",
        header: ({ column }) => (
            <SortData column={column} title="STOCK" />
        ),
        cell: ({ row }) => {
            const stock = row.getValue<number>('stock');
            const stockClassNames = getStockClassNames(stock);

            return (
                <div className={` h-11 flex justify-end items-center px-2 py-1 rounded-full ${stockClassNames}`}>
                    {stock}
                </div>
            );
        },
    },

];
