import { z } from "zod";
import { env } from "@/env.mjs";

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { Courier, DeliveryStatus, Prisma, Shipment } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { filters, shipmentCreateSchema } from "@/ui/components/AppContainer";


export type TInfo = {
    checkpoint_date: string,
    checkpoint_delivery_status: string,
    location: string,
    tracking_detail: string,
}

export type TTrackingData = {
    tracking_number: string,
    delivery_status: string,
    latest_event: string,
    origin_info: {
        trackinfo: TInfo[]
    }
}


export const shipmentRouter = createTRPCRouter({
    byId: protectedProcedure
        .input(z.object({
            id: z.string()
        }))
        .query(({ctx, input}) => {
            return ctx.prisma.shipment.findUnique({
                where: {
                    id: input.id
                }
            })
        }),
    getTen: protectedProcedure
    .input(z.object({
        offset: z.number(),
        filters: filters.optional(),
        statusFlag: z.nativeEnum(DeliveryStatus)
    }))
    .query(async ({ctx, input}) => {
        //on page 1 offset we shouldn't skip anything so set skip to 0, page 2 we skip the first 10 etc
        const skipV = (input.offset * 10) - 10
        const filter: Prisma.ShipmentFindManyArgs = {
            take: 10,
            skip: skipV,
        }

        //is gross? idk
        if (input.statusFlag === DeliveryStatus.DELIVERED) {
            filter.where = {
                courier: input.filters?.courier ? input.filters.courier : undefined as Courier | undefined,
                name: input.filters?.name ? {
                    contains: input.filters.name
                } : undefined,
            }
            filter.where.deliveryStatus = DeliveryStatus.DELIVERED
        } else if (input.statusFlag === DeliveryStatus.EXCEPTION) {
            filter.where = {
                courier: input.filters?.courier ? input.filters.courier : undefined as Courier | undefined,
                name: input.filters?.name ? {
                    contains: input.filters.name
                } : undefined,
            }
            filter.where.deliveryStatus = DeliveryStatus.EXCEPTION
        } else {
            filter.where = {
                courier: input.filters?.courier ? input.filters.courier : undefined as Courier | undefined,
                name: input.filters?.name ? {
                    contains: input.filters.name
                } : undefined,
            }
            filter.where.NOT = [
                {
                    deliveryStatus: DeliveryStatus.DELIVERED,
                },
                {
                    deliveryStatus: DeliveryStatus.EXCEPTION,
                }
            ]
        }
        const shipments = await ctx.prisma.shipment.findMany(filter)
        if (!shipments)  return [] 

        return shipments
        // const trackingNumbers = shipments.map(shipment => shipment.trackingNumber).join(',')
        // const url = new URL('https://api.trackingmore.com/v4/trackings/get')
        // url.searchParams.set('tracking_numbers', trackingNumbers)

        // const res = await fetch(url, {
        //     method: 'GET',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Tracking-api-key': env.TRACKINGMORE_API_KEY
        //     }
        // })

        // if(!res.ok) { 
        //     throw new TRPCError({message: 'Trackingmore API error', code:"INTERNAL_SERVER_ERROR"}) 
        // }
        
        // //yuck
        // const trackingData: TTrackingData[] = await res.json().then(data => { return data.data })
        // const shipmentsToUpdate: Shipment[] = []
        // const fullShipments: (Shipment & Pick<TTrackingData, "origin_info">)[] = []
        // const trackingMap = new Map(trackingData.map(item => [item.tracking_number.toUpperCase(), item]));

        // for (let i = 0; i < shipments.length; i++) {
        //     const shipment = shipments[i]
        //     const tracking = trackingMap.get(shipment!.trackingNumber.toUpperCase())
        //     if (tracking && shipment) {
        //         const latestEvent = tracking.latest_event
        //         const deliveryStatus: DeliveryStatus = tracking.delivery_status.toUpperCase() as DeliveryStatus

        //         shipmentsToUpdate.push(
        //             {
        //                 ...shipment,
        //                 deliveryStatus: deliveryStatus,
        //                 latestEvent: latestEvent,
        //             }
        //         )


        //         const fullShipment: Shipment & Pick<TTrackingData, "origin_info"> = {
        //             ...shipment,
        //             deliveryStatus: deliveryStatus,
        //             latestEvent: latestEvent,
        //             origin_info: tracking.origin_info
        //         }

        //         fullShipments.push(fullShipment)
        //     }
        // }

        // ctx.prisma.$transaction(shipmentsToUpdate.map(update => ctx.prisma.shipment.update({
        //     where: {
        //         id: update.id
        //     },
        //     data: {
        //         deliveryStatus: update.deliveryStatus,
        //         latestEvent: update.latestEvent
        //     }
        // })));
        // return fullShipments
    }),

    //lmao this is so dumb
    //if I try to return {fullShipments, shipmentCount} in prev procedure it types return to never
    //send help
    getCounts: protectedProcedure
        .input(z.object({
            filters: filters.optional()
        }))
        .query(async ({ctx, input}) => {
            const pendingCount = await ctx.prisma.shipment.count({
                where: {
                    NOT: [
                        {deliveryStatus: DeliveryStatus.DELIVERED},
                        {deliveryStatus: DeliveryStatus.EXCEPTION}
                    ],
                    courier: input.filters?.courier ? input.filters.courier : undefined,
                    name: input.filters?.name ? {
                        contains: input.filters.name
                    } : undefined,
    
                }
            })
            const deliveredCount = await ctx.prisma.shipment.count({
                where: {
                    deliveryStatus: 'DELIVERED'
                }
            })
            const errorCount = await ctx.prisma.shipment.count({
                where: {
                    deliveryStatus: 'EXCEPTION'
                }
            })
            return {pendingCount, deliveredCount, errorCount}
        }),
    create: protectedProcedure
        .input(shipmentCreateSchema)
        .mutation(async ({ctx, input}) => {
            const res = await fetch('https://api.trackingmore.com/v4/trackings/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Tracking-api-key': env.TRACKINGMORE_API_KEY
                },
                body: JSON.stringify({
                    tracking_number: input.trackingNumber,
                    courier_code: input.courier.toLowerCase(),
                })
            })

            if(!res.ok) { 
                throw new TRPCError({message: 'Trackingmore API error', code:"INTERNAL_SERVER_ERROR"}) 
            }
            
            return ctx.prisma.shipment.create({
                data: {
                    name: input.name,
                    description: input.description,
                    trackingNumber: input.trackingNumber.toUpperCase(),
                    courier: input.courier,
                    direction: input.direction,
                    userId: ctx.session.user.id
                }
            })
        }),

    delete: protectedProcedure
        .input(z.object({
            id: z.string()
        }))
        .mutation(({ctx, input}) => {
            return ctx.prisma.shipment.delete({
                where: {
                    id: input.id
                }
            })
        }
    )


});