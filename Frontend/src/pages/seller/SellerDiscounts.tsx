import { useState } from "react";
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
import { mockDiscounts, Discount, getDiscountsBySeller } from "@/data/discounts";
import { products } from "@/data/products";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

const SellerDiscounts = () => {
  const [discounts, setDiscounts] = useState<Discount[]>(() =>
    getDiscountsBySeller(mockDiscounts, "seller1")
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddDiscount = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newDiscount: Discount = {
      id: `disc-${Date.now()}`,
      code: (formData.get("code") as string).toUpperCase(),
      type: formData.get("type") as "percentage" | "fixed",
      value: Number(formData.get("value")),
      scope: "product",
      productId: formData.get("productId") as string,
      sellerId: "seller1",
      usedCount: 0,
      validFrom: formData.get("validFrom") as string,
      validUntil: formData.get("validUntil") as string,
      isActive: true,
      createdBy: "seller",
      createdAt: new Date().toISOString(),
      label: "Seller Special Discount",
    };
    setDiscounts([newDiscount, ...discounts]);
    setIsAddDialogOpen(false);
    toast({
      title: "Discount Created",
      description: `Discount code ${newDiscount.code} is now active.`,
    });
  };

  const toggleDiscount = (discountId: string) => {
    setDiscounts(
      discounts.map((d) =>
        d.id === discountId ? { ...d, isActive: !d.isActive } : d
      )
    );
  };

  const deleteDiscount = (discountId: string) => {
    setDiscounts(discounts.filter((d) => d.id !== discountId));
    toast({
      title: "Discount Deleted",
      description: "The discount has been removed.",
    });
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
                  <Select name="productId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="validFrom">Valid From</Label>
                    <Input id="validFrom" name="validFrom" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Valid Until</Label>
                    <Input id="validUntil" name="validUntil" type="date" required />
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
                    <TableRow key={discount.id}>
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
                        {discount.usedCount}
                        {discount.usageLimit && `/${discount.usageLimit}`}
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
                            onCheckedChange={() => toggleDiscount(discount.id)}
                          />
                          <span className="text-sm">
                            {discount.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteDiscount(discount.id)}
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
