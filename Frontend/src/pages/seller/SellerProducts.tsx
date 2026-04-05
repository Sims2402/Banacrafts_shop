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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Eye, RotateCcw, ImagePlus, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import { normalizeProductTags } from "@/lib/normalizeProductTags";

const API = "http://localhost:5000/api";

/* token lives inside user.token per AuthContext */
const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

const formatProduct = (p: any) => {
  const qty =
    typeof p.quantity === "number" && Number.isFinite(p.quantity)
      ? Math.max(0, Math.floor(p.quantity))
      : 0;
  return {
    id: p._id,
    name: p.name,
    description: p.description,
    price: p.price,
    finalPrice: p.finalPrice,
    originalPrice: p.originalPrice,
    category: p.category,
    material: p.material,
    image: p.images?.[0]?.url || "/placeholder.svg",
    images: [p.images?.[0]?.url || "/placeholder.svg"],
    tags: (() => {
      const t = normalizeProductTags(p.tags);
      return t.length ? t : ["Handmade"];
    })(),
    quantity: qty,
    inStock: qty > 0,
    isReturnable: p.returnable,
    rating: typeof p.rating === "number" ? p.rating : 0,
    numRatings: typeof p.numRatings === "number" ? p.numRatings : 0,
    returnPolicy: p.returnable ? "7 days return policy" : "No return available",
  };
};

const SellerProducts = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [productList, setProductList]     = useState<any[]>([]);
  const [searchQuery, setSearchQuery]     = useState("");
  const [viewProduct, setViewProduct]     = useState<any>(null);
  const [isViewOpen, setIsViewOpen]       = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [imagePreview, setImagePreview]   = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isEditOpen, setIsEditOpen]       = useState(false);

  /* ── FETCH ── */
  const fetchProducts = async () => {
    const token = user?.token;
    if (!token) return;

    try {
      // ✅ correct route: GET /api/products/seller/me (uses token to identify seller)
      const res = await fetch(`${API}/products/seller/me`, {
        headers: getAuthHeaders(token),
      });

      if (!res.ok) {
        const msg = await res.text();
        console.error("fetchProducts failed:", res.status, msg);
        return;
      }

      const data = await res.json();
      setProductList(Array.isArray(data) ? data.map(formatProduct) : []);
    } catch (err) {
      console.error("fetchProducts error:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user?.token]);

  /* ── ADD ── */
  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = user?.token;
    if (!token) { toast({ title: "Not authenticated" }); return; }

    const formData = new FormData(e.currentTarget);
    const price         = Number(formData.get("price"));
    const originalPrice = Number(formData.get("originalPrice"));

    if (price <= 0) {
      toast({ title: "Invalid Price", description: "Price must be greater than 0" });
      return;
    }
    if (originalPrice < 0) {
      toast({ title: "Invalid Original Price", description: "Cannot be negative" });
      return;
    }

    const quantity = Number(formData.get("quantity"));
    if (!Number.isInteger(quantity) || quantity < 0) {
      toast({
        title: "Invalid quantity",
        description: "Enter a whole number 0 or greater",
      });
      return;
    }

    const sendData = new FormData();
    sendData.append("name",          formData.get("name") as string);
    sendData.append("description",   formData.get("description") as string);
    sendData.append("price",         String(price));
    sendData.append("originalPrice", String(originalPrice));
    sendData.append("category",      formData.get("category") as string);
    sendData.append("material",      formData.get("material") as string);
    sendData.append("returnable",    String(formData.get("isReturnable") === "on"));
    sendData.append("quantity",      String(quantity));

    const tagsInput = (formData.get("tags") as string) || "";
    if (tagsInput.trim()) {
      sendData.append("tags", tagsInput.trim());
    }

    const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput?.files?.[0]) sendData.append("images", fileInput.files[0]);

    try {
      // ✅ correct route: POST /api/products  (your backend mounts productRoutes at /api/products)
      const res = await fetch(`${API}/products`, {
        method: "POST",
        headers: getAuthHeaders(token), // ⚠️ no Content-Type — browser sets it for FormData
        body: sendData,
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }

      const saved = await res.json();
      setProductList((prev) => [formatProduct(saved), ...prev]);
      setIsAddDialogOpen(false);
      setImagePreview(null);
      toast({ title: "Product Added", description: "Saved successfully ✨" });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err.message || "Failed to add product" });
    }
  };

  /* ── DELETE ── */
  const handleDeleteProduct = async (productId: string) => {
    const token = user?.token;
    if (!token) return;

    try {
      // ✅ correct route: DELETE /api/products/:id
      const res = await fetch(`${API}/products/${productId}`, {
        method: "DELETE",
        headers: getAuthHeaders(token),
      });

      if (!res.ok) throw new Error(await res.text());

      fetchProducts();
      toast({ title: "Product Deleted", description: "Deleted successfully 🗑️" });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err.message || "Failed to delete" });
    }
  };

  /* ── TOGGLE RETURNABLE ── */
  const handleToggleReturnable = async (productId: string, currentValue: boolean) => {
    const token = user?.token;
    if (!token) return;

    try {
      // ✅ correct route: PUT /api/products/:id
      await fetch(`${API}/products/${productId}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
        body: JSON.stringify({ returnable: !currentValue }),
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  /* ── EDIT SUBMIT ── */
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = user?.token;
    if (!token || !editingProduct) return;

    const formData    = new FormData(e.currentTarget);
    const price         = Number(formData.get("price"));
    const originalPrice = Number(formData.get("originalPrice"));
    const quantity      = Number(formData.get("quantity"));

    if (price <= 0)       { alert("Price must be greater than 0"); return; }
    if (originalPrice < 0){ alert("Original price cannot be negative"); return; }
    if (!Number.isInteger(quantity) || quantity < 0) {
      toast({ title: "Invalid quantity", description: "Use a whole number ≥ 0" });
      return;
    }

    try {
      // ✅ correct route: PUT /api/products/:id
      const res = await fetch(`${API}/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
        body: JSON.stringify({
          name:          formData.get("name"),
          description:   formData.get("description"),
          price,
          originalPrice,
          quantity,
          category:      formData.get("category"),
          material:      formData.get("material"),
          returnable:    formData.get("isReturnable") === "on",
          tags:          formData.get("tags")?.toString().split(",").map((t) => t.trim()),
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      fetchProducts();
      setIsEditOpen(false);
      toast({ title: "Product Updated" });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err.message || "Failed to update" });
    }
  };

  const filteredProducts = productList.filter(
    (p) =>
      p?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p?.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ── RENDER ── */
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">My Products</h1>
            <p className="text-muted-foreground mt-1">Manage your product listings</p>
          </div>

          {/* ADD DIALOG */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />Add Product</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-display">Add New Product</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" required>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Textiles">Textiles</SelectItem>
                        <SelectItem value="Accessories">Accessories</SelectItem>
                        <SelectItem value="Home Decor">Home Decor</SelectItem>
                        <SelectItem value="Jewelry">Jewelry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input id="tags" name="tags" placeholder="e.g handmade, eco-friendly" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" required />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input id="price" name="price" type="number" min="1" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Original Price (₹)</Label>
                    <Input id="originalPrice" name="originalPrice" type="number" min="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Stock quantity</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="0"
                      step="1"
                      required
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="material">Material</Label>
                    <Input id="material" name="material" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><ImagePlus className="h-4 w-4" />Product Image</Label>
                  <Input type="file" name="images" accept=".jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setImagePreview(URL.createObjectURL(file));
                    }}
                    className="cursor-pointer"
                  />
                  {imagePreview && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="isReturnable" name="isReturnable" defaultChecked />
                  <Label htmlFor="isReturnable" className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />Allow Returns & Exchanges
                  </Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Add Product</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* SEARCH */}
        <Card className="heritage-card mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
          </CardContent>
        </Card>

        {/* TABLE */}
        <Card className="heritage-card">
          <CardHeader>
            <CardTitle className="text-lg font-display">
              All Products ({filteredProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No products found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Returnable</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img src={product.images[0]} alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover" />
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">{product.material}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                          <span className="font-medium">{Number(product.rating || 0).toFixed(1)}</span>
                          <span className="text-muted-foreground">({product.numRatings ?? 0})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          ₹{product.finalPrice !== undefined ? product.finalPrice : product.price}
                        </span>
                        {product.originalPrice > 0 && (
                          <span className="text-sm text-muted-foreground line-through ml-2">
                            ₹{product.originalPrice}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {product.quantity > 0 ? (
                            <span className="text-foreground">{product.quantity} in stock</span>
                          ) : (
                            <span className="text-muted-foreground">Out of stock</span>
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch checked={product.isReturnable}
                            onCheckedChange={() => handleToggleReturnable(product.id, product.isReturnable)} />
                          <span className="text-xs text-muted-foreground">
                            {product.isReturnable ? "Yes" : "No"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {product.tags.slice(0, 2).map((tag: string, i: number) => (
                            <Badge key={`${i}-${tag}`} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon"
                            onClick={() => { setViewProduct(product); setIsViewOpen(true); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon"
                            onClick={() => { setEditingProduct(product); setIsEditOpen(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon"
                            onClick={() => {
                              if (confirm("Delete this product?")) handleDeleteProduct(product.id);
                            }}>
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

      {/* VIEW DIALOG */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Product Details</DialogTitle></DialogHeader>
          {viewProduct && (
            <div className="space-y-4">
              <img src={viewProduct.images[0]} className="w-full h-48 object-cover rounded-lg" />
              <h2 className="text-lg font-semibold">{viewProduct.name}</h2>
              <p className="text-sm text-muted-foreground">{viewProduct.description}</p>
              <div className="flex justify-between">
                <span>₹{viewProduct.price}</span>
                <span className={viewProduct.quantity > 0 ? "text-green-600" : "text-muted-foreground"}>
                  {viewProduct.quantity > 0
                    ? `${viewProduct.quantity} in stock`
                    : "Out of stock"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium">{Number(viewProduct.rating || 0).toFixed(1)}</span>
                <span className="text-muted-foreground">({viewProduct.numRatings ?? 0} ratings)</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {viewProduct.tags.map((tag: string, i: number) => (
                  <Badge key={`${i}-${tag}`}>{tag}</Badge>
                ))}
              </div>
              <div className="text-sm">Returnable: {viewProduct.isReturnable ? "Yes" : "No"}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>
          {editingProduct && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <Input name="name"          defaultValue={editingProduct.name} />
              <Textarea name="description" defaultValue={editingProduct.description} />
              <Input name="price"         type="number" min="1"  defaultValue={editingProduct.price} />
              <Input name="originalPrice" type="number" min="0"  defaultValue={editingProduct.originalPrice} />
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Stock quantity</Label>
                <Input
                  id="edit-quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={editingProduct.quantity}
                />
              </div>
              <Input name="material"      defaultValue={editingProduct.material} />
              <Input name="tags"          defaultValue={editingProduct.tags.join(", ")} />
              <div className="flex items-center gap-2">
                <Switch name="isReturnable" defaultChecked={editingProduct.isReturnable} />
                <span>Returnable</span>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default SellerProducts;