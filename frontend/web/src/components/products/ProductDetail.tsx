'use client'

import { FC } from 'react'
import Image from 'next/image'
import { Product } from '@/components/products/ProductColumns'
import { DetailProduct } from '@/utils/index'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts'
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { motion } from 'framer-motion'
import { Button } from '../ui/button'
import CloseIcon from '../../../public/images/cross-W.png'

const ProductDetail: FC<ProductDetailProps> = ({ detailData, selectedProduct, onClose }) => {
    const detail = detailData.find(detail => detail.productId === selectedProduct.productId);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = monthNames[new Date().getMonth()];
    const currentYear = new Date().getFullYear();
    const currentStock = selectedProduct.stock;

    const stockData = [
        { date: 'Jan', stock: 150 },
        { date: 'Feb', stock: 138 },
        { date: 'Mar', stock: 102 },
        { date: 'Apr', stock: 97 },
        { date: 'May', stock: 56 },
        { date: 'Jun', stock: 39 },
        { date: 'Jul', stock: 26 },
        { date: 'Aug', stock: 11 },
        { date: 'Sep', stock: 0 },
        { date: 'Oct', stock: 0 },
        { date: 'Nov', stock: 0 },
        { date: 'Dec', stock: 0 },
    ].map(entry =>
        entry.date === currentMonth ? { ...entry, stock: currentStock } : entry
    );

    const getStockClassNames = (stock: number) => {
        if (stock >= 40) {
            return 'text-green-700 bg-green-200 border border-1 border-green-700';
        } else if (stock > 20) {
            return 'text-yellow-700 bg-yellow-200 border border-1 border-yellow-700';
        } else {
            return 'text-red-700 bg-red-200 border border-1 border-red-700';
        }
    };

    return (
        <motion.div
            initial={{ x: 2000, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 2000, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className='w-full h-full bg-table rounded-xl mt-3'
        >
            {/* Header */}
            <div className='w-full h-auto flex justify-between items-center'>
                {/* Close button */}
                <Button
                    className='w-6 h-6 rounded-full p-2 ml-5 bg-slate-400'
                    onClick={onClose}
                >
                    <Image src={CloseIcon} alt='close icon' width={15} height={15} />
                </Button>
                {/* Product name */}
                <h1 className='text-2xl my-3 px-5 border-b border-primary'>{selectedProduct.productName}</h1>
                <span></span>
            </div>

            {/* Detail section */}
            <div className='w-full flex justify-start items-center mt-2'>
                {/* Image */}
                <div className='w-1/5 h-32 bg-white p-2 rounded-xl flex justify-center items-center ml-5 mr-20 overflow-hidden'>
                    <Image src={`https://datawithimages.s3.ap-southeast-2.amazonaws.com/images/${selectedProduct.productId}.jpg`} alt={selectedProduct.productName} width={70} height={70} className='rounded-2xl' />
                </div>

                <div className='flex justify-center items-center gap-x-5'>
                    <div className='relative w-52 h-32 bg-background p-6 rounded-xl flex flex-col justify-center items-center border-l- border-impact overflow-hidden'>
                        <span className='absolute top-0 left-0 w-2 h-full bg-impact'></span>
                        <p className='text-md font-light mb-5'>Brand</p>
                        <p className='text-lg font-extrabold'>{selectedProduct.brandName || '-'}</p>
                    </div>

                    <div className='relative w-52 h-32 bg-background p-6 rounded-xl flex flex-col justify-center items-center border-l- border-impact overflow-hidden'>
                        <span className='absolute top-0 left-0 w-2 h-full bg-impact'></span>
                        <p className='text-md font-light mb-5'>Generic</p>
                        <p className='text-lg font-extrabold'>{selectedProduct.genericName || '-'}</p>
                    </div>

                    <div className='relative w-52 h-32 bg-background p-6 rounded-xl flex flex-col justify-center items-center border-l- border-impact overflow-hidden'>
                        <span className='absolute top-0 left-0 w-2 h-full bg-impact'></span>
                        <p className='text-md font-light mb-5'>Price</p>
                        <p className='text-lg font-extrabold'>${selectedProduct.price.toFixed(2) || '-'}</p>
                    </div>

                    <div className={`w-52 h-32 bg-background p-6 rounded-xl flex flex-col justify-center items-center ${getStockClassNames(stockData.find(entry => entry.date === currentMonth)?.stock || 0)}`}>
                        <p className='text-md font-light mb-5'>Current Stock</p>
                        {stockData.map((entry, index) => (
                            entry.date === currentMonth && (
                                <p key={`cell-${index}`} className='text-lg font-extrabold'>
                                    {currentStock}
                                </p>
                            )
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="w-full h-full flex px-3">
                <div className="w-3/5 h-full mt-5 mb-10 p-2">
                    {detail && (
                        <Tabs defaultValue="composition" className="w-full h-auto">
                            <TabsList className='w-full h-14 bg-transparent'>
                                <TabsTrigger value="composition" className='w-1/6 h-12 rounded-tl-3xl rounded-tr-lg bg-background'>Composition</TabsTrigger>
                                <TabsTrigger value="formulation" className='w-1/6 h-12 rounded-tl-3xl rounded-tr-lg bg-background'>Formulation</TabsTrigger>
                                <TabsTrigger value="usage" className='w-1/6 h-12 rounded-tl-3xl rounded-tr-lg bg-background'>Usage</TabsTrigger>
                                <TabsTrigger value="safety" className='w-1/6 h-12 rounded-tl-3xl rounded-tr-lg bg-background'>Safety</TabsTrigger>
                                <TabsTrigger value="regulatory" className='w-1/6 h-12 rounded-tl-3xl rounded-tr-lg bg-background'>Regulatory</TabsTrigger>
                                <TabsTrigger value="description" className='w-1/6 h-12 rounded-tl-3xl rounded-tr-lg bg-background'>Description</TabsTrigger>
                            </TabsList>

                            {/* Composition Tab */}
                            <TabsContent value="composition" className='w-full h-full'>
                                <div className='w-full h-[500px] bg-background p-6 rounded-3xl flex flex-col justify-center items-start gap-y-2'>
                                    <table className="w-full text-left table-fixed border-collapse">
                                        <tbody>
                                            <tr className="even:bg-muted/70 border-t border-gray-400">
                                                <td className="p-4 w-1/3 font-bold">Systemic Category</td>
                                                <td className="p-4 w-2/3 text-sm">{detail.systemicCategory || '-'}</td>
                                            </tr>
                                            <tr className="even:bg-muted/70 border-t border-gray-400">
                                                <td className="p-4 w-1/3 font-bold">Manufacturer</td>
                                                <td className="p-4 w-2/3 text-sm">{selectedProduct.manufacturer || '-'}</td>
                                            </tr>
                                            <tr className="even:bg-muted/70 border-t border-gray-400">
                                                <td className="p-4 w-1/3 font-bold">Since</td>
                                                <td className="p-4 w-2/3 text-sm">{selectedProduct.since || '-'}</td>
                                            </tr>
                                            <tr className="even:bg-muted/70 border-t border-gray-400">
                                                <td className="p-4 w-1/3 font-bold">Updated</td>
                                                <td className="p-4 w-2/3 text-sm">{selectedProduct.updated || '-'}</td>
                                            </tr>
                                            <tr className="even:bg-muted/70 border-t border-gray-400">
                                                <td className="p-4 w-1/3 font-bold">Therapeutic Class</td>
                                                <td className="p-4 w-2/3 text-sm">{detail.therapeuticClass || '-'}</td>
                                            </tr>
                                            <tr className="even:bg-muted/70 border-t border-gray-400">
                                                <td className="p-4 w-1/3 font-bold">Drug Class</td>
                                                <td className="p-4 w-2/3 text-sm">{detail.drugClass || '-'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </TabsContent>

                            {/* Formulation Tab */}
                            <TabsContent value="formulation" className='w-full h-full'>
                                <div className='w-full h-[500px] bg-background p-6 rounded-3xl flex flex-col justify-center items-start gap-y-2'>
                                    <table className="w-full text-left table-fixed border-collapse">
                                        <tbody>
                                            <tr className="even:bg-muted/70 border-t border-gray-400">
                                                <td className="p-4 w-1/3 font-bold">Active Ingredients</td>
                                                <td className="p-4 w-2/3 text-sm">{detail.activeIngredients || '-'}</td>
                                            </tr>
                                            <tr className="even:bg-muted/70 border-t border-gray-400">
                                                <td className="p-4 w-1/3 font-bold">Inactive Ingredients</td>
                                                <td className="p-4 w-2/3 text-sm">{detail.inactiveIngredients || '-'}</td>
                                            </tr>
                                            <tr className="even:bg-muted/70 border-t border-gray-400">
                                                <td className="p-4 w-1/3 font-bold">Formulation</td>
                                                <td className="p-4 w-2/3 text-sm">{detail.formulation || '-'}</td>
                                            </tr>
                                            <tr className="even:bg-muted/70 border-t border-gray-400">
                                                <td className="p-4 w-1/3 font-bold">Strength</td>
                                                <td className="p-4 w-2/3 text-sm">{detail.strength || '-'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </TabsContent>

                            {/* Usage Tab */}
                            <TabsContent value="usage" className='w-full h-full'>
                                <div className='w-full h-[500px] bg-background p-6 rounded-3xl flex flex-col justify-center items-start gap-y-2'>
                                    <table className="w-full text-left table-fixed border-collapse">
                                        <tbody>
                                            <tr className="even:bg-muted/70 border-t border-gray-400">
                                                <td className="p-4 w-1/3 font-bold">Target Population</td>
                                                <td className="p-4 w-2/3 text-sm">{detail.targetPopulation || '-'}</td>
                                            </tr>
                                            <tr className="even:bg-muted/70 border-t border-gray-400">
                                                <td className="p-4 w-1/3 font-bold">Dosage</td>
                                                <td className="p-4 w-2/3 text-sm">{detail.dosage || '-'}</td>
                                            </tr>
                                            <tr className="even:bg-muted/70 border-t border-gray-400">
                                                <td className="p-4 w-1/3 font-bold">Route of Administration</td>
                                                <td className="p-4 w-2/3 text-sm">{detail.routeOfAdministration || '-'}</td>
                                            </tr>
                                            <tr className="even:bg-muted/70 border-t border-gray-400">
                                                <td className="p-4 w-1/3 font-bold">Indications</td>
                                                <td className="p-4 w-2/3 text-sm">{detail.indications || '-'}</td>
                                            </tr>
                                            <tr className="even:bg-muted/70 border-t border-gray-400">
                                                <td className="p-4 w-1/3 font-bold">Contraindications</td>
                                                <td className="p-4 w-2/3 text-sm">{detail.contraindications || '-'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </TabsContent>

                            {/* Safety Tab */}
                            <TabsContent value="safety" className='w-full h-full'>
                                <div className='w-full h-[500px] bg-background p-6 rounded-3xl flex flex-col justify-center items-start gap-y-2'>
                                    <table className="w-full text-left table-fixed border-collapse">
                                        <tbody>
                                            <tr className="even:bg-muted/70 border-t border-gray-400">
                                                <td className="p-4 w-1/3 font-bold">Side Effects</td>
                                                <td className="p-4 w-2/3 text-sm">{detail.sideEffects || '-'}</td>
                                            </tr>
                                            <tr className="even:bg-muted/70 border-t border-gray-400">
                                                <td className="p-4 w-1/3 font-bold">Interactions</td>
                                                <td className="p-4 w-2/3 text-sm">{detail.interactions || '-'}</td>
                                            </tr>
                                            <tr className="even:bg-muted/70 border-t border-gray-400">
                                                <td className="p-4 w-1/3 font-bold">Warnings</td>
                                                <td className="p-4 w-2/3 text-sm">{detail.warnings || '-'}</td>
                                            </tr>
                                            <tr className="even:bg-muted/70 border-t border-gray-400">
                                                <td className="p-4 w-1/3 font-bold">Storage Conditions</td>
                                                <td className="p-4 w-2/3 text-sm">{detail.storageConditions || '-'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </TabsContent>

                            {/* Regulatory Tab */}
                            <TabsContent value="regulatory" className='w-full h-full'>
                                <div className='w-full h-[500px] bg-background p-6 rounded-3xl flex flex-col justify-center items-start gap-y-2'>
                                    <table className="w-full text-left table-fixed border-collapse">
                                        <tbody>
                                            <tr className="even:bg-muted/70 border-t border-gray-400">
                                                <td className="p-4 w-1/3 font-bold">Usage Duration</td>
                                                <td className="p-4 w-2/3 text-sm">{detail.usageDuration || '-'}</td>
                                            </tr>
                                            <tr className="even:bg-muted/70 border-t border-gray-400">
                                                <td className="p-4 w-1/3 font-bold">Approval Date</td>
                                                <td className="p-4 w-2/3 text-sm">{detail.approvalDate || '-'}</td>
                                            </tr>
                                            <tr className="even:bg-muted/70 border-t border-gray-400">
                                                <td className="p-4 w-1/3 font-bold">Expiry Date</td>
                                                <td className="p-4 w-2/3 text-sm">{detail.expiryDate || '-'}</td>
                                            </tr>
                                            <tr className="even:bg-muted/70 border-t border-gray-400">
                                                <td className="p-4 w-1/3 font-bold">Batch Number</td>
                                                <td className="p-4 w-2/3 text-sm">{detail.batchNumber || '-'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </TabsContent>

                            {/* Description Tab */}
                            <TabsContent value="description" className='w-full h-full'>
                                <div className='w-full h-[500px] bg-background p-6 rounded-3xl flex flex-col justify-center items-start gap-y-2'>
                                    <p className="p-4">{detail.description || '-'}</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                </div>

                {/* Bar chart */}
                <div className="w-2/5 max-h-[500px] bg-background p-3 rounded-3xl ml-5 mr-5 mt-24">
                    <div className='w-full flex justify-between px-3'>
                        <h2 className='w-full text-lg font-bold text-impact mb-2'>Stock Levels Over Time</h2>
                        <p className='text-lg font-light'>{currentYear}</p>
                    </div>

                    <ChartContainer config={chartConfig} className="w-[500px] h-[450px] pb-2">
                        <BarChart
                            accessibilityLayer
                            data={stockData}
                            layout="vertical"
                        >
                            <CartesianGrid horizontal={false} />
                            <YAxis
                                type="category"
                                dataKey="date"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <XAxis type="number" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="stock" radius={4} barSize={40}>
                                {stockData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.date === currentMonth ? '#85ccb8' : '#c9c9c9'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </div>
            </div>
        </motion.div >
    )
}

export default ProductDetail

interface ProductDetailProps {
    detailData: DetailProduct[]
    selectedProduct: Product
    onClose: () => void
}

const chartConfig = {
    stock: {
        label: "Stock",
        color: "#ffe978",
    },
} satisfies ChartConfig