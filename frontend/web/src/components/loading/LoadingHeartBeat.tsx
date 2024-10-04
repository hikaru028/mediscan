'use client';

import { FC } from 'react';
import dynamic from 'next/dynamic';
import animationData from '../../../public/loading.json';

interface LottieAnimationProps {
    loop?: boolean;
    autoplay?: boolean;
    width?: number;
    height?: number;
    className?: string;
}

const DynamicLottie = dynamic(() => import('react-lottie-player'), {
    ssr: false,
});

const LoadingHeartBeat: FC<LottieAnimationProps> = ({
    loop = true,
    autoplay = true,
    width = 150,
    height = 150,
    className,
}) => {
    return (
        <div
            style={{ width: `${width}px`, height: `${height}px` }}
            className={className}
        >
            <DynamicLottie
                loop={loop}
                animationData={animationData}
                play={autoplay}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
};

export default LoadingHeartBeat;