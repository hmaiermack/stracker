import { createTRPCRouter } from "@/server/api/trpc";
import { shipmentRouter } from "./routers/shipment";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  shipment: shipmentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
