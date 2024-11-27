import { UserRole } from "@prisma/client";
import prisma from "../../shared/prisma";
import * as bcrypt from "bcrypt";
import config from "../../config";

export const initiateSuperAdmin = async () => {
  const password="123456"
  const hashedPassword: string = await bcrypt.hash(
  password!,
    Number(config.bcrypt_salt_rounds)
  );
  const payload: any = {
    firstName:"dhadsh",
    lastName: "Cailling",
    email: "belalhossain22000@gmail.com",
    password: hashedPassword,
    role: UserRole.SUPER_ADMIN,
  };

  const isExistUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (isExistUser) return;

  await prisma.user.create({
    data: payload,
  });
};
