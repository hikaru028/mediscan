'use client';

import { FC, ReactNode, useState } from 'react';
import { ThemeProvider } from '@/components';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion } from 'framer-motion';

const variants = {
    hidden: { opacity: 0 },
    enter: { opacity: 1 },
};

const ClientLayout: FC<{ children: ReactNode }> = ({ children }) => {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
            },
        },
    }));

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
        >
            <QueryClientProvider client={queryClient}>
                <motion.main
                    variants={variants}
                    initial='hidden'
                    animate='enter'
                    transition={{ type: 'linear', delay: 0.2, duration: 0.3 }}
                >
                    {children}
                </motion.main>
                <Toaster />
            </QueryClientProvider>
        </ThemeProvider>
    );
};

export default ClientLayout;
