import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Tag, Trash2, Edit } from "lucide-react"; 
import { Discount} from "@/data/discounts";

import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { normalizeUserFromPayload } from "@/context/AuthContext";
import { apiUrl, backendUrl } from "@/lib/apiBase";

const SellerDiscounts = () => {
  const DISCOUNT_API_BASES = [
    backendUrl("/seller/discounts"),
    backendUrl("/seller/discounts/seller/discounts"),
  ];

  const requestDiscountApi = async (
    path: string,
    options?: RequestInit
  ): Promise<Response> => {
    let lastResponse: Response | null = null;

    for (const base of DISCOUNT_API_BASES) {
      const res = await fetch(`${base}${path}`, options);
      if (res.status !== 404) return res;
      lastResponse = res;
    }

    return lastResponse as Response;
  };

  const getUser = () => {
    try {
      const raw = JSON.parse(localStorage.getItem("banacrafts_user") || "{}");
      return normalizeUserFromPayload(raw) ?? raw;
    } catch {
      return {};
    }
  };

  const getSellerIdFromUser = (user: any): string => {
    return String(
      user?.id ||
      user?._id ||
      user?.sellerId ||
      user?.seller?._id ||
      user?.seller?.id ||
      ""
    );
  };
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [productList, setProductList] = useState<any[]>([]);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [newDiscount, setNewDiscount] = useState({
  code: "",
  type: "percentage",
  value: 0,
  productId: "",
  sellerId: "",
  validFrom: "",
  validUntil: ""
});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<any>(null);
  
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];
  const fetchProducts = async () => {
  try {
    if (!sellerId) {
      return;
    }

    const res = await fetch(
      apiUrl(`/api/products/seller/products/${sellerId}`)
    );

    const data = await res.json();
    const products = Array.isArray(data)
      ? data
      : Array.isArray(data?.products)
        ? data.products
        : [];

    setProductList(products);

  } catch (err) {
    console.error("Error fetching products:", err);
    setProductList([]);
  }
};
const fetchDiscounts = async () => {
  try {

    if (!sellerId) {
      console.log("WAITING for sellerId...");
      return;
    }

    const res = await requestDiscountApi(`/${sellerId}`);

    if (!res.ok) {
      if (res.status === 404) {
        // Treat missing route/data as empty state instead of throwing JSON parse errors.
        setDiscounts([]);
        return;
      }
      throw new Error(`Failed to fetch discounts (${res.status})`);
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.error("Discount API returned non-JSON response");
      setDiscounts([]);
      return;
    }

    const data = await res.json();

    if (Array.isArray(data)) {
      const formatted = data.map((d: any) => ({
        ...d,
        isActive: d.active,
      }));
      setDiscounts(formatted);
    } else {
      console.error("Discounts not array:", data);
      setDiscounts([]);
    }

  } catch (err) {   // ✅ THIS WAS MISSING
    console.error("Error fetching discounts:", err);
    setDiscounts([]);
  }
};
  useEffect(() => {
  const userStr = localStorage.getItem("banacrafts_user");

  if (!userStr) {
    return;
  }

  const user = getUser();
  const resolvedSellerId = getSellerIdFromUser(user);

  if (!resolvedSellerId) {
    console.log("❌ Seller ID missing");
    return;
  }

  setSellerId(resolvedSellerId);

}, []);
useEffect(() => {
  if (!sellerId) return;

  console.log(" Fetching data for seller:", sellerId);

  fetchProducts();
  fetchDiscounts();

}, [sellerId]);
  const handleAddDiscount = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  try {
    const formData = new FormData(e.currentTarget);
    const user = getUser();
    const resolvedSellerId = getSellerIdFromUser(user) || sellerId || "";

    const value = Number(formData.get("value"));
    const type = formData.get("type") as "percentage" | "fixed";
    const validFrom = formData.get("validFrom") as string;
    const validUntil = formData.get("validUntil") as string;

    // ✅ PRODUCT CHECK
    if (!selectedProduct) {
      toast({
        title: "Error",
        description: "Please select a product",
      });
      return;
    }

    // ✅ VALUE VALIDATION
    if (value <= 0) {
      toast({
        title: "Invalid Discount",
        description: "Discount must be greater than 0",
      });
      return;
    }

    if (type === "percentage" && value > 100) {
      toast({
        title: "Invalid Discount",
        description: "Percentage cannot exceed 100",
      });
      return;
    }

    // ✅ DATE VALIDATION
    if (validFrom < today) {
      toast({
        title: "Invalid Date",
        description: "Start date cannot be in the past",
      });
      return;
    }

    if (validUntil < validFrom) {
      toast({
        title: "Invalid Date",
        description: "End date must be after start date",
      });
      return;
    }

    // ✅ CREATE OBJECT AFTER VALIDATION
    const newDiscount: Discount = {
      id: `disc-${Date.now()}`,
      code: (formData.get("code") as string).toUpperCase(),
      type,
      value,
      scope: "product",
      productId: selectedProduct,
      sellerId: resolvedSellerId,
      usedCount: 0,
      validFrom,
      validUntil,
      isActive: true,
      createdBy: "seller",
      createdAt: new Date().toISOString(),
      label: "Seller Special Discount",
    };
    if (!newDiscount.sellerId) {
      toast({
        title: "Error",
        description: "Seller ID missing. Please login again.",
      });
      return;
    }
    // ✅ API CALL
    await requestDiscountApi("", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: newDiscount.code,
        type: newDiscount.type,
        value: newDiscount.value,
        product: newDiscount.productId,
        seller: newDiscount.sellerId,
        validFrom: newDiscount.validFrom,
        validUntil: newDiscount.validUntil,
      }),
    });

    // ✅ REFRESH
    await fetchDiscounts();

    setIsAddDialogOpen(false);
    setSelectedProduct("");

    toast({
      title: "Discount Created",
      description: `Discount code ${newDiscount.code} is now active.`,
    });

  } catch (err) {
    console.error(err);
    toast({
      title: "Error",
      description: "Something went wrong",
    });
  }
};

  const toggleDiscount = async (discountId: string) => {
  try {
    await requestDiscountApi(`/${discountId}/toggle`, {
      method: "PATCH",
    });

    await fetchDiscounts();
  } catch (err) {
    console.error(err);
  }
};

  const deleteDiscount = async (discountId: string) => {
      try {
    await requestDiscountApi(`/${discountId}`, {
      method: "DELETE",
    });

    // 🔥 reload from database
    await fetchDiscounts();

    toast({
      title: "Deleted",
      description: "Discount removed successfully",
    });

  } catch (err) {
    console.error(err);
    toast({
      title: "Error",
      description: "Failed to delete discount",
    });
  }
};

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              My Discounts
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage product discounts
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Discount
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Create New Discount</DialogTitle>
                <DialogDescription>
                  Create a discount code and apply it to one of your products.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddDiscount} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Discount Code</Label>
                  <Input
                    id="code"
                    name="code"
                    placeholder="e.g., SAVE20"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Discount Type</Label>
                    <Select name="type" defaultValue="percentage">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">Value</Label>
                    <Input id="value" name="value" type="number" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productId">Apply to Product</Label>
                  <Select
                      name="productId"
                      value={selectedProduct}
                      onValueChange={(value) => {
                        setSelectedProduct(value); // keep this
                        setNewDiscount({ ...newDiscount, productId: value }); // ✅ ADD THIS
                      }}
                    >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
  {productList.length === 0 ? (
    <SelectItem value="no-products" disabled>
      No products found
    </SelectItem>
  ) : (
    productList.map((product) => (
      <SelectItem
        key={product._id || product.id}
        value={String(product._id || product.id)}
      >
        {product.name || product.title || "Unnamed product"}
      </SelectItem>
    ))
  )}
</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="validFrom">Valid From</Label>
                    <Input
                        id="validFrom"
                        name="validFrom"
                        type="date"
                        min={today}
                        required
                      />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Valid Until</Label>
                    <Input
                      id="validUntil"
                      name="validUntil"
                      type="date"
                      min={today}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Discount</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
<Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Discount</DialogTitle>
      <DialogDescription>
        Update discount details for the selected product.
      </DialogDescription>
    </DialogHeader>

    <form
  onSubmit={async (e) => {
    e.preventDefault();
    if (!editingDiscount.code || !editingDiscount.value) {
      toast({
        title: "Error",
        description: "Fields cannot be empty",
      });
      return;
    }
    if (editingDiscount.value <= 0) {
    toast({
      title: "Invalid Discount",
      description: "Discount must be greater than 0",
    });
    return;
  }

  if (editingDiscount.type === "percentage" && editingDiscount.value > 100) {
    toast({
      title: "Invalid Discount",
      description: "Percentage cannot exceed 100",
    });
    return;
  }

    try {
      await requestDiscountApi(`/${editingDiscount._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: editingDiscount.code,
          type: editingDiscount.type,
          value: editingDiscount.value,
          product: editingDiscount.product,
          validFrom: editingDiscount.validFrom,
          validUntil: editingDiscount.validUntil,
        }),
      });

      await fetchDiscounts();
      setIsEditOpen(false);

      toast({
        title: "Updated",
        description: "Discount updated successfully",
      });

    } catch (err) {
      console.error(err);
    }
  }}
  className="space-y-4"
>
    <Input
    value={editingDiscount?.code || ""}
    onChange={(e) =>
      setEditingDiscount({ ...editingDiscount, code: e.target.value })
    }
  />
  <Select
    value={editingDiscount?.type}
    onValueChange={(value) =>
      setEditingDiscount({ ...editingDiscount, type: value })
    }
  >
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="percentage">Percentage (%)</SelectItem>
    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
  </SelectContent>
  </Select>

  <Input
  type="number"
  value={editingDiscount?.value || ""}
  onChange={(e) =>
    setEditingDiscount({
      ...editingDiscount,
      value: Number(e.target.value),
    })
  }
/>

  <Select
    value={editingDiscount?.product}
      onValueChange={(value) =>
        setEditingDiscount({ ...editingDiscount, product: value })
        }
      >
        <SelectTrigger>
        <SelectValue />
        </SelectTrigger>
        <SelectContent>
        {productList.map((product) => (
        <SelectItem key={product._id} value={product._id}>
        {product.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
    
  <Input
  type="date"
  value={editingDiscount?.validFrom?.split("T")[0] || ""}
  onChange={(e) =>
    setEditingDiscount({
      ...editingDiscount,
      validFrom: e.target.value,
    })
  }
/>

<Input
  type="date"
  value={editingDiscount?.validUntil?.split("T")[0] || ""}
  onChange={(e) =>
    setEditingDiscount({
      ...editingDiscount,
      validUntil: e.target.value,
    })
  }
/>

    <div className="flex justify-end gap-2">
      <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
        Cancel
      </Button>
      <Button type="submit">Update</Button>
    </div>

    </form>
  </DialogContent>
</Dialog>
        </div>

        {/* Discounts Table */}
        <Card className="heritage-card">
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Your Discounts ({discounts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {discounts.length === 0 ? (
              <div className="text-center py-12">
                <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No discounts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first discount to attract more customers
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  Create Discount
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discounts.map((discount) => (
                    <TableRow key={discount._id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {discount.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{discount.type}</TableCell>
                      <TableCell>
                        {discount.type === "percentage"
                          ? `${discount.value}%`
                          : `₹${discount.value}`}
                      </TableCell>
                      <TableCell>
                          {discount.product?.name || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>
                          {new Date(discount.validFrom).toLocaleDateString()} -
                        </div>
                        <div>{new Date(discount.validUntil).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={discount.isActive}
                            onCheckedChange={() => toggleDiscount(discount._id)}
                          />
                          <span className="text-sm">
                            {discount.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingDiscount(discount);
                              setIsEditOpen(true);
                            }}
                          >
                          <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteDiscount(discount._id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default SellerDiscounts;
