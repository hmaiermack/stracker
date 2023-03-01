import { prisma } from "../src/server/db";
import { hash } from "bcrypt";
import { Courier, Direction } from "@prisma/client";

const shipments = [
    {
        name: "FIRST",
        description: "Our first shipment",
        trackingNumber: "abcdef123".toUpperCase(),
        courier: Courier.UPS,
        direction: Direction.INBOUND,
        userId: "cl9ebqhxk00003b600tymydho"
    },
    {
        name: "SECOND",
        description: "Our second shipment",
        trackingNumber: "abcdef123".toUpperCase(),
        courier: Courier.UPS,
        direction: Direction.OUTBOUND,
        userId: "cl9ebqhxk00003b600tymydho"
    },
    {
        name: "THIRD",
        description: "Our third shipment",
        trackingNumber: "abcdef123".toUpperCase(),
        courier: Courier.UPS,
        direction: Direction.INBOUND,
        userId: "cl9ebqhxk00003b600tymydho"
    },
]

async function main() {
  const id = "cl9ebqhxk00003b600tymydho";
  const pw = await hash("test", 10);
  await prisma.user.upsert({
    where: {
      id,
    },
    create: {
      id,
      email: "test@test.com",
      password: pw
    },
    update: {},
  });

  await prisma.$transaction(
    shipments.map((shipment) =>
        prisma.shipment.create({
            data: shipment
        })
  ))
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });