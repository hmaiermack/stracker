import React from 'react'

const FormLabel = ({children, htmlFor}:{children: React.ReactNode, htmlFor: string}) => {
  return (
    <label htmlFor={htmlFor} className='block uppercase tracking-wide text-gray-700 text-xs font-bold my-2'>
        {children}
    </label>
  )
}

export default FormLabel