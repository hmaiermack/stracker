import React from 'react'
import { api } from "@/utils";
import { useZodForm } from "@/utils";
import { Courier, Direction } from "@prisma/client";
import { z } from "zod";
import { Controller } from "react-hook-form";
import { Input, Label, Select, SelectContent, SelectTrigger, SelectValue, SelectGroup, SelectItem, Button, Tabs, TabsList, TabsTrigger, TabsContent, } from "@/ui";
import{ Pending, Delivered, ShipmentError} from "@/ui/components"
import Pagination from "rc-pagination";
import 'rc-pagination/assets/index.css'


export const shipmentCreateSchema = z.object({
  name: z.string(),
  description: z.string(),
  trackingNumber: z.string(),
  courier: z.nativeEnum(Courier),
  direction: z.nativeEnum(Direction),
})

export const filters = z.object({
  courier: z.nativeEnum(Courier).optional(),
  name: z.string().optional(),
})

const localeEn = {
    // Options.jsx
    items_per_page: '/ page',
    jump_to: 'Go to',
    jump_to_confirm: 'confirm',
    page: '',
  
    // Pagination.jsx
    prev_page: 'Previous Page',
    next_page: 'Next Page',
    prev_5: 'Previous 5 Pages',
    next_5: 'Next 5 Pages',
    prev_3: 'Previous 3 Pages',
    next_3: 'Next 3 Pages',
  };
  

const AppContainer = () => {
    const methods = useZodForm({ schema: shipmentCreateSchema })
    const filterMethods = useZodForm({ schema: filters, defaultValues: {courier: undefined, name: ''} })
    const {data: counts} = api.shipment.getCounts.useQuery({filters: filterMethods.getValues()})
    const [offset, setOffset] = React.useState(1)
    const utils = api.useContext()
  
    //this is a weird hack to force form to update when filters change
  
    const createShipment = api.shipment.create.useMutation({
      onSettled: async () => {
        await utils.shipment.getTen.invalidate()
      }
    })
  
    const onSubmit = methods.handleSubmit(
      (data) => {
        createShipment.mutate(data)
        methods.reset()
      },
      (err) => {
        console.log(err)
        console.error(err)
      }
    )
  
  
  return (
    <>
        <h1 className="text-4xl font-bold text-slate-900 justify-self-start">Shipment Tracker</h1>
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <div className="flex gap-4">
              <div className="grid min-w-[60px] max-w-sm items-center gap-1.5">
              <Label htmlFor="name">Item</Label>
              <Input type="text" placeholder="Name" {...methods.register("name")} />
              </div>
              <div className="grid min-w-[60px] max-w-sm items-center gap-1.5">
              <Label htmlFor="name">Item Notes</Label>
              <Input type="text" placeholder="Note" {...methods.register("description")} />
              </div>
              <div className="grid min-w-[60px] max-w-sm items-center gap-1.5">
              <Label htmlFor="name">Tracking Number</Label>
              <Input type="text" placeholder="Tracking Number" {...methods.register("trackingNumber")} />
              </div>
            </div>
            <div className="flex gap-4">
              <Controller
                control={methods.control}
                name="courier"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-[90px]">
                    <SelectValue placeholder="Select Courier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                    {Object.values(Courier).map((courier) => (
                      <SelectItem key={courier} value={courier}>
                        {courier}
                      </SelectItem>
                    ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                )}
              />
            <Controller
                control={methods.control}
                name="direction"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-[90px]">
                    <SelectValue placeholder="Select Direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                    {Object.values(Direction).map((direction) => (
                      <SelectItem key={direction} value={direction}>
                        {direction}
                      </SelectItem>
                    ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                )}
              />

            </div>
            <Button type="submit" disabled={!methods.formState.isValid}>Add Shipment</Button>
          </form>
          <div>
            <Tabs defaultValue="pending">
              <TabsList className="gap-2 mx-auto">
                <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-300 data-[state=active]:text-white data-[state=active]:font-bold" >Pending - {counts?.pendingCount}</TabsTrigger>
                <TabsTrigger value="delivered" className="data-[state=active]:bg-green-300 data-[state=active]:text-white data-[state=active]:font-bold">Delivered - {counts?.deliveredCount}</TabsTrigger>
                <TabsTrigger value="error" className="data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:font-bold">Issue - {counts?.errorCount}</TabsTrigger>
              </TabsList>
              <div className="bg-slate-200 min-h-screen">

                <TabsContent value="pending" className="p-0">
                {counts?.pendingCount === 0 ? <div className="flex justify-center">No Shipments in Transit</div> :
                  <Pending offset={offset} methods={filterMethods} filters={filterMethods.getValues()} /> }
                </TabsContent>
                <TabsContent value="delivered" className="p-0">
                {counts?.deliveredCount === 0 ? <div className="flex justify-center">No Shipments Delivered</div> :
                  <Delivered offset={offset} methods={filterMethods} filters={filterMethods.getValues()} /> }
                </TabsContent>
                <TabsContent value="error" className="p-0">
                  {counts?.errorCount === 0 ? <div className="flex justify-center">No Shipments with issues</div> :
                  <ShipmentError offset={offset} methods={filterMethods} filters={filterMethods.getValues()}/> }
                </TabsContent>
                <div className="w-full flex justify-center">
                  <Pagination locale={localeEn} total={counts?.pendingCount} onChange={setOffset}/>
                </div>
              </div>
            </Tabs>

          </div>

        </div>

    </>
  )
}

export default AppContainer