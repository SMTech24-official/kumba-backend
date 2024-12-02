import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma"; // Assuming Prisma instance is set up
import { TCart } from "./cart.interface"; // Import the TCart interface

// Create a new cart entry
const createCartItem = async (payload: TCart, user: any) => {
  if (payload.quantity < 1)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Invalid quantity please enter minimum quantity 1"
    );
  // Ensure the user and product exist in the database
  await prisma.user.findFirstOrThrow({
    where: { id: user.id },
  });

  const isProductExist = await prisma.product.findFirstOrThrow({
    where: { id: payload.productId },
  });

  if (isProductExist.quantity === 0 || isProductExist.isDeleted === true)
    throw new ApiError(httpStatus.NOT_FOUND, "Product  not available");

  // Check if a cart item already exists for the user and product
  const existingCartItem = await prisma.cart.findFirst({
    where: {
      userId: user.id,
      productId: payload.productId,
    },
  });

  let result;

  if (existingCartItem) {
    // If the cart item exists, update its quantity
    result = await prisma.cart.update({
      where: { id: existingCartItem.id }, // Use the primary key `id` to update
      data: {
        quantity: existingCartItem.quantity + payload.quantity,
        updatedAt: new Date(),
      },
    });
  } else {
    // If the cart item doesn't exist, create a new one
    result = await prisma.cart.create({
      data: {
        userId: user.id,
        productId: payload.productId,
        quantity: payload.quantity,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  return result;
};

// TODO: This function should be removed
const getAllCartItemsByUser = async () => {
  const cartItems = await prisma.cart.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      }, // Include the related user data
      product: {
        select: {
          id: true,
          title: true,
          price: true,
        },
      }, // Include the related product data (if needed)
    },
  });

  if (!cartItems || cartItems.length === 0) {
    throw new ApiError(404, "No cart items found for this user");
  }

  return cartItems;
};

// Get all cart items for a user
const getCartItemsByUser = async (userId: string) => {
  const cartItems = await prisma.cart.findMany({
    where: { userId: userId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      }, // Include the related user data
      product: {
        select: {
          id: true,
          title: true,
          price: true,
          regularPrice: true,
          Review: true,
          images: true,
          description: true,
        },
      },
    },
  });

  if (!cartItems || cartItems.length === 0) {
    throw new ApiError(404, "No cart items found for this user");
  }
  const totalPrice = cartItems.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  return {
    cartItems,
    totalPrice,
  };
};

// Get a specific cart item by userId and productId
const getCartItemByProductId = async (userId: string, productId: string) => {
  const cartItem = await prisma.cart.findFirst({
    where: {
      userId: userId,
      productId: productId,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      }, // Include the related user data
      product: {
        select: {
          id: true,
          title: true,
          price: true,
        },
      }, // Include the related product data (if needed)
    },
  });

  if (!cartItem) {
    throw new ApiError(404, "Cart item not found");
  }

  return cartItem;
};

// Update a cart item (e.g., changing quantity)
const updateCartItem = async (
  userId: string,
  productId: string,
  payload: Partial<TCart>
) => {
  const existingCartItem = await prisma.cart.findFirst({
    where: {
      userId: userId,
      productId: productId,
    },
  });

  if (!existingCartItem) {
    throw new ApiError(404, "Cart item not found");
  }

  const result = await prisma.cart.update({
    where: {
      id: existingCartItem.id,
    },
    data: {
      ...payload, // Spread the payload to update the cart item
      updatedAt: new Date(),
    },
  });

  return result;
};

// Delete a cart item by userId and productId
const deleteCartItem = async (userId: string, productId: string) => {
  const cartItem = await prisma.cart.findFirst({
    where: {
      userId: userId,
      productId: productId,
    },
  });

  if (!cartItem) {
    throw new ApiError(404, "Cart item not found");
  }

  const result = await prisma.cart.delete({
    where: {
      id: cartItem.id,
    },
  });

  return result;
};

// Update cart item quantity
const updateCartQuantity = async (userId: string, payload: any) => {
  // Check if the cart item exists for the user and the product
  const existingCartItem = await prisma.cart.findFirst({
    where: {
      id: payload.cartId,
    },
  });

  if (!existingCartItem) throw new ApiError(404, "Cart item not found");

  // If the cart item exists, update the quantity
  const updatedCartItem = await prisma.cart.update({
    where: {
      id: existingCartItem.id,
    },
    data: {
      quantity: existingCartItem.quantity + payload.quantity,
      updatedAt: new Date(),
    },
  });
  return updatedCartItem;
};

export const cartService = {
  createCartItem,
  getCartItemsByUser,
  getAllCartItemsByUser,
  getCartItemByProductId,
  updateCartItem,
  deleteCartItem,
  updateCartQuantity,
};
