# Shipment Tracker
Application built to act as a centralized shipment tracker drawing from various couriers.
Built using Next.Js, NextAuth/AuthJs, TRPC, Prisma, and Tailwind with full stack type safety using TypeScript.
Utilizes Trackingmore tracking API to get real-time tracking data, but could easily be extended to call courier's APIs.

# DB Schema
```typescript
    enum Courier {
    DHL
    UPS
    FEDEX
    USPS
    }

    enum DeliveryStatus {
    PENDING
    NOTFOUND
    TRANSIT
    PICKUP
    DELIVERED
    EXPIRED
    UNDELIVERED
    EXCEPTION
    INFORECEIVED
    }

    enum Direction {
    INBOUND
    OUTBOUND
    }

    model Shipment {
    id             String         @id @default(cuid())
    name           String
    description    String
    trackingNumber String
    courier        Courier
    direction      Direction 
    deliveryStatus DeliveryStatus @default(PENDING)
    latestEvent    String?

    user   User   @relation(fields: [userId], references: [id])
    userId String
    }
```
Enums are used for filtering data on the client, and could be any number of specific details related to what you are tracking, e.g. a factory, warehouse, etc. Everything else in `schema.prisma` is standard to NextAuth.

# To Run Application
- `npm install`
- Change value of `DATABASE_URL` in the `.env` file in the root directory to wherever you want the Postgres DB to be.
- `npx prisma db push` This command will sync your Prisma schema with your database and will generate the TypeScript types for the Prisma Client based on your schema.
- `npm run db-seed` 
- `npm run dev`

By default, code relation to trackingmore API is commented out in `src/server/api/routers/shipment.ts`. You can sign up for an API key on trackingmore and update `.env` and comment out the code if you want related functionality.

# Auth
Auth is done with very basic credential auth (read: not secure) using JWTs. Using provided callbacks in NextAuth and custom `register` handler in `pages/api/auth` directory. You can easily add more auth providers by following NextAuth documentation.

