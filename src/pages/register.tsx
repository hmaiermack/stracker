import React from 'react'
import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import FormInput from '@/ui/FormInput'
import FormLabel from '@/ui/FormLabel'

type Inputs = {
    email: string
    password: string
}

/* eslint-disable */
const register = () => {
    const schema = z.object({
        email: z.string().email(),
        password: z.string().min(6),
    })
    const { register, handleSubmit, formState: { errors }, setError } = useForm<Inputs>({
        resolver: zodResolver(schema),
    })

    const router = useRouter()
    const onSubmit = async (data: Inputs) => {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: data.email,
                password: data.password,
            }),
        })

        if (response.ok) {
            signIn('credentials', {
                redirect: false,
                email: data.email,
                password: data.password,
                }).then((res) => {
                    if (res?.ok) {
                        router.push('/')
                    }
                }).catch((err) => {
                    //TODO: tell user account created but failed to sign in
                    // 5sec countdown to sign in redirect
                    router.push('/api/auth/signin')
                })
        } else {
            const json = await response.json()
            json.type === 'EMAIL_EXISTS' && setError('email', {message: json.message})
        }
    }
  return (
    <div className='bg-slate-100 w-screen h-screen flex flex-col justify-center items-center'>
        <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset>
                <legend className='text-center text-2xl font-semibold mb-4'>Create new account</legend>
                <FormLabel htmlFor="email">Email</FormLabel>
                <FormInput register={register} error={errors.email} label='email' type='email' />
                <FormLabel htmlFor="password" >Password</FormLabel>
                <FormInput register={register} error={errors.password} label='password' type='password' />
            </fieldset>
            <button type="submit" className='mx-auto p-4 bg-green-400 text-white hover:bg-green-500 rounded-lg mt-4'>Register</button>
        </form>

        <span className='text-sm italic mt-4'>Already have an account? <Link href="/api/auth/signin" className='underline text-blue-500' >Sign In</Link></span>
    </div>
  )
}

export default register