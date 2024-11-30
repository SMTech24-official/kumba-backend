import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma"; // Assuming Prisma instance is set up
import { TCart } from "./cart.interface"; // Import the TCart interface

// Create a new cart entry
const createCartItem = async (payload: TCart) => {
  // Check if the product and user exist (you can use `findFirstOrThrow` or `findUnique`)
  await prisma.user.findFirstOrThrow({
    where: { id: payload.userId },
  });

  await prisma.product.findFirstOrThrow({
    where: { id: payload.productId },
  });

  // Create the cart item in the database
  const result = await prisma.cart.create({
    data: {
      userId: payload.userId,
      productId: payload.productId,
      quantity: payload.quantity,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return result;
};
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
          Review:true,
          images: true,
          description:true
        },
      }, // Include the related product data (if needed)
    },
  });

  if (!cartItems || cartItems.length === 0) {
    throw new ApiError(404, "No cart items found for this user");
  }

  return cartItems;
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

export const cartService = {
  createCartItem,
  getCartItemsByUser,
  getAllCartItemsByUser,
  getCartItemByProductId,
  updateCartItem,
  deleteCartItem,
};
