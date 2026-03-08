import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { mockDiscounts, getActiveDiscounts, Discount } from "@/data/discounts";
import {
  MapPin,
  Truck,
  Store,
  CreditCard,
  Banknote,
  Smartphone,
  Package,
  ShieldCheck,
  Tag,
  Percent,
  CheckCircle2,
  RotateCcw,
  Ban,
} from "lucide-react";
import { api } from "@/api/api";
const getProductId = (product: any) => product._id || product.id;

interface AppliedDiscount {
  discount: Discount;
  appliedAmount: number;
  productId?: string;
  productName?: string;
}

interface ProductDiscountInfo {
  productId: string;
  productName: string;
  originalPrice: number;
  quantity: number;
  applicableDiscounts: Discount[];
  bestDiscount: Discount | null;
  discountedPrice: number;
  savings: number;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();

  const [deliveryMethod, setDeliveryMethod] = useState<"self_pickup" | "seller_delivery">("seller_delivery");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "cash">("upi");
  const [openBoxDelivery, setOpenBoxDelivery] = useState(false);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Get active discounts
  const activeDiscounts = useMemo(() => getActiveDiscounts(mockDiscounts), []);

  // Calculate discounts for each product and find the best one
  const productDiscountInfo = useMemo((): ProductDiscountInfo[] => {
    return items.map((item) => {
      const productTotal = item.product.price * item.quantity;
      
      // Find all applicable discounts for this product
      const applicableDiscounts = activeDiscounts.filter((discount) => {
        // Check scope
        if (discount.scope === "product" && discount.productId !== item.product.id) {
          return false;
        }
        if (discount.scope === "category" && discount.categoryId !== item.product.category.toLowerCase()) {
          return false;
        }
        // Check min order value (apply to product level for simplicity)
        if (discount.minOrderValue && productTotal < discount.minOrderValue) {
          return false;
        }
        // Check usage limit
        if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
          return false;
        }
        return true;
      });

      // Calculate discount amount for each applicable discount
      const discountsWithAmounts = applicableDiscounts.map((discount) => {
        let discountAmount: number;
        if (discount.type === "percentage") {
          discountAmount = (productTotal * discount.value) / 100;
          if (discount.maxDiscount) {
            discountAmount = Math.min(discountAmount, discount.maxDiscount);
          }
        } else {
          discountAmount = discount.value;
        }
        return { discount, discountAmount };
      });

      // Find the best (highest) discount
      const bestDiscountInfo = discountsWithAmounts.reduce<{ discount: Discount; discountAmount: number } | null>(
        (best, current) => {
          if (!best || current.discountAmount > best.discountAmount) {
            return current;
          }
          return best;
        },
        null
      );

      const savings = bestDiscountInfo?.discountAmount || 0;

      return {
        productId: item.product.id,
        productName: item.product.name,
        originalPrice: productTotal,
        quantity: item.quantity,
        applicableDiscounts,
        bestDiscount: bestDiscountInfo?.discount || null,
        discountedPrice: productTotal - savings,
        savings,
      };
    });
  }, [items, activeDiscounts]);

  // Calculate total savings and final price
  const totalSavings = useMemo(() => {
    return productDiscountInfo.reduce((sum, info) => sum + info.savings, 0);
  }, [productDiscountInfo]);

  const deliveryCharge = deliveryMethod === "seller_delivery" ? 50 : 0;
  const subtotalAfterDiscount = totalPrice - totalSavings;
  const finalTotal = subtotalAfterDiscount + deliveryCharge;

  // Get all unique applied discounts for display
  const appliedDiscounts = useMemo((): AppliedDiscount[] => {
    const discountMap = new Map<string, AppliedDiscount>();
    
    productDiscountInfo.forEach((info) => {
      if (info.bestDiscount && info.savings > 0) {
        const existingDiscount = discountMap.get(info.bestDiscount.id);
        if (existingDiscount) {
          existingDiscount.appliedAmount += info.savings;
        } else {
          discountMap.set(info.bestDiscount.id, {
            discount: info.bestDiscount,
            appliedAmount: info.savings,
            productId: info.productId,
            productName: info.productName,
          });
        }
      }
    });

    return Array.from(discountMap.values());
  }, [productDiscountInfo]);

  if (items.length === 0) {
    navigate("/customer/cart");
    return null;
  }

  const handlePlaceOrder = async () => {
  try {
    setIsProcessing(true);

    const orderItems = items.map((item) => ({
      product: getProductId(item.product),
      quantity: item.quantity,
    }));

    const data = await api.post("/orders", {
      orderItems,
      deliveryMethod,
      deliveryAddress: deliveryMethod === "seller_delivery" ? address : "Self Pickup",
      phone,
      paymentMethod: paymentMethod === "upi" ? "Online" : "Cash",
    });

    clearCart();

    const {
  _id,
  totalPrice,
  deliveryMethod: backendDeliveryMethod,
  paymentMethod: backendPaymentMethod,
} = data as any;

navigate(`/order/success/${_id}`);


  } catch (error: any) {
    alert(error.message || "Failed to place order");
  } finally {
    setIsProcessing(false);
  }
};


  const getDiscountLabel = (discount: Discount) => {
    if (discount.type === "percentage") {
      return `${discount.value}% OFF`;
    }
    return `₹${discount.value} OFF`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Method */}
            <Card className="heritage-card">
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Delivery Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={deliveryMethod}
                  onValueChange={(val) => setDeliveryMethod(val as "self_pickup" | "seller_delivery")}
                  className="space-y-4"
                >
                  <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
                    <RadioGroupItem value="seller_delivery" id="seller_delivery" className="mt-1" />
                    <Label htmlFor="seller_delivery" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 font-medium">
                        <Truck className="h-4 w-4" />
                        Seller Delivery
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Product will be delivered to your address by the artisan. Delivery charge: ₹50
                      </p>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
                    <RadioGroupItem value="self_pickup" id="self_pickup" className="mt-1" />
                    <Label htmlFor="self_pickup" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 font-medium">
                        <Store className="h-4 w-4" />
                        Self Pickup
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Collect your order directly from Banasthali Vidyapith campus. Free of charge!
                      </p>
                    </Label>
                  </div>
                </RadioGroup>

                {deliveryMethod === "seller_delivery" && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="openbox"
                        checked={openBoxDelivery}
                        onCheckedChange={(checked) => setOpenBoxDelivery(checked as boolean)}
                      />
                      <Label htmlFor="openbox" className="flex items-center gap-2 cursor-pointer">
                        <Package className="h-4 w-4 text-accent" />
                        Open Box Delivery
                        <span className="text-xs text-muted-foreground">(Inspect before accepting)</span>
                      </Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Delivery Address
                      </Label>
                      <Textarea
                        id="address"
                        placeholder="Enter your complete address including city, state and PIN code"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="heritage-card">
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(val) => setPaymentMethod(val as "upi" | "cash")}
                  className="space-y-4"
                >
                  <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
                    <RadioGroupItem value="upi" id="upi" className="mt-1" />
                    <Label htmlFor="upi" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 font-medium">
                        <Smartphone className="h-4 w-4" />
                        UPI Payment
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Pay using Google Pay, PhonePe, Paytm or any UPI app
                      </p>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
                    <RadioGroupItem value="cash" id="cash" className="mt-1" />
                    <Label htmlFor="cash" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 font-medium">
                        <Banknote className="h-4 w-4" />
                        Cash on {deliveryMethod === "self_pickup" ? "Pickup" : "Delivery"}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Pay with cash when you {deliveryMethod === "self_pickup" ? "collect your order" : "receive your delivery"}
                      </p>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === "upi" && (
                  <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center gap-2 text-sm font-medium mb-2">
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                      Secure UPI Payment
                    </div>
                    <p className="text-sm text-muted-foreground">
                      You will receive a UPI payment request after placing the order. 
                      Complete the payment within 24 hours to confirm your order.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="heritage-card sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg font-display">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items with discount info */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {productDiscountInfo.map((info) => {
                    const item = items.find((i) => i.product.id === info.productId);
                    if (!item) return null;

                    return (
                      <div key={info.productId} className="flex gap-3">
                        <div className="relative">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          {item.product.isReturnable ? (
                            <Badge 
                              variant="secondary" 
                              className="absolute -top-2 -right-2 text-[10px] px-1 py-0.5 bg-green-100 text-green-700"
                            >
                              <RotateCcw className="h-2.5 w-2.5" />
                            </Badge>
                          ) : (
                            <Badge 
                              variant="secondary" 
                              className="absolute -top-2 -right-2 text-[10px] px-1 py-0.5 bg-gray-100 text-gray-600"
                            >
                              <Ban className="h-2.5 w-2.5" />
                            </Badge>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                          <p className="text-xs text-muted-foreground">Qty: {info.quantity}</p>
                          <div className="flex items-center gap-2">
                            {info.savings > 0 ? (
                              <>
                                <p className="text-sm font-medium text-primary">
                                  ₹{info.discountedPrice.toLocaleString()}
                                </p>
                                <p className="text-xs text-muted-foreground line-through">
                                  ₹{info.originalPrice.toLocaleString()}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm font-medium text-primary">
                                ₹{info.originalPrice.toLocaleString()}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {info.bestDiscount && info.savings > 0 && (
                              <Badge variant="secondary" className="text-xs gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                {getDiscountLabel(info.bestDiscount)} applied
                              </Badge>
                            )}
                            <Badge 
                              variant="outline" 
                              className={`text-[10px] ${item.product.isReturnable ? "text-green-600 border-green-200" : "text-gray-500 border-gray-200"}`}
                            >
                              {item.product.isReturnable ? "Returnable" : "Non-returnable"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Available Offers Section */}
                {appliedDiscounts.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        Offers Applied
                      </h4>
                      <div className="space-y-2">
                        {appliedDiscounts.map((applied) => (
                          <div
                            key={applied.discount.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900"
                          >
                            <div className="flex items-center gap-2">
                              <Percent className="h-4 w-4 text-green-600" />
                              <div>
                                <p className="text-xs font-medium text-green-700 dark:text-green-400">
                                  {applied.discount.label || applied.discount.code}
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-500">
                                  {getDiscountLabel(applied.discount)}
                                </p>
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                              -₹{applied.appliedAmount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Pricing */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        Discount Savings
                      </span>
                      <span>-₹{totalSavings.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-display font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">₹{finalTotal.toLocaleString()}</span>
                  </div>
                  {totalSavings > 0 && (
                    <p className="text-xs text-center text-green-600 font-medium">
                      🎉 You're saving ₹{totalSavings.toLocaleString()} on this order!
                    </p>
                  )}
                </div>

                <Button
                  variant="hero"
                  className="w-full"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || (deliveryMethod === "seller_delivery" && !address)}
                >
                  {isProcessing ? "Processing..." : "Place Order"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By placing this order, you agree to our Terms of Service and support local artisans.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;