import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma"; // Assuming Prisma instance is set up

// Place a new order and remove cart items
const placeOrder = async (user: any, addressPayload: any) => {
  return prisma.$transaction(async (tx) => {
    // Step 1: Get all cart items for the user
    const cartItems = await tx.cart.findMany({
      where: { userId: user?.id },
      include: {
        product: true,
      },
    });

    if (!cartItems || cartItems.length === 0) {
      throw new ApiError(400, "Cart is empty. Cannot place an order.");
    }

    // Step 2: Prepare order data
    const orderItems = cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.price, // Store the current price of the product
    }));

    // Step 3: Create the order
    const order = await tx.order.create({
      data: {
        userId: user?.id,
        items: {
          create: orderItems, // Create related order items
        },
        status: "Pending", // Default order status
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Step 4: Create the associated address
    await tx.address.create({
      data: {
        firstName: addressPayload.firstName,
        lastName: addressPayload.lastName,
        email: addressPayload.email,
        phone: addressPayload.phone,
        street: addressPayload.street,
        city: addressPayload.city,
        state: addressPayload.state,
        zipCode: addressPayload.zipCode,
        country: addressPayload.country,
        additionalInformation: addressPayload.additionalInformation,
        orderId: order.id,
        createdAt: new Date(),
      },
    });

    // Step 5: Delete all cart items for the user
    await tx.cart.deleteMany({
      where: { userId: user?.id },
    });

    return order; // Return the created order
  });
};
// Fetch all orders for all users
const getAllOrdersFromDB = async () => {
  const orders = await prisma.order.findMany({
    include: {
      user: {
        // If you want to include user details
        select: {
          id: true,
          firstName: true, // Add other user details as needed
          lastName: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              title: true,
              price: true,
            },
          },
        },
      },
      Address: true,
    },
  });


  return orders;
};

// Fetch all orders for a user
const getOrdersByUser = async (userId: string) => {
  const orders = await prisma.order.findMany({
    where: { userId: userId },
    include: {
      user: true,
      items: {
        include: {
          product: {
            select: {
              title: true,
              price: true,
            },
          },
        },
      },
      Address: true,
    },
  });

  if (!orders || orders.length === 0) {
    throw new ApiError(404, "No orders found for this user");
  }

  return orders;
};

// Get a specific order by its ID
const getOrderById = async (orderId: string, userId: string) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: userId,
    },
    include: {
      user: true,

      items: {
        include: {
          product: {
            select: {
              title: true,
              price: true,
            },
          },
        },
      },
      Address: true,
    },
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return order;
};

// Update the status of an order
const updateOrderStatus = async (orderId: string, status: string) => {
  const validStatuses = ["Pending", "Shipped", "Delivered", "Cancelled"];

  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid order status");
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: status,
      updatedAt: new Date(),
    },
  });

  return order;
};

export const orderService = {
  placeOrder,
  getOrdersByUser,
  getOrderById,
  updateOrderStatus,
  getAllOrdersFromDB,
};
