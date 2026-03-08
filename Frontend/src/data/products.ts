import silkSaree from "@/assets/products/silk-saree.jpg";
import embroideredClutch from "@/assets/products/embroidered-clutch.jpg";
import blockPrintDupatta from "@/assets/products/block-print-dupatta.jpg";
import brassDiya from "@/assets/products/brass-diya.jpg";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: {
    public_id: string;
    url: string;
  }[];
  category: string;
  material: string;
  tags: string[];
  artisanId: string;
  inStock: boolean;
  isReturnable: boolean;
  rating: number;
  reviews: number;
  returnPolicy: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Khadi Silk Saree with Zari Border",
    description: "Exquisite handwoven Khadi silk saree featuring intricate golden zari border work. Each saree takes 15-20 days to create, showcasing the remarkable skill of our master weavers.",
    price: 4500,
    originalPrice: 5500,
    image: silkSaree,
    images: [
  {
    public_id: "silkSaree",
    url: silkSaree,
  },
],
    category: "Sarees",
    material: "Khadi Silk",
    tags: ["Handmade", "Eco-friendly", "Limited Edition"],
    artisanId: "1",
    inStock: true,
    isReturnable: true,
    rating: 4.8,
    reviews: 124,
    returnPolicy: "7 days return policy",
  },
  {
    id: "2",
    name: "Mirror Work Embroidered Clutch",
    description: "Beautiful handcrafted clutch featuring traditional mirror work and gold thread embroidery. Perfect for festive occasions and weddings.",
    price: 1200,
    originalPrice: 1500,
    image: embroideredClutch,
    images: [
  {
    public_id: "dummy_embroidery",
    url: embroideredClutch,
  },
],
    category: "Accessories",
    material: "Cotton Canvas with Embroidery",
    tags: ["Handmade", "Festive", "Traditional"],
    artisanId: "2",
    inStock: true,
    isReturnable: true,
    rating: 4.6,
    reviews: 89,
    returnPolicy: "7 days return policy",
  },
  {
    id: "3",
    name: "Indigo Block Print Dupatta",
    description: "Hand block printed cotton dupatta with traditional paisley and floral motifs. Natural indigo dye gives it a timeless appeal.",
    price: 850,
    image: blockPrintDupatta,
    images: [
  {
    public_id: "blockPrintDupatta",
    url: blockPrintDupatta,
  },
],
    category: "Dupattas",
    material: "Pure Cotton",
    tags: ["Handmade", "Eco-friendly", "Natural Dye"],
    artisanId: "1",
    inStock: true,
    isReturnable: true,
    rating: 4.7,
    reviews: 156,
    returnPolicy: "7 days return policy",
  },
  {
    id: "4",
    name: "Traditional Brass Diya Lamp",
    description: "Intricately carved brass oil lamp (diya) for spiritual and home decor purposes. Each piece is handcrafted by skilled artisans.",
    price: 650,
    image: brassDiya,
    images: [
  {
    public_id: "brassDiya",
    url: brassDiya,
  },
],
    category: "Home Decor",
    material: "Brass",
    tags: ["Handmade", "Spiritual", "Gift Item"],
    artisanId: "3",
    inStock: true,
    isReturnable: false,
    rating: 4.9,
    reviews: 78,
    returnPolicy: "No return available",
  },
  {
    id: "5",
    name: "Bandhani Silk Stole",
    description: "Vibrant tie-dye bandhani stole made from pure silk. Traditional Rajasthani craft with modern appeal.",
    price: 1800,
    originalPrice: 2200,
    image: silkSaree,
    images: [
  {
    public_id: "silkSaree",
    url: silkSaree,
  },
],
    category: "Stoles",
    material: "Pure Silk",
    tags: ["Handmade", "Traditional", "Festive"],
    artisanId: "2",
    inStock: true,
    isReturnable: true,
    rating: 4.5,
    reviews: 92,
    returnPolicy: "7 days return policy",
  },
  {
    id: "6",
    name: "Handwoven Cotton Table Runner",
    description: "Beautiful handwoven cotton table runner with traditional geometric patterns. Adds warmth to any dining space.",
    price: 450,
    image: blockPrintDupatta,
    images: [
  {
    public_id: "blockPrintDupatta",
    url: blockPrintDupatta,
  },
],
    category: "Home Decor",
    material: "Handloom Cotton",
    tags: ["Handmade", "Eco-friendly", "Home Essentials"],
    artisanId: "1",
    inStock: true,
    isReturnable: false,
    rating: 4.4,
    reviews: 45,
    returnPolicy: "No return available",
  },
];

export const categories = [
  "All",
  "Sarees",
  "Dupattas",
  "Stoles",
  "Accessories",
  "Home Decor",
];

export const getProductById = (id: string) => products.find((p) => p.id === id);
export const getProductsByCategory = (category: string) =>
  category === "All" ? products : products.filter((p) => p.category === category);
export const getProductsByArtisan = (artisanId: string) =>
  products.filter((p) => p.artisanId === artisanId);
