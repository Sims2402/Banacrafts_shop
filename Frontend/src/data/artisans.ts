import artisan1 from "@/assets/artisans/artisan-1.jpg";
import artisan2 from "@/assets/artisans/artisan-2.jpg";
import artisan3 from "@/assets/artisans/artisan-3.jpg";

export interface Artisan {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  location: string;
  image: string;
  bio: string;
  achievements: string[];
  productsCount: number;
}

export const artisans: Artisan[] = [
  {
    id: "1",
    name: "Kamala Devi",
    specialty: "Handloom Weaving",
    experience: 25,
    location: "Banasthali, Rajasthan",
    image: artisan1,
    bio: "Kamala Devi has been weaving traditional textiles for over 25 years. She learned the art from her grandmother and has preserved centuries-old techniques while adding her own creative touch. Her sarees and dupattas are known for their intricate patterns and exceptional quality.",
    achievements: [
      "State Award for Excellence in Handloom",
      "Featured in Vogue India",
      "Trained 50+ young artisans",
    ],
    productsCount: 45,
  },
  {
    id: "2",
    name: "Priya Sharma",
    specialty: "Embroidery & Mirror Work",
    experience: 12,
    location: "Banasthali, Rajasthan",
    image: artisan2,
    bio: "Priya brings traditional Rajasthani embroidery into the modern era. Her work combines mirror work, thread embroidery, and contemporary designs. Each piece she creates tells a story of heritage and creativity.",
    achievements: [
      "Young Artisan Award 2022",
      "Export Quality Certification",
      "Featured in local exhibitions",
    ],
    productsCount: 38,
  },
  {
    id: "3",
    name: "Savitri Kumari",
    specialty: "Pottery & Metal Work",
    experience: 40,
    location: "Banasthali, Rajasthan",
    image: artisan3,
    bio: "Savitri Kumari is a master potter with four decades of experience. Her brass and clay works are considered among the finest in Rajasthan. She specializes in traditional diyas, decorative pots, and ceremonial items.",
    achievements: [
      "National Handicrafts Award",
      "UNESCO Recognized Artisan",
      "Heritage Craft Preservation Award",
    ],
    productsCount: 28,
  },
];

export const getArtisanById = (id: string) => artisans.find((a) => a.id === id);
