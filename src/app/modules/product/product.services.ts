import { Prisma } from "@prisma/client";
import prisma from "../../../shared/prisma";

import { TProduct } from "./product.interface";
import { paginationHelper } from "../../../helpars/paginationHelper";
import { IPaginationOptions } from "../../../interfaces/paginations";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";

const createProductIntoDB = async (payload: TProduct) => {
  const result = await prisma.product.create({
    data: {
      title: payload.title,
      images: payload.images,
      description: payload.description,
      packageDetails: payload.packageDetails,
      price: payload.price,
      quantity: payload.quantity,
      regularPrice: payload.regularPrice,
      isDeleted: payload.isDeleted || false,
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
  // Ensure isDeleted is false
  andConditions.push({
    isDeleted: false,
  });

  const result = await prisma.product.findMany({
    where: {
      AND: andConditions.length ? andConditions : undefined,
      ...filterData,
    },
  });

  return result;
};

const getProductByIdFromDB = async (id: string) => {
  const result = await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      Review: {
        include: {
          User: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profilePic: true,
            },
          },
        },
      },
    },
  });
  if (!result) throw new ApiError(httpStatus.NOT_FOUND, "Product not found");

  return result;
};

const updateProductByIdInDB = async (
  id: string,
  payload: Partial<TProduct>
) => {
  const isProductExist = await prisma.product.findUnique({ where: { id } });
  if (!isProductExist)
    throw new ApiError(httpStatus.NOT_FOUND, "product not found");

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
  const isProductExist = await prisma.product.findUnique({ where: { id } });

  if (isProductExist?.isDeleted === true)
    throw new ApiError(httpStatus.NOT_FOUND, "product not found ");

  const result = await prisma.product.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
      updatedAt: new Date(),
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
