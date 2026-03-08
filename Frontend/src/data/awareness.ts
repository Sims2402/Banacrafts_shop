export interface AwarenessArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  readTime: number;
  publishedAt: string;
}

export const awarenessArticles: AwarenessArticle[] = [
  {
    id: "1",
    title: "The Art of Handloom: Preserving India's Textile Heritage",
    excerpt: "Discover how handloom weaving continues to be a vital part of India's cultural identity and economic sustainability.",
    content: `Handloom weaving is more than just a craft—it's a living heritage that connects us to generations of skilled artisans. In India, handloom textiles employ over 43 lakh weavers and contribute significantly to rural employment.

At Banasthali, we work with master weavers who use traditional techniques passed down through generations. Each thread they weave carries the weight of history and the promise of sustainable fashion.

**Why Choose Handloom?**
- Eco-friendly: No electricity or harmful chemicals
- Unique: Each piece is one-of-a-kind
- Supports livelihoods: Directly helps artisan families
- Quality: Superior durability and comfort

**Our Commitment**
We ensure fair wages, safe working conditions, and skill development programs for all our artisans. When you buy handloom, you're not just purchasing a product—you're investing in a community.`,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    category: "Heritage Crafts",
    readTime: 5,
    publishedAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Women Empowerment Through Craft",
    excerpt: "How traditional crafts are transforming lives of women in rural Rajasthan, providing economic independence.",
    content: `In the heart of Rajasthan, a quiet revolution is taking place. Women who once had limited opportunities are now becoming entrepreneurs, breadwinners, and preservers of cultural heritage—all through traditional crafts.

**The Banasthali Model**
At Banasthali Vidyapith, we've created a sustainable ecosystem where women artisans:
- Learn and refine traditional skills
- Earn fair wages for their work
- Gain financial independence
- Pass on knowledge to the next generation

**Impact Stories**
- Over 200 women artisans trained in the last 5 years
- 40% increase in household income for participating families
- 15 new craft cooperatives established

**The Ripple Effect**
When a woman earns, her entire family benefits. Children get better education, healthcare improves, and communities grow stronger. Each purchase you make contributes to this positive change.`,
    image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800",
    category: "Women Empowerment",
    readTime: 4,
    publishedAt: "2024-02-20",
  },
  {
    id: "3",
    title: "Sustainable Fashion: The Indian Way",
    excerpt: "Traditional Indian crafts offer a blueprint for sustainable fashion that the world is now recognizing.",
    content: `Long before "sustainability" became a buzzword, Indian artisans were practicing it. Natural dyes, handmade textiles, and zero-waste production are not trends for them—they're traditions.

**Traditional Sustainable Practices**
- Natural dyes from plants and minerals
- Handspun yarn requiring minimal energy
- Biodegradable materials
- Zero-waste production techniques

**Modern Relevance**
As the world grapples with fast fashion's environmental impact, traditional Indian crafts offer solutions:
- 80% less carbon footprint than machine-made textiles
- No water pollution from synthetic dyes
- Biodegradable materials that return to earth

**Making Conscious Choices**
Every handcrafted product you choose is a vote for the planet. At BanaCrafts, we're committed to bringing you authentic, sustainable products that don't compromise on beauty or quality.`,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
    category: "Sustainability",
    readTime: 6,
    publishedAt: "2024-03-10",
  },
];

export const getArticleById = (id: string) => awarenessArticles.find((a) => a.id === id);
