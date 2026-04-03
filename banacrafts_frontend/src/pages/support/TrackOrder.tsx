import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Package, Truck, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { mockOrders } from "@/data/orders";

const TrackOrder = () => {
  const [orderId, setOrderId] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<typeof mockOrders[0] | null>(null);
  const [error, setError] = useState("");

  const handleTrack = () => {
    if (!orderId.trim()) {
      setError("Please enter an order ID");
      return;
    }
    const found = mockOrders.find(o => o.id.toLowerCase() === orderId.toLowerCase());
    if (found) {
      setTrackedOrder(found);
      setError("");
    } else {
      setTrackedOrder(null);
      setError("Order not found. Please check the order ID and try again.");
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { status: "pending", label: "Order Placed", icon: Package },
      { status: "confirmed", label: "Confirmed", icon: CheckCircle },
      { status: "dispatched", label: "Dispatched", icon: Truck },
      { status: "delivered", label: "Delivered", icon: CheckCircle },
    ];
    
    const statusOrder = ["pending", "confirmed", "dispatched", "delivered"];
    const currentIndex = statusOrder.indexOf(trackedOrder?.status || "pending");
    
    return steps.map((step, idx) => ({
      ...step,
      completed: idx <= currentIndex,
      current: idx === currentIndex,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container max-w-2xl">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          
          <h1 className="font-heading text-3xl font-bold mb-2">Track Your Order</h1>
          <p className="text-muted-foreground mb-8">Enter your order ID to see the current status</p>
          
          <div className="bg-card p-6 rounded-xl border border-border mb-8">
            <div className="flex gap-4">
              <Input
                placeholder="Enter Order ID (e.g., ORD001)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                className="flex-1"
              />
              <Button variant="heritage" onClick={handleTrack} className="gap-2">
                <Search className="h-4 w-4" /> Track
              </Button>
            </div>
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </div>

          {trackedOrder && (
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="font-heading text-xl font-semibold">Order #{trackedOrder.id}</h2>
                    <p className="text-sm text-muted-foreground">
                      Placed on {new Date(trackedOrder.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    trackedOrder.status === "delivered" ? "bg-green-100 text-green-700" :
                    trackedOrder.status === "dispatched" ? "bg-blue-100 text-blue-700" :
                    trackedOrder.status === "confirmed" ? "bg-purple-100 text-purple-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {trackedOrder.status}
                  </span>
                </div>

                <div className="relative mt-8">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                  <div className="space-y-8">
                    {getStatusSteps().map((step, idx) => (
                      <div key={idx} className="relative flex items-center gap-4">
                        <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                          step.completed ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-muted-foreground"
                        }`}>
                          <step.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className={`font-medium ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>
                            {step.label}
                          </p>
                          {step.current && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Current status
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="font-heading text-lg font-semibold mb-4">Order Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items</span>
                    <span>{trackedOrder.products.length} item(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="font-semibold">₹{trackedOrder.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment</span>
                    <span className={`capitalize ${
                      trackedOrder.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"
                    }`}>
                      {trackedOrder.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>{trackedOrder.shippingAddress}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!trackedOrder && !error && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Enter your order ID above to track your order</p>
              <p className="text-sm text-muted-foreground mt-2">
                You can find your order ID in the confirmation email or in your order history
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TrackOrder;
