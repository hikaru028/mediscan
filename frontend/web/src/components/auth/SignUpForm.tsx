"use client";

import { FC, useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components';
import { PiEyeLight, PiEyeSlashLight } from "react-icons/pi";
import { useTheme } from 'next-themes';

const FormSchema = z.object({
    employee_id: z.string().min(5, {
        message: "Employee ID must be at least 5 characters",
    }),
    full_name: z.string().min(1, {
        message: "Full name is required",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters",
    }),
});

const SignUpForm: FC = () => {
    const { theme, setTheme } = useTheme();
    const [canSubmit, setCanSubmit] = useState<boolean>(false);
    const [visible, setVisible] = useState<boolean>(false);
    const router = useRouter();
    const toast = useToast();
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            employee_id: "",
            full_name: "",
            password: "",
        },
    });

    const { mutate: signUpMutation, isError, isPending, error } = useMutation({
        mutationFn: async (formData: z.infer<typeof FormSchema>) => {
            try {
                const res = await fetch('/api/employees/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                    credentials: 'include',
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    if (res.headers.get('content-type')?.includes('application/json')) {
                        const errorData = JSON.parse(errorText);
                        throw new Error(errorData.error || 'Failed to create an account');
                    } else {
                        throw new Error(errorText || 'Failed to create an account');
                    }
                }

                const data = await res.json();
                return data;
            } catch (error) {
                throw new Error('An unknown error occurred');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['authUser'] });
            router.push('/dashboard');
        },
        onError: (error: any) => {
            toast.toast({
                title: 'Error',
                description: error.message,
            });
        },
    });

    const handleSubmit = (formData: z.infer<typeof FormSchema>) => {
        signUpMutation(formData);
    };

    const handlePassword = () => {
        setVisible(!visible);
    };

    useEffect(() => {
        const subscription = form.watch((value) => {
            const { employee_id, full_name, password } = value;
            setCanSubmit(!!employee_id && !!full_name && !!password);
        });
        return () => subscription.unsubscribe();
    }, [form]);

    return (
        <div className="flex flex-col items-center w-[274px] max-w-sm gap-y-4">
            <span className='text-2xl font-bold mt-4'>Sign Up</span>
            <Form {...form}>
                <form className="w-full flex flex-col gap-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
                    <FormField
                        control={form.control}
                        name="employee_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input id='employeeId' placeholder="Employee ID" type='text' className='input' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input id='fullName' placeholder="Full Name" type='text' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <div className="relative">
                                    <FormControl>
                                        <Input id='password' placeholder="Password" type={visible ? 'text' : 'password'} className='input' {...field} />
                                    </FormControl>
                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer">
                                        {visible ? <PiEyeLight onClick={handlePassword} /> : <PiEyeSlashLight onClick={handlePassword} />}
                                    </div>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        variant='default'
                        type="submit"
                        className={`text-primary h-12 rounded-lg mt-5 ${canSubmit ? 'bg-impact hover:bg-impact/80 cursor-pointer text-background shadow-lg' : 'bg-muted hover:bg-muted cursor-not-allowed'}`}
                        disabled={!canSubmit || isPending}
                    >
                        {isPending ? (
                            <LoadingSpinner color='background' />
                        ) : (
                            'Sign Up'
                        )}
                    </Button>
                    {isError && <p className='text-red-500'>{(error as Error).message}</p>}
                </form>
            </Form>
            <span className='w-full text-left text-sm mt-2'>Already a member? <a href="/login" className='underline text-impact hover:impact/80'>Log in</a></span>
        </div>
    );
}

export default SignUpForm;