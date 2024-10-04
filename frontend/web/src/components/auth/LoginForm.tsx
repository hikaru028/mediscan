"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components';
import { useToast } from '@/components/ui/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PiEyeLight, PiEyeSlashLight } from "react-icons/pi";

const FormSchema = z.object({
    employee_id: z.string().min(5, {
        message: "Employee number must be at least 5 characters",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters",
    }),
});

export default function LoginForm() {
    const [canSubmit, setCanSubmit] = useState<boolean>(false);
    const [visible, setVisible] = useState<boolean>(false);
    const router = useRouter();
    const toast = useToast();
    const queryClient = useQueryClient();

    const { mutate: loginMutation, isError, isPending, error } = useMutation({
        mutationFn: async (formData: z.infer<typeof FormSchema>) => {
            try {
                const res = await fetch('/api/employees/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                    credentials: 'include',
                });

                const data = await res.json();
                if (!res.ok || data.error) throw new Error(data.error || 'Failed to login');
            } catch (error: any) {
                throw new Error('Invalid email or password');
            }
        },
        onSuccess: (data) => {
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

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            employee_id: "",
            password: "",
        },
    });

    const handleSubmit = (formData: z.infer<typeof FormSchema>) => {
        loginMutation(formData);
    };

    const handlePassword = () => {
        setVisible(!visible);
    };

    useEffect(() => {
        const subscription = form.watch((value) => {
            const { employee_id, password } = value;
            setCanSubmit(!!employee_id && !!password);
        });
        return () => subscription.unsubscribe();
    }, [form]);

    return (
        <div className="flex flex-col items-center w-[274px] max-w-sm gap-y-4">
            <span className='text-2xl font-bold mt-4'>Login</span>
            <Form {...form}>
                <form className="w-full flex flex-col gap-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
                    <FormField
                        control={form.control}
                        name="employee_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input id='employeeId' placeholder="Employee number" type='text' className='input' {...field} />
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
                    <span className='text-sm text-right w-full mb-6 cursor-pointer text-impact hover:impact/80'>Forgot Password?</span>
                    <Button
                        variant='default'
                        type="submit"
                        className={`text-primary h-12 rounded-lg ${canSubmit ? 'bg-impact hover:bg-impact/80 cursor-pointer text-background shadow-lg' : 'bg-muted hover:bg-muted cursor-not-allowed'}`}
                        disabled={!canSubmit || isPending}
                    >
                        {isPending ? (
                            <LoadingSpinner color='background' />
                        ) : (
                            'Login'
                        )}
                    </Button>
                    {isError && <p className='text-red-500'>{(error as Error).message}</p>}
                </form>
            </Form>
            <span className='w-full text-left text-sm mt-2'>Don’t have an account? <a href="/signup" className='underline text-impact hover:impact/80'>Sign up</a></span>
        </div>
    );
}