import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare, ThumbsUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  reply?: string;
}

const mockReviews: Review[] = [
  {
    id: "rev1",
    productId: "1",
    productName: "Handwoven Silk Saree",
    customerName: "Priya Sharma",
    rating: 5,
    comment:
      "Absolutely beautiful saree! The craftsmanship is exceptional and the colors are vibrant. Very happy with my purchase.",
    date: "2025-12-28",
    reply: "Thank you so much for your kind words! We're delighted you love the saree.",
  },
  {
    id: "rev2",
    productId: "2",
    productName: "Embroidered Clutch Bag",
    customerName: "Anjali Verma",
    rating: 4,
    comment:
      "Lovely embroidery work. The clutch is perfect for occasions. Delivery was quick too!",
    date: "2025-12-30",
  },
  {
    id: "rev3",
    productId: "1",
    productName: "Handwoven Silk Saree",
    customerName: "Meera Patel",
    rating: 5,
    comment:
      "This saree exceeded my expectations. The handwoven quality is clearly visible. Worth every rupee!",
    date: "2026-01-01",
  },
];

const SellerReviews = () => {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const { toast } = useToast();

  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const handleReply = (reviewId: string) => {
    if (!replyText.trim()) return;

    setReviews(
      reviews.map((r) =>
        r.id === reviewId ? { ...r, reply: replyText } : r
      )
    );
    setReplyingTo(null);
    setReplyText("");
    toast({
      title: "Reply Posted",
      description: "Your response has been added to the review.",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Customer Reviews
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and respond to customer feedback
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="heritage-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display">
                    {avgRating.toFixed(1)}
                  </p>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="heritage-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display">{reviews.length}</p>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="heritage-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <ThumbsUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display">
                    {reviews.filter((r) => r.reply).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Replied</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        <Card className="heritage-card">
          <CardHeader>
            <CardTitle className="text-lg font-display">All Reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-border pb-6 last:border-0"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium">{review.customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      for {review.productName}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(review.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <p className="text-foreground mb-4">{review.comment}</p>

                {review.reply ? (
                  <div className="bg-muted/50 p-4 rounded-lg ml-6 border-l-2 border-primary">
                    <p className="text-sm font-medium mb-1">Your Reply:</p>
                    <p className="text-sm text-muted-foreground">{review.reply}</p>
                  </div>
                ) : replyingTo === review.id ? (
                  <div className="ml-6 space-y-2">
                    <Textarea
                      placeholder="Write your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleReply(review.id)}>
                        Post Reply
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-6"
                    onClick={() => setReplyingTo(review.id)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default SellerReviews;
