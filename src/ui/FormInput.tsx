import React from 'react'
import { FieldError, UseFormRegister } from 'react-hook-form'

const FormInput = (
    {
        register,
        error,
        placeholder,
        label,
        type
    }: {
        register: UseFormRegister<any>,
        error: FieldError | undefined,
        placeholder?: string,
        label: string,
        type?: string
        
    }
) => {
  return (
    <div>
        <input type={type} className={`appearance-none block w-full bg-white text-gray-900 border border-gray-500 font-medium ${error ? 'outline-red-500' : 'border-gray-400 focus:outline-none'} rounded-lg py-3 px-3 leading-tight`} {...register(label)} placeholder={placeholder}/>
        {error && <span className="text-red-500">{error?.message}</span>}
    </div>
  )
}

export default FormInput