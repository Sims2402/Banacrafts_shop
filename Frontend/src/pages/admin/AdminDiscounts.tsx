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
import { mockDiscounts, Discount, getAdminDiscounts } from "@/data/discounts";
import { categories } from "@/data/products";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

const AdminDiscounts = () => {
  const [discounts, setDiscounts] = useState<Discount[]>(mockDiscounts);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const adminDiscounts = discounts.filter((d) => d.createdBy === "admin");
  const sellerDiscounts = discounts.filter((d) => d.createdBy === "seller");

  const handleAddDiscount = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newDiscount: Discount = {
      id: `disc-${Date.now()}`,
      code: (formData.get("code") as string).toUpperCase(),
      type: formData.get("type") as "percentage" | "fixed",
      value: Number(formData.get("value")),
      scope: formData.get("scope") as "site_wide" | "category",
      categoryId:
        formData.get("scope") === "category"
          ? (formData.get("categoryId") as string)
          : undefined,
      minOrderValue: Number(formData.get("minOrderValue")) || undefined,
      maxDiscount: Number(formData.get("maxDiscount")) || undefined,
      usageLimit: Number(formData.get("usageLimit")) || undefined,
      usedCount: 0,
      validFrom: formData.get("validFrom") as string,
      validUntil: formData.get("validUntil") as string,
      isActive: true,
      createdBy: "admin",
      createdAt: new Date().toISOString(),
      label: formData.get("label") as string,
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

  const renderDiscountTable = (discountList: Discount[], title: string) => (
    <Card className="heritage-card mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <Tag className="h-5 w-5" />
          {title} ({discountList.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discountList.map((discount) => (
              <TableRow key={discount.id}>
                <TableCell>
                  <Badge variant="outline" className="font-mono">
                    {discount.code}
                  </Badge>
                </TableCell>
                <TableCell>{discount.label || "-"}</TableCell>
                <TableCell className="capitalize">{discount.type}</TableCell>
                <TableCell>
                  {discount.type === "percentage"
                    ? `${discount.value}%`
                    : `₹${discount.value}`}
                </TableCell>
                <TableCell className="capitalize">
                  {discount.scope === "site_wide"
                    ? "Site-wide"
                    : discount.scope === "category"
                    ? `Category: ${discount.categoryId}`
                    : "Product"}
                </TableCell>
                <TableCell>
                  {discount.usedCount}
                  {discount.usageLimit && `/${discount.usageLimit}`}
                </TableCell>
                <TableCell className="text-sm">
                  <div>{new Date(discount.validFrom).toLocaleDateString()}</div>
                  <div className="text-muted-foreground">
                    to {new Date(discount.validUntil).toLocaleDateString()}
                  </div>
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
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Discount Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage platform-wide discounts
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Discount
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display">
                  Create New Discount
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddDiscount} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Discount Code</Label>
                    <Input
                      id="code"
                      name="code"
                      placeholder="e.g., FESTIVAL25"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="label">Label</Label>
                    <Input
                      id="label"
                      name="label"
                      placeholder="e.g., Festival Offer"
                    />
                  </div>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scope">Scope</Label>
                    <Select name="scope" defaultValue="site_wide">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="site_wide">Site-wide</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Category (if applicable)</Label>
                    <Select name="categoryId">
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter((c) => c !== "All")
                          .map((cat) => (
                            <SelectItem key={cat} value={cat.toLowerCase()}>
                              {cat}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minOrderValue">Min Order (₹)</Label>
                    <Input
                      id="minOrderValue"
                      name="minOrderValue"
                      type="number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxDiscount">Max Discount (₹)</Label>
                    <Input id="maxDiscount" name="maxDiscount" type="number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usageLimit">Usage Limit</Label>
                    <Input id="usageLimit" name="usageLimit" type="number" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="validFrom">Valid From</Label>
                    <Input id="validFrom" name="validFrom" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Valid Until</Label>
                    <Input
                      id="validUntil"
                      name="validUntil"
                      type="date"
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
        </div>

        {renderDiscountTable(adminDiscounts, "Admin Discounts")}
        {renderDiscountTable(sellerDiscounts, "Seller Discounts")}
      </main>

      <Footer />
    </div>
  );
};

export default AdminDiscounts;
