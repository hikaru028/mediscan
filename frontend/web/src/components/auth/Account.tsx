import { FC } from 'react'
import { ProfileEditor, AccountModal } from '@/components'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverTrigger } from '@/components/ui/popover'
import { useQuery } from '@tanstack/react-query'

const Account: FC = () => {
    const { data: authUser } = useQuery({
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
            } catch (error) {
                throw new Error('An unknown error occurred');
            }
        },
        retry: false,
    });

    return (
        <Popover>
            <PopoverTrigger className='w-full flex flex-col border-background p-2 hover:bg-tint rounded-lg cursor-pointer'>
                <div className='flex'>
                    <Avatar className='w-10 h-10 bg-cover'>
                        <AvatarImage src={authUser?.imgUrl || '/images/avatar.png'} alt="Avatar" />
                        <AvatarFallback>MS</AvatarFallback>
                    </Avatar>
                    <div className='w-full flex flex-col justify-center items-start ml-1'>
                        <span className='text-sm font-medium'>{authUser?.full_name || 'username'}</span>
                        <span className='text-xs font-normal'>{authUser?.employee_id || '00000000000'}</span>
                    </div>
                </div>
            </PopoverTrigger>
            <AccountModal />
        </Popover>
    )
}

export default Account