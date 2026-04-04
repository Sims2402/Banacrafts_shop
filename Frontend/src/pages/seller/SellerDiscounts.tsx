import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Tag, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";

const API = "http://localhost:5000/api";

const SellerDiscounts = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const token = user?.token ?? "";
  const authHeaders = { Authorization: `Bearer ${token}` };

  const [discounts,       setDiscounts]       = useState<any[]>([]);
  const [productList,     setProductList]     = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditOpen,      setIsEditOpen]      = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<any>(null);

  const today = new Date().toISOString().split("T")[0];

  /* ── FETCH PRODUCTS ── */
  const fetchProducts = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/products/seller/me`, { headers: authHeaders });
      if (!res.ok) { console.error("Products fetch failed:", res.status); return; }
      const data = await res.json();
      setProductList(Array.isArray(data) ? data : data?.products ?? []);
    } catch (err) {
      console.error("fetchProducts error:", err);
      setProductList([]);
    }
  };

  /* ── FETCH DISCOUNTS ── */
  const fetchDiscounts = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/discounts/seller/me`, { headers: authHeaders });
      if (!res.ok) { setDiscounts([]); return; }
      const data = await res.json();
      setDiscounts(
        Array.isArray(data)
          ? data.map((d: any) => ({ ...d, isActive: d.active ?? d.isActive }))
          : []
      );
    } catch (err) {
      console.error("fetchDiscounts error:", err);
      setDiscounts([]);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchProducts();
    fetchDiscounts();
  }, [token]);

  /* ── ADD DISCOUNT ── */
  const handleAddDiscount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) { toast({ title: "Not authenticated" }); return; }

    const formData   = new FormData(e.currentTarget);
    const value      = Number(formData.get("value"));
    const type       = formData.get("type") as "percentage" | "fixed";
    const validFrom  = formData.get("validFrom") as string;
    const validUntil = formData.get("validUntil") as string;
    const code       = (formData.get("code") as string).toUpperCase();

    if (!selectedProduct) {
      toast({ title: "Error", description: "Please select a product" }); return;
    }
    if (value <= 0) {
      toast({ title: "Invalid Discount", description: "Must be greater than 0" }); return;
    }
    if (type === "percentage" && value > 100) {
      toast({ title: "Invalid Discount", description: "Percentage cannot exceed 100" }); return;
    }
    if (validFrom < today) {
      toast({ title: "Invalid Date", description: "Start date cannot be in the past" }); return;
    }
    if (validUntil < validFrom) {
      toast({ title: "Invalid Date", description: "End date must be after start date" }); return;
    }

    try {
      const res = await fetch(`${API}/discounts`, {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ code, type, value, product: selectedProduct, validFrom, validUntil }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }

      await fetchDiscounts();
      setIsAddDialogOpen(false);
      setSelectedProduct("");
      toast({ title: "Discount Created", description: `Code ${code} is now active.` });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err.message || "Something went wrong" });
    }
  };

  /* ── TOGGLE ── */
  const toggleDiscount = async (discountId: string) => {
    if (!token) return;
    try {
      await fetch(`${API}/discounts/${discountId}/toggle`, {
        method: "PATCH",
        headers: authHeaders,
      });
      await fetchDiscounts();
    } catch (err) { console.error(err); }
  };

  /* ── DELETE ── */
  const deleteDiscount = async (discountId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/discounts/${discountId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchDiscounts();
      toast({ title: "Deleted", description: "Discount removed successfully" });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err.message || "Failed to delete" });
    }
  };

  /* ── EDIT SUBMIT ── */
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token || !editingDiscount) return;

    if (!editingDiscount.code || !editingDiscount.value) {
      toast({ title: "Error", description: "Fields cannot be empty" }); return;
    }
    if (editingDiscount.value <= 0) {
      toast({ title: "Invalid Discount", description: "Must be greater than 0" }); return;
    }
    if (editingDiscount.type === "percentage" && editingDiscount.value > 100) {
      toast({ title: "Invalid Discount", description: "Percentage cannot exceed 100" }); return;
    }

    try {
      const res = await fetch(`${API}/discounts/${editingDiscount._id}`, {
        method: "PUT",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          code:       editingDiscount.code,
          type:       editingDiscount.type,
          value:      editingDiscount.value,
          product:    editingDiscount.product?._id ?? editingDiscount.product,
          validFrom:  editingDiscount.validFrom,
          validUntil: editingDiscount.validUntil,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchDiscounts();
      setIsEditOpen(false);
      toast({ title: "Updated", description: "Discount updated successfully" });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err.message || "Failed to update" });
    }
  };

  /* ── RENDER ── */
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">My Discounts</h1>
            <p className="text-muted-foreground mt-1">Create and manage product discounts</p>
          </div>

          {/* ADD DIALOG */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />Create Discount</Button>
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
                  <Input id="code" name="code" placeholder="e.g., SAVE20" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Discount Type</Label>
                    <Select name="type" defaultValue="percentage">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">Value</Label>
                    <Input id="value" name="value" type="number" min="1" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Apply to Product</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent>
                      {productList.length === 0 ? (
                        <SelectItem value="none" disabled>No products found</SelectItem>
                      ) : (
                        productList.map((p) => (
                          <SelectItem key={p._id} value={String(p._id)}>
                            {p.name || "Unnamed product"}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="validFrom">Valid From</Label>
                    <Input id="validFrom" name="validFrom" type="date" min={today} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Valid Until</Label>
                    <Input id="validUntil" name="validUntil" type="date" min={today} required />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Discount</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* EDIT DIALOG */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Discount</DialogTitle>
                <DialogDescription>Update discount details.</DialogDescription>
              </DialogHeader>
              {editingDiscount && (
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Discount Code</Label>
                    <Input
                      value={editingDiscount.code || ""}
                      onChange={(e) => setEditingDiscount({ ...editingDiscount, code: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={editingDiscount.type}
                      onValueChange={(v) => setEditingDiscount({ ...editingDiscount, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input type="number" value={editingDiscount.value || ""}
                      onChange={(e) => setEditingDiscount({ ...editingDiscount, value: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Product</Label>
                    <Select
                      value={editingDiscount.product?._id ?? editingDiscount.product ?? ""}
                      onValueChange={(v) => setEditingDiscount({ ...editingDiscount, product: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {productList.map((p) => (
                          <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Valid From</Label>
                      <Input type="date" value={editingDiscount.validFrom?.split("T")[0] || ""}
                        onChange={(e) => setEditingDiscount({ ...editingDiscount, validFrom: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Valid Until</Label>
                      <Input type="date" value={editingDiscount.validUntil?.split("T")[0] || ""}
                        onChange={(e) => setEditingDiscount({ ...editingDiscount, validUntil: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                    <Button type="submit">Update</Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* DISCOUNTS TABLE */}
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
                <Button onClick={() => setIsAddDialogOpen(true)}>Create Discount</Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discounts.map((discount) => (
                    <TableRow key={discount._id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">{discount.code}</Badge>
                      </TableCell>
                      <TableCell className="capitalize">{discount.type}</TableCell>
                      <TableCell>
                        {discount.type === "percentage" ? `${discount.value}%` : `₹${discount.value}`}
                      </TableCell>
                      <TableCell>{discount.product?.name || "—"}</TableCell>
                      <TableCell className="text-sm">
                        <div>{new Date(discount.validFrom).toLocaleDateString()} –</div>
                        <div>{new Date(discount.validUntil).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch checked={!!discount.isActive}
                            onCheckedChange={() => toggleDiscount(discount._id)} />
                          <span className="text-sm">{discount.isActive ? "Active" : "Inactive"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon"
                            onClick={() => { setEditingDiscount(discount); setIsEditOpen(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon"
                            onClick={() => deleteDiscount(discount._id)}>
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