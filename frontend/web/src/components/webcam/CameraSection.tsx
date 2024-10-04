'use client'

import React, { FC, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { Product } from '@/components/products/ProductColumns'
import { LoadingSpinner } from '@/components'
import { dataURLToBlob } from 'blob-util';
import SearchIcon from '../../../public/images/search-W.png';
import DetailIcon from '../../../public/images/detail-W.png';
import DeleteIcon from '../../../public/images/trash-W.png';
import CloseIcon from '../../../public/images/cross.png'
import CloseIconW from '../../../public/images/cross-W.png'
import { useTheme } from 'next-themes'

interface DataTableProps {
    onRowClick: (row: Product) => void
    data: Product[]
}

interface PredictionResult {
    predictions: string;
}

const CameraSection: FC<DataTableProps> = ({ onRowClick, data }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const photoRef = useRef<HTMLCanvasElement | null>(null)
    const [tookPhoto, setTookPhoto] = useState<boolean>(false)
    const [hasFound, setHasFound] = useState<boolean>(false)
    const [clearImage, setClearImage] = useState<boolean>(true)
    const [foundProduct, setFoundProduct] = useState<Product | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [productName, setProductName] = useState<string>('');
    const { theme } = useTheme();
    const defaultImageUrl = 'https://datawithimages.s3.ap-southeast-2.amazonaws.com/logos/default-product.png';



    useEffect(() => {
        const getUserCamera = async () => {
            setHasFound(false)
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
            }
        }

        getUserCamera();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        }
    }, [videoRef]);



    const takePhoto = () => {
        setClearImage(false)
        if (!videoRef.current || !photoRef.current) return;

        const width = 500;
        const height = width / (16 / 9);
        const photo = photoRef.current;
        const video = videoRef.current;
        photo.width = width;
        photo.height = height;
        const ctx = photo.getContext('2d');
        if (ctx) {
            // ctx.translate(photo.width, 0);
            // ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0, photo.width, photo.height);
        }
        const imageUri = photo.toDataURL('image/png');

        setTookPhoto(true);
    };

    const searchImage = async () => {
        setIsLoading(true);
        try {
            if (photoRef.current) {
                const imageUrl = photoRef.current.toDataURL('image/png');
                const blob = dataURLToBlob(imageUrl);
                const formData = new FormData();
                formData.append('image', blob, 'image.png');
                const response = await fetch('http://127.0.0.1:5000/api/predict', {
                    method: 'POST',
                    body: formData,
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const result = await response.json();
                console.log("result:::: ", result);

                setHasFound(true)
                if (result.message === '1') {
                    setTookPhoto(false);
                }
                else {
                    const matchedProduct = result;
                    console.log(matchedProduct);
                    setFoundProduct(matchedProduct);
                    setProductName(result.productName);
                    setHasFound(true);
                    setIsLoading(false);
                }

                setTookPhoto(false);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }

    };

    const seeProductDetail = () => {
        if (foundProduct) {
            onRowClick(foundProduct);
        }
    };

    const deleteCurrentImage = () => {
        setClearImage(true);
        setHasFound(false);
        setTookPhoto(false);
        setFoundProduct(null);
        if (photoRef.current) {
            const ctx = photoRef.current.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, photoRef.current.width, photoRef.current.height);
            }
        }
    };

    return (
        <div className='w-full h-screen bg-table flex flex-col justify-center items-center p-5'>
            <div className='relative w-2/3 h-auto'>
                <div className='w-full flex justify-center items-center m-0 z-20'>
                    <video
                        className='container w-full h-full'
                        ref={videoRef}
                        style={{ transform: 'scaleX(-1)' }}
                    ></video>
                </div>
                <div className='absolute top-0 left-0 w-full h-full flex justify-center items-center px-8 z-30'>
                    <div className='w-full h-full flex flex-col justify-between overflow-hidden'>
                        <div className=' w-full h-full flex justify-center items-center'>
                            <canvas ref={photoRef} className='w-full h-full transform scale-x-[-1]'></canvas>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className='absolute top-0 left-0 w-full h-full p-4 flex flex-col justify-center items-center bg-background z-50'>
                        <LoadingSpinner color='impact' />
                    </div>
                ) : (
                    (hasFound || foundProduct) && (
                        <div className='absolute top-0 left-0 w-full h-full p-4 flex flex-col justify-center items-center bg-background z-50'>
                            <div className='absolute top-5 right-10 w-9 h-9 p-3 rounded-full bg-table flex justify-center items-center cursor-pointer' onClick={deleteCurrentImage}>
                                <Image src={theme === 'dark' ? CloseIconW : CloseIcon} alt='icon' width={20} height={20} />
                            </div>
                            <div className='w-full h-auto flex flex-col justify-center items-center'>
                                <div className='w-42 h-42 mb-10 flex justify-center items-center overflow-hidden'>
                                    <Image src={`https://datawithimages.s3.ap-southeast-2.amazonaws.com/images/${foundProduct?.productId}.jpg` || defaultImageUrl} alt='image' width={80} height={80} />
                                </div>
                                <div className='w-1/2 flex flex-col justify-center items-start'>
                                    <h3 className='text-lg font-semibold'>{foundProduct?.productName}</h3>
                                    <p><strong>ID:</strong> {foundProduct?.productId}</p>
                                    <p><strong>Brand:</strong> {foundProduct?.brandName}</p>
                                    <p><strong>Generic:</strong> {foundProduct?.genericName}</p>
                                    <p><strong>Manufacturer:</strong> {foundProduct?.manufacturer}</p>
                                    <p><strong>Price:</strong> ${foundProduct?.price.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className='w-40 h-14 flex justify-center items-center p-2 mt-5 rounded-full bg-impact hover:bg-impact/80' onClick={seeProductDetail}>
                                <Image src={DetailIcon} alt='icon' width={15} height={15} className='mr-1' />
                                <Button
                                    size='sm'
                                    className='text-white bg-transparent hover:bg-transparent'
                                >
                                    See more
                                </Button>
                            </div>
                        </div>
                    )
                )}
            </div>
            <div className='w-2/3 h-24 flex justify-center items-center bg-background rounded-full my-5'>
                {tookPhoto ? (
                    <div className='w-full flex justify-evenly'>
                        {/* Search */}
                        <div
                            className={`w-20 h-20 flex flex-col justify-center items-center p-2 rounded-full ${hasFound ? 'bg-impact/80 hover:bg-impact/80 cursor-not-allowed' : 'bg-impact hover:bg-impact/80'}`}
                            onClick={searchImage}
                        >
                            {isLoading ? '' : <Image src={SearchIcon} alt='icon' width={20} height={20} className='mt-2 -mb-1' />}
                            <Button
                                size='sm'
                                disabled={!tookPhoto || isLoading || hasFound}
                                className='text-white bg-transparent hover:bg-transparent'>
                                {isLoading ? 'Searching' : 'Search'}
                            </Button>
                        </div>
                        {(tookPhoto || hasFound) && (
                            <div
                                className={`w-20 h-20 flex flex-col justify-center items-center p-2 rounded-full ${isLoading ? 'bg-muted cursor-not-allowed' : 'bg-[#757575] hover:bg-[#757575]/80'}`}
                                onClick={deleteCurrentImage}
                            >
                                <Image src={DeleteIcon} alt='icon' width={20} height={20} className='mt-2 -mb-1' />
                                <Button
                                    size='sm'
                                    disabled={isLoading}
                                    className='text-white bg-transparent hover:bg-transparent'>
                                    Delete
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={`w-20 h-20 flex items-center justify-center rounded-full border-4 group ${clearImage ? 'border-impact group-hover:border-impact/80' : 'border-muted cursor-not-allowed'}`}>
                        <Button
                            size='sm'
                            onClick={clearImage ? takePhoto : undefined}
                            disabled={isLoading || !clearImage}
                            className={`rounded-full w-16 h-16 p-2 ${clearImage ? 'bg-impact group-hover:bg-impact/80 cursor-pointer' : 'bg-muted cursor-not-allowed'}`}
                        />
                    </div>
                )}
            </div>
        </div >
    )
}

export default CameraSection