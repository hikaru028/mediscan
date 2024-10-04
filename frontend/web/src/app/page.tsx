'use client';

import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { LoadingHeartBeat } from '@/components';
import { useQuery } from '@tanstack/react-query';

const Home: FC = () => {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  const { data: authUser, isLoading } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/employees/me', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (!res.ok) throw new Error('Failed to fetch user');
        return data;
      } catch (error: any) {
        throw new Error('An unknown error occurred');
      }
    },
    retry: false,
  });

  useEffect(() => {
    const initializeApp = async () => {
      await new Promise((resolve) => setTimeout(resolve, 4000)); // Simulate loading
      setIsReady(true);
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (isReady) {
      if (authUser) {
        router.push('/dashboard');
      } else if (!isLoading) {
        router.push('/login');
      }
    }
  }, [isReady, authUser, isLoading, router]);

  if (!isReady || isLoading) {
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

  return null;
}

export default Home;
