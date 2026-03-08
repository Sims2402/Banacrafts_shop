export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "seller" | "admin";
  status: "active" | "inactive" | "suspended";
  phone?: string;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  // Seller specific
  shopName?: string;
  totalSales?: number;
  totalProducts?: number;
  // Customer specific
  totalOrders?: number;
  totalSpent?: number;
}

export const mockUsers: User[] = [
  {
    id: "admin1",
    name: "Admin User",
    email: "admin@banacrafts.com",
    role: "admin",
    status: "active",
    phone: "+91 98765 43210",
    createdAt: "2025-01-01T00:00:00Z",
    lastLogin: "2026-01-03T09:00:00Z"
  },
  {
    id: "seller1",
    name: "Lakshmi Devi",
    email: "lakshmi@banacrafts.com",
    role: "seller",
    status: "active",
    phone: "+91 98765 12345",
    shopName: "Lakshmi's Heritage Crafts",
    totalSales: 125000,
    totalProducts: 24,
    createdAt: "2025-03-15T10:00:00Z",
    lastLogin: "2026-01-02T14:30:00Z"
  },
  {
    id: "seller2",
    name: "Geeta Kumari",
    email: "geeta@banacrafts.com",
    role: "seller",
    status: "active",
    phone: "+91 87654 32109",
    shopName: "Geeta's Handloom House",
    totalSales: 89000,
    totalProducts: 18,
    createdAt: "2025-04-20T11:30:00Z",
    lastLogin: "2026-01-01T16:45:00Z"
  },
  {
    id: "seller3",
    name: "Radha Sharma",
    email: "radha@banacrafts.com",
    role: "seller",
    status: "inactive",
    phone: "+91 76543 21098",
    shopName: "Radha's Art Studio",
    totalSales: 45000,
    totalProducts: 12,
    createdAt: "2025-06-10T09:00:00Z",
    lastLogin: "2025-11-15T10:00:00Z"
  },
  {
    id: "cust1",
    name: "Priya Sharma",
    email: "priya@example.com",
    role: "customer",
    status: "active",
    phone: "+91 99999 11111",
    totalOrders: 8,
    totalSpent: 15600,
    createdAt: "2025-05-01T12:00:00Z",
    lastLogin: "2026-01-02T18:00:00Z"
  },
  {
    id: "cust2",
    name: "Anjali Verma",
    email: "anjali@example.com",
    role: "customer",
    status: "active",
    phone: "+91 88888 22222",
    totalOrders: 5,
    totalSpent: 8900,
    createdAt: "2025-06-15T14:30:00Z",
    lastLogin: "2025-12-30T09:15:00Z"
  },
  {
    id: "cust3",
    name: "Meera Patel",
    email: "meera@example.com",
    role: "customer",
    status: "active",
    phone: "+91 77777 33333",
    totalOrders: 3,
    totalSpent: 5200,
    createdAt: "2025-08-20T16:00:00Z",
    lastLogin: "2026-01-01T16:45:00Z"
  },
  {
    id: "cust4",
    name: "Sunita Reddy",
    email: "sunita@example.com",
    role: "customer",
    status: "suspended",
    phone: "+91 66666 44444",
    totalOrders: 1,
    totalSpent: 9000,
    createdAt: "2025-10-05T10:00:00Z",
    lastLogin: "2026-01-02T08:00:00Z"
  }
];

export const getUsersByRole = (users: User[], role: User["role"]) => {
  return users.filter(user => user.role === role);
};

export const getActiveUsers = (users: User[]) => {
  return users.filter(user => user.status === "active");
};

export const getTotalSellers = (users: User[]) => {
  return users.filter(user => user.role === "seller").length;
};

export const getTotalCustomers = (users: User[]) => {
  return users.filter(user => user.role === "customer").length;
};
