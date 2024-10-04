"use client"

import { FC, useState, useEffect } from 'react';
import Image from 'next/image';
import { LanguageOption, LoginForm, LoadingHeartBeat } from '@/components';
import { useTheme } from "next-themes";

const LoginPage: FC = () => {
    const { theme, setTheme } = useTheme();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className='bg-custom-gradient w-full min-h-screen flex items-center justify-center relative'>
                <div className="flex flex-col items-center">
                    <Image src="/images/logo.png" alt="mediscan logo" width={74} height={86} />
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70px' }}>
                        <LoadingHeartBeat />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='bg-background w-full min-h-screen m-auto flex items-center justify-even'>

            {/* Left side: Login Picture */}
            <div className="w-3/5 min-h-screen flex items-center justify-center relative overflow-hidden">
                <Image
                    src="/images/login.png"
                    alt="Login Picture"
                    layout="fill"
                    objectFit="cover"
                    priority={true}
                    onLoad={() => setIsLoading(false)}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background"></div>
            </div>

            {/* Right side: Logo and Login Form */}
            <div className="relative w-2/5 min-h-screen flex flex-col items-center justify-center p-4">
                {/* Flag in the top-right corner */}
                {/* <div className='absolute top-2 right-8 m-4 py-2 px-4 rounded-lg hover:bg-gray-200 transition-all duration-300 cursor-pointer'>
                    <LanguageOption />
                </div> */}

                {/* Logo */}
                <div className="flex flex-col items-center mb-10">
                    <Image src="/images/logo-light.png" alt="logo" width={74} height={86} />
                </div>

                {/* Input Fields */}
                <LoginForm />
            </div>
        </div >
    );
}

export default LoginPage;