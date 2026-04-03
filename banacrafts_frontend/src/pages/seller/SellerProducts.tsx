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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Eye, RotateCcw, ImagePlus, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { normalizeUserFromPayload, useAuth } from "@/context/AuthContext";

const SellerProducts = () => {
  const { user } = useAuth();
  const [productList, setProductList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewProduct, setViewProduct] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { toast } = useToast();
  
const fetchProducts = async () => {
  try {
    const sellerId = user?.id;

    if (!sellerId) return;

    console.log("SELLER ID:", sellerId);

    const res = await fetch(
      `http://localhost:5000/api/products/seller/products/${sellerId}`
    );

    const data = await res.json();

    const formatted = data.map((p: any) => ({
      id: p._id,
      name: p.name,
      description: p.description,
      price: p.price,
      finalPrice: p.finalPrice,
      originalPrice: p.originalPrice,
      category: p.category,
      material: p.material,
      artisanId: "1",
      image: p.images?.[0]?.url || "/placeholder.svg",
      images: [p.images?.[0]?.url || "/placeholder.svg"],
      tags: p.tags || ["Handmade"],
      inStock: p.inStock,
      isReturnable: p.returnable,
      rating: typeof p.rating === "number" ? p.rating : 0,
      numRatings: typeof p.numRatings === "number" ? p.numRatings : 0,
      returnPolicy: p.returnable
        ? "7 days return policy"
        : "No return available",
    }));

    setProductList(formatted);
  } catch (err) {
    console.error(err);
  }
};
  useEffect(() => {
    fetchProducts();
  }, [user?.id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const filteredProducts = productList.filter(
  (product) =>
    product?.name?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
    product?.category?.toLowerCase()?.includes(searchQuery.toLowerCase())
);

  const handleDeleteProduct = async (productId: string) => {
  try {
    await fetch(
      `http://localhost:5000/api/products/seller/products/${productId}`,
      {
        method: "DELETE",
      }
    );

    fetchProducts(); // refresh from DB
    
    toast({
      title: "Product Deleted",
      description: "Deleted from database successfully 🗑️",
    });

  } catch (err) {
    console.error(err);
  }
};
const handleToggleStock = async (productId, currentValue) => {
  try {
    await fetch(
      `http://localhost:5000/api/products/seller/products/${productId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inStock: !currentValue,
        }),
      }
    );

    fetchProducts();

  } catch (err) {
    console.error(err);
  }
};
  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const formData = new FormData(e.currentTarget);
  const storedRaw = (() => {
    try {
      return JSON.parse(localStorage.getItem("banacrafts_user") || "{}");
    } catch {
      return {};
    }
  })();
  const storedNormalized = normalizeUserFromPayload(storedRaw);
  const sellerId = user?.id || storedNormalized?.id;
  if (!sellerId) {
  console.log("No sellerId yet");
  return;
}
  const isReturnable = formData.get("isReturnable") === "on";

  try {
    const price = Number(formData.get("price"));
  const originalPrice = Number(formData.get("originalPrice"));

if (price <= 0) {
  toast({
    title: "Invalid Price",
    description: "Price must be greater than 0",
  });
  return;
}

if (originalPrice < 0) {
  toast({
    title: "Invalid Original Price",
    description: "Cannot be negative",
  });
  return;
}

    const sendData = new FormData();
    const tagsInput = formData.get("tags") as string;

    if (tagsInput) {
      const tagsArray = tagsInput.split(",").map(tag => tag.trim());
      sendData.append("tags", JSON.stringify(tagsArray));
    }
    sendData.append("seller", sellerId);
    sendData.append("name", formData.get("name") as string);
    sendData.append("description", formData.get("description") as string);
    sendData.append("price", formData.get("price") as string);
    sendData.append("originalPrice", formData.get("originalPrice") as string);
    sendData.append("category", formData.get("category") as string);
    sendData.append("material", formData.get("material") as string);
    sendData.append("returnable", String(isReturnable));

    const fileInput = e.currentTarget.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    if (fileInput?.files?.[0]) {
      sendData.append("image", fileInput.files[0]);
    }

    const res = await fetch("http://localhost:5000/api/products/seller/products", {
      method: "POST",
      body: sendData
    });

    const data = await res.json();
    console.log("Backend Response:", data);

    const savedProduct = data;

    const formattedProduct = {
      id: savedProduct._id,
      name: savedProduct.name,
      description: savedProduct.description,
      price: savedProduct.price,
      originalPrice: savedProduct.originalPrice,
      category: savedProduct.category,
      material: savedProduct.material,
      artisanId: "1",
      image: savedProduct.images?.[0]?.url || "/placeholder.svg",
      images: [savedProduct.images?.[0]?.url || "/placeholder.svg"],
      tags: savedProduct.tags || ["Handmade"],
      inStock: true,
      isReturnable: savedProduct.returnable,
      rating: typeof savedProduct.rating === "number" ? savedProduct.rating : 0,
      numRatings: typeof savedProduct.numRatings === "number" ? savedProduct.numRatings : 0,
      returnPolicy: savedProduct.returnable
        ? "7 days return policy"
        : "No return available",
    };

    setProductList([formattedProduct, ...productList]);

    setIsAddDialogOpen(false);
    setImagePreview(null);

    toast({
      title: "Product Added",
      description: "Saved to database successfully ✨",
    });

  } catch (err) {
    console.error(err);
    toast({
      title: "Error",
      description: "Failed to add product",
    });
  }
};



  const handleToggleReturnable = async (productId, currentValue) => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/products/seller/products/${productId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          returnable: !currentValue,
        }),
      }
    );

    const data = await res.json();
    console.log("Updated:", data);

    fetchProducts();

  } catch (err) {
    console.error(err);
  }
};

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              My Products
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your product listings
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
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
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
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
                      <Input
                        id="tags"
                        name="tags"
                        placeholder="e.g handmade, eco-friendly, traditional"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" required />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input id="price" name="price" type="number" min="1" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Original Price (₹)</Label>
                    <Input id="originalPrice" name="originalPrice" type="number" min="0"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="material">Material</Label>
                    <Input id="material" name="material" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <ImagePlus className="h-4 w-4" />
                    Product Image
                  </Label>
                  <Input
                    type="file"
                    name="image"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                  {imagePreview && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="isReturnable" name="isReturnable" defaultChecked />
                  <Label htmlFor="isReturnable" className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Allow Returns & Exchanges
                  </Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Product</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card className="heritage-card mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card className="heritage-card">
          <CardHeader>
            <CardTitle className="text-lg font-display">
              All Products ({filteredProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.material}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                        <span className="font-medium">
                          {Number(product.rating || 0).toFixed(1)}
                        </span>
                        <span className="text-muted-foreground">
                          ({product.numRatings ?? 0})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                        <div>
                          <span className="font-medium">
                            ₹{product.finalPrice !== undefined ? product.finalPrice : product.price}
                          </span>

                          {product.finalPrice && product.finalPrice < product.price && (
                            <span className="text-sm text-muted-foreground line-through ml-2">
                              ₹{product.price}
                            </span>
                          )}

                          {product.originalPrice > 0 && (
                            <span className="text-sm text-muted-foreground line-through ml-2">
                              ₹{product.originalPrice}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={product.inStock}
                          onCheckedChange={() =>
                            handleToggleStock(product.id, product.inStock)
                          }
                        />
                        <span className="text-xs">
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch 
                            checked={product.isReturnable} 
                            onCheckedChange={() => 
                              handleToggleReturnable(product.id, product.isReturnable)
                            }
                        />
                        <span className="text-xs text-muted-foreground">
                          {product.isReturnable ? "Yes" : "No"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {product.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                          setViewProduct(product);
                          setIsViewOpen(true);
                        }}
                      >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                            setEditingProduct(product);
                            setIsEditOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this product?")) {
                                 handleDeleteProduct(product.id);
                            }
                          }}
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
      </main>
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Product Details</DialogTitle>
    </DialogHeader>

    {viewProduct && (
      <div className="space-y-4">
        <img
          src={viewProduct.images[0]}
          className="w-full h-48 object-cover rounded-lg"
        />

        <h2 className="text-lg font-semibold">
          {viewProduct.name}
        </h2>

        <p className="text-sm text-muted-foreground">
          {viewProduct.description}
        </p>

        <div className="flex justify-between">
          <span>₹{viewProduct.price}</span>
          <span className="text-green-600">
            {viewProduct.inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="font-medium">
            {Number(viewProduct.rating || 0).toFixed(1)}
          </span>
          <span className="text-muted-foreground">
            ({viewProduct.numRatings ?? 0} ratings)
          </span>
        </div>

        <div className="flex gap-2 flex-wrap">
          {viewProduct.tags.map((tag, i) => (
            <Badge key={i}>{tag}</Badge>
          ))}
        </div>

        <div className="text-sm">
          Returnable: {viewProduct.isReturnable ? "Yes" : "No"}
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>
<Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Edit Product</DialogTitle>
    </DialogHeader>

    {editingProduct && (
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          const formData = new FormData(e.currentTarget);
            const price = Number(formData.get("price"));
           const originalPrice = Number(formData.get("originalPrice"));

  if (price <= 0) {
    alert("Price must be greater than 0");
    return;
  }

  if (originalPrice < 0) {
    alert("Original price cannot be negative");
    return;
  }
          try {
            await fetch(
              `http://localhost:5000/api/products/seller/products/${editingProduct.id}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: formData.get("name"),
                  description: formData.get("description"),
                  price: formData.get("price"),
                  originalPrice: formData.get("originalPrice"),
                  category: formData.get("category"),
                  material: formData.get("material"),
                  returnable: formData.get("isReturnable") === "on",
                  tags: formData.get("tags")?.toString().split(",").map(t => t.trim()),
                }),
              }
            );

            fetchProducts(); // refresh
            setIsEditOpen(false);

          } catch (err) {
            console.error(err);
          }
        }}
        className="space-y-4"
      >

        {/* NAME */}
        <Input name="name" defaultValue={editingProduct.name} />

        {/* DESCRIPTION */}
        <Textarea
          name="description"
          defaultValue={editingProduct.description}
        />

        {/* PRICE */}
        <Input
          name="price"
          type="number"
          min="1"
          defaultValue={editingProduct.price}
        />

        {/* ORIGINAL PRICE */}
        <Input
          name="originalPrice"
          type="number"
          min="0"
          defaultValue={editingProduct.originalPrice}
        />

        {/* MATERIAL */}
        <Input
          name="material"
          defaultValue={editingProduct.material}
        />

        {/* TAGS */}
        <Input
          name="tags"
          defaultValue={editingProduct.tags.join(", ")}
        />

        {/* RETURNABLE */}
        <div className="flex items-center gap-2">
          <Switch
            name="isReturnable"
            defaultChecked={editingProduct.isReturnable}
          />
          <span>Returnable</span>
        </div>

        <Button type="submit">Save Changes</Button>
      </form>
    )}
  </DialogContent>
</Dialog>
      <Footer />
    </div>
  );
};

export default SellerProducts;
