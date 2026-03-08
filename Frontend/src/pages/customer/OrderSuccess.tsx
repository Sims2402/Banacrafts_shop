import { useEffect,useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  Package,
  Truck,
  Store,
  Smartphone,
  Banknote,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { api } from "@/api/api";


const OrderSuccess = () => {
const { id } = useParams();
const navigate = useNavigate();

const [orderData, setOrderData] = useState<any | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchOrder = async () => {
    try {
      const data = await api.get(`/orders/${id}`);
      setOrderData(data);
    } catch (error) {
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  if (id) fetchOrder();
}, [id, navigate]);

if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Loading order details...</p>
    </div>
  );
}

if (!orderData) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Animation */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
              <CheckCircle2 className="h-14 w-14 text-green-600" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-muted-foreground">
              Thank you for supporting our artisans. Your order has been received.
            </p>
          </div>

          {/* Order Details Card */}
          <Card className="heritage-card mb-8">
            <CardContent className="pt-6">
              <div className="grid gap-6">
                {/* Order ID */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                  <p className="text-2xl font-display font-bold text-primary">
                    {orderData?._id}
                  </p>
                </div>

                {/* Order Info Grid */}
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      {orderData.deliveryMethod === "self_pickup" ? (
                        <Store className="h-4 w-4" />
                      ) : (
                        <Truck className="h-4 w-4" />
                      )}
                      Delivery Method
                    </div>
                    <p className="font-medium">
                      {orderData.deliveryMethod === "Self Pickup"
                        ? "Self Pickup"
                        : "Seller Delivery"}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      {orderData.paymentMethod === "upi" ? (
                        <Smartphone className="h-4 w-4" />
                      ) : (
                        <Banknote className="h-4 w-4" />
                      )}
                      Payment Method
                    </div>
                    <p className="font-medium">
                      {orderData.paymentMethod === "Online" ? "UPI Payment" : "Cash on Delivery"}
                    </p>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                  <p className="text-3xl font-display font-bold text-accent">
                    ₹{orderData.totalPrice.toLocaleString()}
                  </p>
                </div>

                {/* Payment Instructions */}
                {orderData.paymentMethod === "upi" && (
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-left">
                    <div className="flex items-center gap-2 font-medium text-blue-800 mb-2">
                      <Smartphone className="h-4 w-4" />
                      UPI Payment Instructions
                    </div>
                    <p className="text-sm text-blue-700">
                      You will receive a UPI payment request from the seller shortly.
                      Please complete the payment within 24 hours to confirm your order.
                    </p>
                  </div>
                )}

                {orderData.deliveryMethod === "self_pickup" && (
                  <div className="p-4 rounded-lg bg-orange-50 border border-orange-200 text-left">
                    <div className="flex items-center gap-2 font-medium text-orange-800 mb-2">
                      <Store className="h-4 w-4" />
                      Pickup Instructions
                    </div>
                    <p className="text-sm text-orange-700">
                      Please collect your order from Banasthali Vidyapith campus.
                      Show your Order ID at the collection center.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline Preview */}
          <Card className="heritage-card mb-8">
            <CardContent className="pt-6">
              <h3 className="font-display font-semibold mb-4 text-left">What's Next?</h3>
              <div className="flex items-center justify-between relative">
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
                
                <div className="relative flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center z-10">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs mt-2 font-medium">Order Placed</span>
                </div>

                <div className="relative flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-muted border-2 border-border flex items-center justify-center z-10">
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-xs mt-2 text-muted-foreground">Confirmed</span>
                </div>

                <div className="relative flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-muted border-2 border-border flex items-center justify-center z-10">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-xs mt-2 text-muted-foreground">Dispatched</span>
                </div>

                <div className="relative flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-muted border-2 border-border flex items-center justify-center z-10">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-xs mt-2 text-muted-foreground">Delivered</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/customer/orders">
              <Button variant="heritage" className="gap-2">
                <Package className="h-4 w-4" />
                View My Orders
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderSuccess;