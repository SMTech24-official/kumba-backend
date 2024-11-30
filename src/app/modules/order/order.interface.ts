// order.interface.ts

export interface OrderItem {
    productId: string; // ID of the product being ordered
    quantity: number;  // Quantity of the product
    price: number;     // Price of the product
  }
  
  export interface Order {
    orderId: string;            // Unique identifier for the order
    userId: string;             // ID of the user placing the order
    status: 'pending' | 'shipped' | 'delivered' | 'cancelled'; // Current order status
    totalAmount: number;        // Total amount for the order
    createdAt: Date;            // Timestamp for when the order was created
    updatedAt: Date;            // Timestamp for when the order was last updated
    items: OrderItem[];         // List of items included in the order
  }
  
  // Response structure for fetching orders
  export interface GetOrdersResponse {
    success: boolean;
    message: string;
    data: Order[];
  }
  
  // Response structure for fetching a single order
  export interface GetOrderResponse {
    success: boolean;
    message: string;
    data: Order;
  }
  
  // Payload structure for creating a new order
  export interface CreateOrderPayload {
    userId: string;
    items: OrderItem[]; // Items being ordered
    totalAmount: number; // Total order cost
  }
  