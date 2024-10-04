'use client'

import { FC, useRef, useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { PiEyeLight, PiEyeSlashLight } from "react-icons/pi";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

type AuthUser = {
    employee_id: string;
    full_name: string;
    img_url: string;
};

const FormSchema = z.object({
    full_name: z.string().min(1, "Full Name is required"),
    old_password: z.string().min(6, "Password must be at least 6 characters"),
    new_password: z.string().min(6, "Password must be at least 6 characters"),
    img_url: z.string().url("Invalid image URL"),
});

const ProfileEditor: FC = () => {
    const { data: authUser } = useQuery<AuthUser>({ queryKey: ['authUser'] });
    const [visibleOldPassword, setVisibleOldPassword] = useState<boolean>(false);
    const [visibleNewPassword, setVisibleNewPassword] = useState<boolean>(false);
    const [fullName, setFullName] = useState(authUser?.full_name);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [imageUri, setImageUri] = useState(authUser?.img_url || '/images/default-avatar.png');
    const profileImgRef = useRef<HTMLInputElement>(null);
    const toast = useToast();
    const queryClient = useQueryClient();

    const { mutate: updateMutation } = useMutation({
        mutationFn: async (formData: z.infer<typeof FormSchema>) => {
            const res = await fetch('/api/employees/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include',
            });

            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error || 'Failed to update profile');
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['authUser'] });
            toast.toast({
                title: 'Profile Updated',
                description: 'Your profile has been successfully updated.',
            });
        },
        onError: (error: any) => {
            toast.toast({
                title: 'Error',
                description: error.message,
            });
        },
    });

    const handleSaveProfile = async () => {
        try {
            const parsedData = FormSchema.parse({
                full_name: fullName,
                old_password: oldPassword,
                new_password: newPassword,
                img_url: imageUri,
            });
            updateMutation(parsedData);
        } catch (error: any) {
            throw new Error('Failed to update profile');
        }
    };

    const handleImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageUri(URL.createObjectURL(file));
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <span className='text-sm'>Edit Profile</span>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <div className="w-full flex py-4 justify-center items-start">
                    <div className='flex justify-center items-center mr-6'>
                        <div className='absolute flex justify-center items-center gap-x-5 z-10'>
                            <div className='w-[60px] h-[60px] rounded-full bg-primary/70 flex justify-center items-center cursor-pointer' onClick={() => profileImgRef.current?.click()}>
                                <Image src='/images/plus.png' alt="Plus" width={15} height={15}></Image>
                            </div>
                            <input
                                type='file'
                                hidden
                                accept='image/*'
                                ref={profileImgRef}
                                id='profileImage'
                                name='profileImage'
                                onChange={handleImgChange}
                            />
                        </div>
                        <div className='w-[60px] h-[60px] rounded-full z-0 flex justify-center items-center'>
                            <Image src={imageUri} alt="Avatar" width={60} height={60} className='rounded-full object-cover' />
                        </div>
                    </div>
                    <div className='w-full'>
                        <span className='w-full h-12 mb-4'>Employee number: {authUser?.employee_id}</span>
                        <Input id="name" type='text' placeholder='Full Name' className="mt-4" value={fullName || authUser?.full_name} onChange={(e) => setFullName(e.target.value)} />
                        <div className="relative">
                            <Input id="password" name='password' type={visibleOldPassword ? 'text' : 'password'} placeholder='Old Password' className="mt-4" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer">
                                {visibleOldPassword ? <PiEyeLight onClick={() => setVisibleOldPassword(!visibleOldPassword)} /> : <PiEyeSlashLight onClick={() => setVisibleOldPassword(!visibleOldPassword)} />}
                            </div>
                        </div>
                        <div className="relative">
                            <Input id="newPassword" name='newPassword' type={visibleNewPassword ? 'text' : 'password'} placeholder='New Password' className="mt-4" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer">
                                {visibleNewPassword ? <PiEyeLight onClick={() => setVisibleNewPassword(!visibleNewPassword)} /> : <PiEyeSlashLight onClick={() => setVisibleNewPassword(!visibleNewPassword)} />}
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSaveProfile}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ProfileEditor;