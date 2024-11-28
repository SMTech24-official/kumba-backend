import { Prisma } from "@prisma/client";
import prisma from "../../../shared/prisma";

import { TProduct } from "./product.interface";
import { paginationHelper } from "../../../helpars/paginationHelper";
import { IPaginationOptions } from "../../../interfaces/paginations";


const createProductIntoDB = async (payload: TProduct) => {
  const result = await prisma.product.create({
    data: {
      title: payload.title,
      image: payload.image,
      description: payload.description,
      packageDetails: payload.packageDetails,
      price: payload.price,
      quantity: payload.quantity,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  return result;
};

const getAllProductsIntoDB = async (
  params: any,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.ProductWhereInput[] = [];

  const normalizedSearchTerm = searchTerm?.toLowerCase() || "";

  if (normalizedSearchTerm) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: normalizedSearchTerm,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: normalizedSearchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  const result = await prisma.product.findMany({
    where: {
      AND: andConditions.length ? andConditions : undefined,
      ...filterData,
    },
    skip,
    take: limit,
  });

  return result;
};

const getProductByIdFromDB = async (id: string) => {
  const result = await prisma.product.findUnique({
    where: {
      id,
    },
  });
  return result;
};

const updateProductByIdInDB = async (
  id: string,
  payload: Partial<TProduct>
) => {
  const result = await prisma.product.update({
    where: {
      id,
    },
    data: {
      ...payload,
      updatedAt: new Date(),
    },
  });
  return result;
};

const deleteProductFromDB = async (id: string) => {
  const result = await prisma.product.delete({
    where: {
      id,
    },
  });
  return result;
};

export const productServices = {
  createProductIntoDB,
  getAllProductsIntoDB,
  getProductByIdFromDB,
  updateProductByIdInDB,
  deleteProductFromDB,
};
