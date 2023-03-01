import { prisma } from "@/server/db";
import { type NextApiRequest, type NextApiResponse } from "next";
import { hash } from "bcrypt";
import { z } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  try {
    schema.parse(req.body);
    const { email, password } = req.body;
    const exists = await prisma.user.findUnique({
      where: {
            email,
      },
    });
    if (exists) {
      res.status(400).send({
        type: "EMAIL_EXISTS",
        message: "User already exists"
      });
    } else {
        const user = await prisma.user.create({
            data: {
          email,
          password: await hash(password, 10),
        },
      });
      res.status(200).json(user);
    }
    
  } catch (error) {
    res.status(400).send(error);
  }
}
