import { FC, MouseEvent } from 'react'
import { useRouter } from 'next/navigation';
import { PopoverContent } from '@/components/ui/popover'
import { useToast } from '../ui/use-toast'
import { DeleteAccountModal, ProfileEditor } from '@/components'
import { CiLogout, CiEdit } from "react-icons/ci"
import { useQueryClient, useMutation } from '@tanstack/react-query'

const AccountModal: FC = () => {
    const { toast } = useToast()
    const router = useRouter();
    const queryClient = useQueryClient();

    const { mutate: logoutMutation } = useMutation({
        mutationFn: async () => {
            try {
                const res = await fetch('/api/employees/logout', {
                    method: 'POST'
                })

                const data = await res.json();
                if (!res.ok || data.error) throw new Error(data.error || 'Failed to logout');

            } catch (error) {
                throw new Error('An unknown error occurred');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['authUser'] });
            router.push('/login');
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: 'logout failed',
            });
        },
    })

    const handleLogout = (e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        logoutMutation()
    }

    return (
        <PopoverContent className='flex flex-col justify-start items-start ml-8 rounded-2xl'>
            {/* Profile Editor */}
            <div
                className='w-full flex gap-x-3 hover:bg-secondary p-4 rounded-lg transition-all duration-200 cursor-pointer'
            >
                <CiEdit className='w-5 h-auto' />
                <ProfileEditor />
            </div>
            <span className='w-full h-[1px] bg-secondary rounded-lg my-1'></span>
            {/* Logout */}
            <div
                onClick={handleLogout}
                className='w-full flex gap-x-3 hover:bg-secondary p-4 rounded-lg transition-all duration-200 cursor-pointer'
            >
                <CiLogout className='w-5 h-auto' />
                <span className='text-sm capitalize'>logout</span>
            </div>
            <span className='w-full h-[1px] bg-secondary rounded-lg my-1'></span>
            {/* Delete account */}
            <div
                className='w-full flex gap-x-3 hover:bg-[#ff4949]/30 p-4 rounded-lg transition-all duration-200 cursor-pointer'
            >
                <DeleteAccountModal />
            </div>
        </PopoverContent>
    )
}

export default AccountModal