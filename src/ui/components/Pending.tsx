import { api } from '@/utils'
import { format } from 'date-fns'
import React, { useEffect } from 'react'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../accordion'
import { Courier, Department } from '@prisma/client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select'
import { Controller } from 'react-hook-form'
import { Label } from '../label'
import { Input } from '../input'
import { useDebouncedCallback } from 'use-debounce'
import type { UseFormReturn } from 'react-hook-form'
import Shipment from './Shipment'




const Pending = ({offset, methods, filters}: {offset: number, methods: UseFormReturn, filters: any }) => {
  const {data: shipmentsData} = api.shipment.getTen.useQuery({offset, filters, statusFlag: "PENDING"})
  const debounced = useDebouncedCallback(
    // function
    (value) => {
      methods.setValue("name", value);
    },
    // delay in ms
    1000
  );
  //this is a hack to force the select to re-render when the value is cleared, as you can't pass a value of undefined to a select item
  const [depKey, setDepKey] = React.useState<number>(+new Date())
  const [courierKey, setCourierKey] = React.useState<number>(+new Date())  
  return (
    <div className="flex flex-col gap-4 flex-wrap rounded-md p-8 w-full">

      <form className='flex gap-4 flex-col sm:flex-row'>
        <div className='flex flex-col gap-4'>
        {methods.getValues("department") && <button
            className='text-sm text-slate-400'
            type='button'
            onClick={e => {
              e.stopPropagation()
              methods.setValue("department", undefined)
              setDepKey(+new Date())
            }}
          > Clear Filter </button>}

        <Controller
          control={methods.control}
          name="department"
          render={({ field }) => (
            <Select   
              key={depKey}
              value={field.value}
              onValueChange={field.onChange}
            >
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(Department).map((department) => (
                <SelectItem key={department} value={department}>{department}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          )}
        />

        </div>

        <div className='flex flex-col gap-4'>
        {methods.getValues("courier") && <button
            className='text-sm text-slate-400'
            type='button'
            onClick={e => {
              e.stopPropagation()
              methods.setValue("courier", undefined)
              setCourierKey(+new Date())
            }}
          > Clear Filter </button>}


                <Controller
          control={methods.control}
          name="courier"
          render={({ field }) => (
            <Select key={courierKey} value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Courier" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(Courier).map((courier) => (
                <SelectItem key={courier} value={courier}>{courier}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          )}
        />

        {/* Should probably wrap Inputs with debounce by default */}
        <Label htmlFor='name'>Item Name</Label>
        <Input id='name' type="text" {...methods.register('name')} className="bg-white"         
        onChange={(e) => {
          debounced(e.target.value);
        }}
/>
        </div>
      </form>
    {shipmentsData?.map((shipment) => (
      <Shipment key={shipment.id} shipment={shipment} />
      ))}
    </div>

  )
}

export { Pending }