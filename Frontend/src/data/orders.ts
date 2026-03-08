export type CustomerRequestType = "cancel" | "exchange" | "return";
export type CustomerRequestStatus = "pending" | "approved" | "rejected";

export interface CustomerRequest {
  type: CustomerRequestType;
  status: CustomerRequestStatus;
  reason?: string;
  requestedAt: string;
  resolvedAt?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  sellerId: string;
  sellerName: string;
  products: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    image: string;
    isReturnable?: boolean;
  }[];
  totalAmount: number;
  status: "pending" | "confirmed" | "dispatched" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: "upi" | "cash" | "card";
  deliveryMethod: "self_pickup" | "seller_delivery";
  openBoxDelivery: boolean;
  shippingAddress?: string;
  customerRequest?: CustomerRequest;
  createdAt: string;
  updatedAt: string;
}

export const mockOrders: Order[] = [
  {
    id: "ORD001",
    customerId: "cust1",
    customerName: "Priya Sharma",
    customerEmail: "priya@example.com",
    customerPhone: "+91 98765 43210",
    sellerId: "seller1",
    sellerName: "Lakshmi Devi",
    products: [
      {
        productId: "1",
        productName: "Handwoven Silk Saree",
        quantity: 1,
        price: 4500,
        image: "/src/assets/products/silk-saree.jpg",
        isReturnable: true
      }
    ],
    totalAmount: 4500,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "upi",
    deliveryMethod: "seller_delivery",
    openBoxDelivery: true,
    shippingAddress: "123, MG Road, Jaipur, Rajasthan",
    createdAt: "2025-12-28T10:30:00Z",
    updatedAt: "2025-12-30T14:20:00Z"
  },
  {
    id: "ORD002",
    customerId: "cust2",
    customerName: "Anjali Verma",
    customerEmail: "anjali@example.com",
    customerPhone: "+91 87654 32109",
    sellerId: "seller1",
    sellerName: "Lakshmi Devi",
    products: [
      {
        productId: "2",
        productName: "Embroidered Clutch Bag",
        quantity: 2,
        price: 850,
        image: "/src/assets/products/embroidered-clutch.jpg",
        isReturnable: false
      }
    ],
    totalAmount: 1700,
    status: "dispatched",
    paymentStatus: "paid",
    paymentMethod: "card",
    deliveryMethod: "seller_delivery",
    openBoxDelivery: false,
    shippingAddress: "456, Anna Nagar, Chennai, Tamil Nadu",
    createdAt: "2025-12-30T09:15:00Z",
    updatedAt: "2025-12-31T11:00:00Z"
  },
  {
    id: "ORD003",
    customerId: "cust3",
    customerName: "Meera Patel",
    customerEmail: "meera@example.com",
    sellerId: "seller2",
    sellerName: "Geeta Kumari",
    products: [
      {
        productId: "3",
        productName: "Block Print Dupatta",
        quantity: 1,
        price: 650,
        image: "/src/assets/products/block-print-dupatta.jpg",
        isReturnable: true
      },
      {
        productId: "4",
        productName: "Traditional Brass Diya Set",
        quantity: 3,
        price: 450,
        image: "/src/assets/products/brass-diya.jpg",
        isReturnable: false
      }
    ],
    totalAmount: 2000,
    status: "confirmed",
    paymentStatus: "pending",
    paymentMethod: "cash",
    deliveryMethod: "self_pickup",
    openBoxDelivery: false,
    createdAt: "2026-01-01T16:45:00Z",
    updatedAt: "2026-01-01T16:45:00Z"
  },
  {
    id: "ORD004",
    customerId: "cust4",
    customerName: "Sunita Reddy",
    customerEmail: "sunita@example.com",
    customerPhone: "+91 76543 21098",
    sellerId: "seller1",
    sellerName: "Lakshmi Devi",
    products: [
      {
        productId: "1",
        productName: "Handwoven Silk Saree",
        quantity: 2,
        price: 4500,
        image: "/src/assets/products/silk-saree.jpg",
        isReturnable: true
      }
    ],
    totalAmount: 9000,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "upi",
    deliveryMethod: "seller_delivery",
    openBoxDelivery: true,
    shippingAddress: "789, Jubilee Hills, Hyderabad, Telangana",
    customerRequest: {
      type: "cancel",
      status: "pending",
      reason: "Changed my mind, found a better deal elsewhere",
      requestedAt: "2026-01-03T10:00:00Z"
    },
    createdAt: "2026-01-02T08:00:00Z",
    updatedAt: "2026-01-02T08:00:00Z"
  },
  {
    id: "ORD006",
    customerId: "cust2",
    customerName: "Anjali Verma",
    customerEmail: "anjali@example.com",
    customerPhone: "+91 87654 32109",
    sellerId: "seller1",
    sellerName: "Lakshmi Devi",
    products: [
      {
        productId: "1",
        productName: "Handwoven Silk Saree",
        quantity: 1,
        price: 4500,
        image: "/src/assets/products/silk-saree.jpg",
        isReturnable: true
      }
    ],
    totalAmount: 4500,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "upi",
    deliveryMethod: "seller_delivery",
    openBoxDelivery: false,
    shippingAddress: "456, Anna Nagar, Chennai, Tamil Nadu",
    customerRequest: {
      type: "exchange",
      status: "pending",
      reason: "Size doesn't fit properly, need a different size",
      requestedAt: "2026-01-05T14:30:00Z"
    },
    createdAt: "2026-01-01T09:00:00Z",
    updatedAt: "2026-01-04T16:00:00Z"
  },
  {
    id: "ORD005",
    customerId: "cust1",
    customerName: "Priya Sharma",
    customerEmail: "priya@example.com",
    customerPhone: "+91 98765 43210",
    sellerId: "seller2",
    sellerName: "Geeta Kumari",
    products: [
      {
        productId: "2",
        productName: "Embroidered Clutch Bag",
        quantity: 1,
        price: 850,
        image: "/src/assets/products/embroidered-clutch.jpg",
        isReturnable: true
      }
    ],
    totalAmount: 850,
    status: "cancelled",
    paymentStatus: "refunded",
    paymentMethod: "card",
    deliveryMethod: "seller_delivery",
    openBoxDelivery: false,
    shippingAddress: "123, MG Road, Jaipur, Rajasthan",
    createdAt: "2025-12-25T12:00:00Z",
    updatedAt: "2025-12-26T10:30:00Z"
  }
];

export const getOrdersByStatus = (orders: Order[], status: Order["status"]) => {
  return orders.filter(order => order.status === status);
};

export const getOrdersByPaymentStatus = (orders: Order[], paymentStatus: Order["paymentStatus"]) => {
  return orders.filter(order => order.paymentStatus === paymentStatus);
};

export const getTotalRevenue = (orders: Order[]) => {
  return orders
    .filter(order => order.paymentStatus === "paid")
    .reduce((sum, order) => sum + order.totalAmount, 0);
};

export const getOrdersBySeller = (orders: Order[], sellerId: string) => {
  return orders.filter(order => order.sellerId === sellerId);
};
