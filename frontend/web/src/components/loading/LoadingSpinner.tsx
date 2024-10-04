import { FC } from 'react';
import { Spinner } from '@/components/ui/spinner';

type Props = {
    color: string;
}

const LoadingSpinner: FC<Props> = ({ color }) => {
    return (
        <div className="flex items-center">
            <Spinner className={`text-${color} w-6 h-6`}></Spinner>
        </div>
    );
};

export default LoadingSpinner;