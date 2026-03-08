export interface Discount {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  scope: "site_wide" | "category" | "product";
  categoryId?: string;
  productId?: string;
  sellerId?: string;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdBy: "admin" | "seller";
  createdAt: string;
  label?: string;
}

export const mockDiscounts: Discount[] = [
  {
    id: "disc1",
    code: "FESTIVAL25",
    type: "percentage",
    value: 25,
    scope: "site_wide",
    minOrderValue: 1000,
    maxDiscount: 500,
    usageLimit: 100,
    usedCount: 45,
    validFrom: "2025-12-20T00:00:00Z",
    validUntil: "2026-01-15T23:59:59Z",
    isActive: true,
    createdBy: "admin",
    createdAt: "2025-12-18T10:00:00Z",
    label: "Festival Offer"
  },
  {
    id: "disc2",
    code: "HANDCRAFT10",
    type: "percentage",
    value: 10,
    scope: "category",
    categoryId: "textiles",
    usageLimit: 50,
    usedCount: 12,
    validFrom: "2025-12-01T00:00:00Z",
    validUntil: "2026-02-28T23:59:59Z",
    isActive: true,
    createdBy: "admin",
    createdAt: "2025-11-28T14:30:00Z",
    label: "Handcraft Special"
  },
  {
    id: "disc3",
    code: "SELLER15",
    type: "percentage",
    value: 15,
    scope: "product",
    productId: "1",
    sellerId: "seller1",
    usedCount: 8,
    validFrom: "2025-12-25T00:00:00Z",
    validUntil: "2026-01-10T23:59:59Z",
    isActive: true,
    createdBy: "seller",
    createdAt: "2025-12-24T09:00:00Z",
    label: "Seller Special Discount"
  },
  {
    id: "disc4",
    code: "FLAT200",
    type: "fixed",
    value: 200,
    scope: "site_wide",
    minOrderValue: 2000,
    usageLimit: 200,
    usedCount: 78,
    validFrom: "2025-12-01T00:00:00Z",
    validUntil: "2026-01-31T23:59:59Z",
    isActive: true,
    createdBy: "admin",
    createdAt: "2025-11-25T16:00:00Z",
    label: "Flat ₹200 Off"
  },
  {
    id: "disc5",
    code: "NEWYEAR20",
    type: "percentage",
    value: 20,
    scope: "site_wide",
    minOrderValue: 1500,
    maxDiscount: 400,
    usageLimit: 150,
    usedCount: 0,
    validFrom: "2026-01-01T00:00:00Z",
    validUntil: "2026-01-07T23:59:59Z",
    isActive: false,
    createdBy: "admin",
    createdAt: "2025-12-30T11:00:00Z",
    label: "New Year Special"
  }
];

export const getActiveDiscounts = (discounts: Discount[]) => {
  const now = new Date();
  return discounts.filter(
    d => d.isActive && 
    new Date(d.validFrom) <= now && 
    new Date(d.validUntil) >= now
  );
};

export const getDiscountsBySeller = (discounts: Discount[], sellerId: string) => {
  return discounts.filter(d => d.sellerId === sellerId);
};

export const getAdminDiscounts = (discounts: Discount[]) => {
  return discounts.filter(d => d.createdBy === "admin");
};
