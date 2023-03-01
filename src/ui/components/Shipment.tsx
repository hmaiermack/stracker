import React from 'react'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../accordion'
import { TTrackingData } from '@/server/api/routers/shipment'
import { Shipment } from '@prisma/client'
import { format } from 'date-fns'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { Label } from '../label'

const USPSURL = "https://tools.usps.com/go/TrackConfirmAction?tLabels="
const UPSURL = "https://www.ups.com/track?loc=en_US&tracknum="
const FEDEXURL = "https://www.fedex.com/apps/fedextrack/?action=track&tracknumbers="
const DHLURL = "https://www.dhl.com/en/express/tracking.html?AWB="

const Shipment = ({shipment}: {shipment: Shipment & Pick<TTrackingData, "origin_info">}) => {
    let url = ""
    switch (shipment.courier) {
        case "USPS":
            url = USPSURL + shipment.trackingNumber
            break;
        case "UPS":
            url = UPSURL + shipment.trackingNumber
            break;
        case "FEDEX":
            url = FEDEXURL + shipment.trackingNumber
            break;
        case "DHL":
            url = DHLURL + shipment.trackingNumber
            break;
        default:
            break;
    }
  return (
    <div key={shipment.id} className="flex flex-col gap-2 bg-slate-50 p-4 rounded-sm">
    <div className="flex flex-col gap-4 rounded-sm">
      <div className="flex justify-between">
        <span>{shipment.department} - {shipment.name}</span>
        <Link href={url} rel="noopener noreferrer" target="_blank" className='flex text-blue-400 underline'>{shipment.courier} <ArrowUpRight className='h-4 w-4 pt-1' /> </Link>
      </div>
      <span>{shipment.direction}</span>
      <div className="flex flex-col">
        <Label className='text-slate-400 text-xs'>Item Description</Label>
        <span>{shipment.description}</span>
      </div>
      <div className="flex flex-col">
        <Label className='text-slate-400 text-xs'>Tracking #</Label>
        <span>{shipment.trackingNumber}</span>
      </div>
    </div>
    <Accordion type="single" collapsible>
          <AccordionItem value="item1">
          <AccordionTrigger className='text-blue-400'>Tracking Updates</AccordionTrigger>
          <AccordionContent>
            {shipment.origin_info.trackinfo.map((update) => (
              <div key={update.checkpoint_date} className="flex flex-col gap-1 p-2 max-w-prose">
                <span className="font-light text-sm text-slate-500">{update.checkpoint_date && format(new Date(update.checkpoint_date), "MMMM do, h:mm a")} {update.location && update.location.replace(/,/g, ', ')}</span>
                <span>{update.tracking_detail && update.tracking_detail}</span>
              </div>
                ))}

          </AccordionContent>
          </AccordionItem>
        </Accordion>

    </div>
  )
}

export default Shipment