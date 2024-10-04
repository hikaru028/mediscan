'use client'

import { FC, useState } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input';
import { useToast } from '../ui/use-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { CiTrash } from "react-icons/ci"

type AuthUser = {
    employee_id: string;
};

const DeleteAccountModal: FC = () => {
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { data: authUser } = useQuery<AuthUser>({ queryKey: ['authUser'] });
    const queryClient = useQueryClient();
    const router = useRouter();

    const { mutate: deleteMutation } = useMutation({
        mutationFn: async (formData: { employee_id: string; password: string }) => {
            try {
                const res = await fetch(`/api/employees/delete/${formData.employee_id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: formData.password }),
                    credentials: 'include',
                });

                const data = await res.json();
                if (!res.ok || data.error) throw new Error(data.error || 'Failed to delete account');
                return data;
            } catch (error: any) {
                throw new Error(error.message || 'An unknown error occurred');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['authUser'] });
            toast({
                title: 'Account Deleted',
                description: 'Your account has been successfully deleted.',
            });
            setTimeout(() => {
                router.push('/signup');
            }, 2000);
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.message,
            });
            setIsLoading(false);
        },
    });

    const handleDeleteAccount = () => {
        if (!password) {
            toast({
                title: 'Error',
                description: 'Please enter your password.',
            });
            return;
        }

        setIsLoading(true);

        const formData = {
            employee_id: authUser?.employee_id || '',
            password,
        };

        deleteMutation(formData);
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <div className='flex items-center gap-x-2 cursor-pointer'>
                    <CiTrash className='w-5 h-auto text-[#ff4949]' />
                    <span className='text-sm text-[#ff4949] capitalize'>delete account</span>
                </div>
            </AlertDialogTrigger>
            <AlertDialogContent>
                {/* Header and description */}
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove your data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                    <Input
                        id="password"
                        type='password'
                        name='password'
                        placeholder='Password'
                        className="mt-4 border border-[#ff4949]"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} disabled={isLoading} className='bg-[#ff4949] hover:bg-[#ff4949]/80'>
                        {isLoading ? 'Processing...' : 'Continue'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteAccountModal;