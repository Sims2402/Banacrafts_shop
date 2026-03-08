import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrderStatusBadge from "@/components/common/OrderStatusBadge";
import PaymentStatusBadge from "@/components/common/PaymentStatusBadge";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Store,
  ArrowLeft,
  Eye,
  XCircle,
  RotateCcw,
  RefreshCw,
  Ban,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useEffect } from "react";
import { api } from "@/api/api";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
type Order = any;
type OrderStatus =
  | "pending"
  | "confirmed"
  | "dispatched"
  | "delivered"
  | "cancelled";

type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";
const normalizeOrderStatus = (status?: string): OrderStatus => {
  if (!status) return "pending";

  const s = status.toLowerCase();

  if (["pending"].includes(s)) return "pending";
  if (["confirmed", "processing"].includes(s)) return "confirmed";
  if (["shipped", "dispatch", "dispatched"].includes(s)) return "dispatched";
  if (["delivered"].includes(s)) return "delivered";
  if (["cancelled", "canceled"].includes(s)) return "cancelled";

  return "pending";
};

const normalizePaymentStatus = (status?: string): PaymentStatus => {
  if (!status) return "pending";

  const s = status.toLowerCase();

  if (["paid", "success", "completed"].includes(s)) return "paid";
  if (["failed"].includes(s)) return "failed";
  if (["refunded"].includes(s)) return "refunded";

  return "pending";
};

const CustomerOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
const [loading, setLoading] = useState(true);
useEffect(() => {
const fetchOrders = async () => {
  try {
    setLoading(true);

    const rawOrders = await api.get<any[]>("/orders/my");

    const normalizedOrders = (rawOrders || []).map((order) => ({
      id: order._id,

      status: normalizeOrderStatus(order.orderStatus),
      paymentStatus: normalizePaymentStatus(order.paymentStatus),

      paymentMethod: order.paymentMethod || "cash",
      deliveryMethod: order.deliveryMethod || "seller_delivery",

      totalAmount: order.totalPrice || 0,

      createdAt: order.createdAt,
      updatedAt: order.updatedAt,

      sellerName: order.seller?.name || "Seller",
      shippingAddress: order.deliveryAddress || "",
      customerPhone: order.phone || "",

      products: (order.orderItems || []).map((item: any) => ({
        productId: item.product?._id || "",
        productName: item.product?.name || "Product",
        image: item.product?.images?.[0]?.url || "/placeholder.png",
        price: item.price || 0,
        quantity: item.quantity || 1,
        isReturnable: true,
      })),

      customerRequest: order.customerRequest || null,
    }));

    setOrders(normalizedOrders);
  } catch (error: any) {
    console.error("Failed to fetch orders:", error.message);
  } finally {
    setLoading(false);
  }
};


  fetchOrders();
}, []);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [actionDialog, setActionDialog] = useState<{
    type: "cancel" | "exchange" | "return" | null;
    order: Order | null;
  }>({ type: null, order: null });
  const [requestReason, setRequestReason] = useState("");
  const { toast } = useToast();

  const filteredOrders = activeTab === "all" 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
        return <Package className="h-4 w-4" />;
      case "dispatched":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle2 className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getProgressWidth = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "25%";
      case "confirmed":
        return "50%";
      case "dispatched":
        return "75%";
      case "delivered":
        return "100%";
      default:
        return "0%";
    }
  };

  // Check if order can be cancelled (before dispatch and no pending request)
  const canCancel = (order: Order) => {
    return (order.status === "pending" || order.status === "confirmed") && !order.customerRequest;
  };

  // Check if order can be exchanged before dispatch
  const canExchangeBeforeDispatch = (order: Order) => {
    return (order.status === "pending" || order.status === "confirmed") && !order.customerRequest;
  };

  // Check if order has returnable products (for post-delivery exchange)
  const hasReturnableProducts = (order: Order) => {
    return order.products.some(product => product.isReturnable);
  };

  // Check if exchange is available after delivery
  const canExchangeAfterDelivery = (order: Order) => {
    return order.status === "delivered" && hasReturnableProducts(order) && !order.customerRequest;
  };

  const handleCancelOrder = () => {
    if (!actionDialog.order) return;
    
    setOrders(prev => prev.map(order => 
      order.id === actionDialog.order!.id 
        ? { 
            ...order, 
            customerRequest: {
              type: "cancel" as const,
              status: "pending" as const,
              reason: requestReason || "Customer requested cancellation",
              requestedAt: new Date().toISOString()
            },
            updatedAt: new Date().toISOString() 
          }
        : order
    ));
    
    toast({
      title: "Cancellation Requested",
      description: `Your cancellation request for Order #${actionDialog.order.id} has been submitted. The seller will review it shortly.`,
    });
    setActionDialog({ type: null, order: null });
    setRequestReason("");
  };

  const handleExchangeRequest = (isReturn: boolean = false) => {
    if (!actionDialog.order) return;
    
    const isPreDispatch = actionDialog.order.status === "pending" || actionDialog.order.status === "confirmed";
    
    setOrders(prev => prev.map(order => 
      order.id === actionDialog.order!.id 
        ? { 
            ...order, 
            customerRequest: {
              type: isReturn ? "return" as const : "exchange" as const,
              status: "pending" as const,
              reason: requestReason || `Customer requested ${isReturn ? "return" : "exchange"}`,
              requestedAt: new Date().toISOString()
            },
            updatedAt: new Date().toISOString() 
          }
        : order
    ));
    
    toast({
      title: isReturn ? "Return Requested" : "Exchange Requested",
      description: isPreDispatch 
        ? `Your ${isReturn ? "return" : "exchange"} request for Order #${actionDialog.order.id} has been submitted. The seller will review it shortly.`
        : `Your ${isReturn ? "return" : "exchange"} request for Order #${actionDialog.order.id} has been submitted. You'll be notified once the seller responds.`,
    });
    setActionDialog({ type: null, order: null });
    setRequestReason("");
  };

  const getReturnableProductsList = (order: Order) => {
    return order.products.filter(p => p.isReturnable);
  };

  const getNonReturnableProductsList = (order: Order) => {
    return order.products.filter(p => !p.isReturnable);
  };

  // Get request status badge
  const getRequestStatusBadge = (order: Order) => {
    if (!order.customerRequest) return null;
    
    const { type, status } = order.customerRequest;
    
    if (type === "cancel") {
      if (status === "pending") {
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
            <Clock className="h-3 w-3" />
            Cancellation Requested
          </Badge>
        );
      }
      if (status === "approved") {
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
            <CheckCircle className="h-3 w-3" />
            Cancelled
          </Badge>
        );
      }
      if (status === "rejected") {
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 gap-1">
            <XCircle className="h-3 w-3" />
            Cancellation Rejected
          </Badge>
        );
      }
    }
    
    if (type === "exchange" || type === "return") {
      const label = type === "return" ? "Return" : "Exchange";
      if (status === "pending") {
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
            <Clock className="h-3 w-3" />
            {label} Requested
          </Badge>
        );
      }
      if (status === "approved") {
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
            <CheckCircle className="h-3 w-3" />
            {label} Approved
          </Badge>
        );
      }
      if (status === "rejected") {
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
            <XCircle className="h-3 w-3" />
            {label} Rejected
          </Badge>
        );
      }
    }
    
    return null;
  };

  // Get request status message for display
  const getRequestMessage = (order: Order) => {
    if (!order.customerRequest) return null;
    
    const { type, status, reason } = order.customerRequest;
    
    if (type === "cancel") {
      if (status === "pending") {
        return {
          icon: <Clock className="h-5 w-5 text-amber-500" />,
          title: "Cancellation Request Pending",
          message: "Your cancellation request is being reviewed by the seller. You'll be notified once it's processed.",
          variant: "warning" as const,
          reason
        };
      }
      if (status === "approved") {
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          title: "Order Cancelled",
          message: "Your order has been cancelled successfully. If you paid online, a refund will be processed within 5-7 business days.",
          variant: "success" as const,
          reason
        };
      }
      if (status === "rejected") {
        return {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          title: "Cancellation Rejected",
          message: "The seller was unable to cancel your order. It may have already been dispatched or processed. Please contact support for assistance.",
          variant: "error" as const,
          reason
        };
      }
    }
    
    if (type === "exchange" || type === "return") {
      const label = type === "return" ? "Return" : "Exchange";
      if (status === "pending") {
        return {
          icon: <Clock className="h-5 w-5 text-blue-500" />,
          title: `${label} Request Pending`,
          message: `Your ${label.toLowerCase()} request is being reviewed by the seller. You'll be notified once they respond.`,
          variant: "info" as const,
          reason
        };
      }
      if (status === "approved") {
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          title: `${label} Approved`,
          message: type === "return" 
            ? "Your return has been approved. Please ship the item back within 7 days. A refund will be processed once we receive the item."
            : "Your exchange has been approved. The seller will contact you to arrange the pickup and send the replacement item.",
          variant: "success" as const,
          reason
        };
      }
      if (status === "rejected") {
        return {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          title: `${label} Rejected`,
          message: `Unfortunately, your ${label.toLowerCase()} request could not be approved. Please contact customer support for more details.`,
          variant: "error" as const,
          reason
        };
      }
    }
    
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/customer/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              My Orders
            </h1>
            <p className="text-muted-foreground">Track and manage your orders</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="dispatched">In Transit</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Orders List */}
        {loading ? (
  <Card className="heritage-card">
    <CardContent className="py-12 text-center">
      <p className="text-muted-foreground">Loading your orders...</p>
    </CardContent>
  </Card>
) : filteredOrders.length === 0 ? (

          <Card className="heritage-card">
            <CardContent className="py-12 text-center">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-display font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-6">
                {activeTab === "all" 
                  ? "You haven't placed any orders yet." 
                  : `No ${activeTab} orders found.`}
              </p>
              <Link to="/products">
                <Button variant="heritage">Start Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="heritage-card">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-display font-semibold text-lg">
                            Order #{order.id}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <OrderStatusBadge status={order.status} />
                          <PaymentStatusBadge status={order.paymentStatus} />
                          {getRequestStatusBadge(order)}
                        </div>
                      </div>

                      {/* Request Status Message */}
                      {(() => {
                        const requestMessage = getRequestMessage(order);
                        if (!requestMessage) return null;
                        return (
                          <div className={`mb-4 p-3 rounded-lg border ${
                            requestMessage.variant === "warning" ? "bg-amber-50 border-amber-200" :
                            requestMessage.variant === "success" ? "bg-green-50 border-green-200" :
                            requestMessage.variant === "error" ? "bg-red-50 border-red-200" :
                            "bg-blue-50 border-blue-200"
                          }`}>
                            <div className="flex items-start gap-3">
                              {requestMessage.icon}
                              <div className="flex-1">
                                <h4 className="font-medium text-foreground text-sm">{requestMessage.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1">{requestMessage.message}</p>
                                {requestMessage.reason && (
                                  <p className="text-xs mt-2">
                                    <span className="font-medium">Your reason:</span> {requestMessage.reason}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Products */}
                      <div className="flex gap-3 mb-4 overflow-x-auto">
                        {order.products.map((product, idx) => (
                          <div key={idx} className="flex-shrink-0 relative">
                            <img
                              src={product.image}
                              alt={product.productName}
                              className="w-20 h-20 rounded-lg object-cover border border-border"
                            />
                            {product.isReturnable && (
                              <Badge 
                                variant="secondary" 
                                className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0.5"
                              >
                                Returnable
                              </Badge>
                            )}
                          </div>
                        ))}
                        <div className="flex flex-col justify-center">
                          <p className="text-sm font-medium">
                            {order.products.length} item{order.products.length > 1 ? "s" : ""}
                          </p>
                          <p className="text-lg font-display font-bold text-primary">
                            ₹{order.totalAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {order.status !== "cancelled" && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Pending
                            </span>
                            <span className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              Confirmed
                            </span>
                            <span className="flex items-center gap-1">
                              <Truck className="h-3 w-3" />
                              Dispatched
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Delivered
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                              style={{ width: getProgressWidth(order.status) }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Delivery Info */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {order.deliveryMethod === "self_pickup" ? (
                          <span className="flex items-center gap-1">
                            <Store className="h-4 w-4" />
                            Self Pickup
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {order.shippingAddress?.split(",")[0] || "Home Delivery"}
                          </span>
                        )}
                        {order.openBoxDelivery && (
                          <Badge variant="outline" className="text-xs">
                            Open Box Delivery
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-2 lg:justify-start flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>

                      {/* Cancel Order - Before Dispatch */}
                      {canCancel(order) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => setActionDialog({ type: "cancel", order })}
                        >
                          <Ban className="h-4 w-4" />
                          Cancel Order
                        </Button>
                      )}

                      {/* Exchange - Before Dispatch */}
                      {canExchangeBeforeDispatch(order) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => setActionDialog({ type: "exchange", order })}
                        >
                          <RefreshCw className="h-4 w-4" />
                          Request Exchange
                        </Button>
                      )}

                      {/* Exchange/Return - After Delivery (only if returnable) */}
                      {canExchangeAfterDelivery(order) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => setActionDialog({ type: "return", order })}
                        >
                          <RotateCcw className="h-4 w-4" />
                          Return/Exchange
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Order Detail Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                Order #{selectedOrder?.id}
              </DialogTitle>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6">
                {/* Status */}
                <div className="flex gap-2">
                  <OrderStatusBadge status={selectedOrder.status} />
                  <PaymentStatusBadge status={selectedOrder.paymentStatus} />
                </div>

                {/* Products */}
                <div>
                  <h4 className="font-semibold mb-3">Products</h4>
                  <div className="space-y-3">
                    {selectedOrder.products.map((product, idx) => (
                      <div key={idx} className="flex gap-4 p-3 rounded-lg bg-muted/50">
                        <img
                          src={product.image}
                          alt={product.productName}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium">{product.productName}</h5>
                            {product.isReturnable && (
                              <Badge variant="secondary" className="text-xs">
                                Returnable
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Qty: {product.quantity} × ₹{product.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="font-medium">
                          ₹{(product.quantity * product.price).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Seller</p>
                    <p className="font-medium">{selectedOrder.sellerName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment Method</p>
                    <p className="font-medium capitalize">{selectedOrder.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Delivery Method</p>
                    <p className="font-medium">
                      {selectedOrder.deliveryMethod === "self_pickup"
                        ? "Self Pickup"
                        : "Seller Delivery"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Order Date</p>
                    <p className="font-medium">
                      {new Date(selectedOrder.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* Delivery Details for Seller Delivery */}
                {selectedOrder.deliveryMethod === "seller_delivery" && (
                  <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Delivery Details
                    </h4>
                    {selectedOrder.shippingAddress && (
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">{selectedOrder.shippingAddress}</p>
                      </div>
                    )}
                    {selectedOrder.customerPhone && (
                      <div>
                        <p className="text-sm text-muted-foreground">Phone Number</p>
                        <p className="font-medium">{selectedOrder.customerPhone}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Return Policy Info */}
                {selectedOrder.status === "delivered" && (
                  <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <RotateCcw className="h-4 w-4 text-accent" />
                      Return & Exchange Policy
                    </h4>
                    {hasReturnableProducts(selectedOrder) ? (
                      <div className="space-y-2 text-sm">
                        <p className="text-muted-foreground">
                          The following items are eligible for return/exchange:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground">
                          {getReturnableProductsList(selectedOrder).map((p, idx) => (
                            <li key={idx}>{p.productName}</li>
                          ))}
                        </ul>
                        {getNonReturnableProductsList(selectedOrder).length > 0 && (
                          <>
                            <p className="text-destructive/80 mt-2">
                              Non-returnable items:
                            </p>
                            <ul className="list-disc list-inside text-destructive/80">
                              {getNonReturnableProductsList(selectedOrder).map((p, idx) => (
                                <li key={idx}>{p.productName}</li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        This order contains no returnable items.
                      </p>
                    )}
                  </div>
                )}

                {/* Total */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-display">Total Amount</span>
                    <span className="text-2xl font-display font-bold text-primary">
                      ₹{selectedOrder.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons in Dialog */}
                {selectedOrder.status !== "cancelled" && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {canCancel(selectedOrder) && (
                      <Button
                        variant="outline"
                        className="gap-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => {
                          setSelectedOrder(null);
                          setActionDialog({ type: "cancel", order: selectedOrder });
                        }}
                      >
                        <Ban className="h-4 w-4" />
                        Cancel Order
                      </Button>
                    )}
                    {canExchangeBeforeDispatch(selectedOrder) && (
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => {
                          setSelectedOrder(null);
                          setActionDialog({ type: "exchange", order: selectedOrder });
                        }}
                      >
                        <RefreshCw className="h-4 w-4" />
                        Request Exchange
                      </Button>
                    )}
                    {canExchangeAfterDelivery(selectedOrder) && (
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => {
                          setSelectedOrder(null);
                          setActionDialog({ type: "return", order: selectedOrder });
                        }}
                      >
                        <RotateCcw className="h-4 w-4" />
                        Return/Exchange
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Cancel Order Alert Dialog */}
        <AlertDialog 
          open={actionDialog.type === "cancel"} 
          onOpenChange={(open) => !open && setActionDialog({ type: null, order: null })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Order #{actionDialog.order?.id}?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this order? This action cannot be undone.
                {actionDialog.order?.paymentStatus === "paid" && (
                  <span className="block mt-2 text-primary">
                    Your payment will be refunded within 5-7 business days.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Order</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={handleCancelOrder}
              >
                Yes, Cancel Order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Exchange Request Alert Dialog (Before Dispatch) */}
        <AlertDialog 
          open={actionDialog.type === "exchange"} 
          onOpenChange={(open) => !open && setActionDialog({ type: null, order: null })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Request Exchange for Order #{actionDialog.order?.id}?</AlertDialogTitle>
              <AlertDialogDescription>
                You can request an exchange before your order is dispatched. The seller will 
                contact you to discuss available alternatives.
                <span className="block mt-2 text-muted-foreground">
                  Note: Exchange is subject to product availability.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleExchangeRequest(false)}>
                Submit Exchange Request
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Return/Exchange Alert Dialog (After Delivery) */}
        <AlertDialog 
          open={actionDialog.type === "return"} 
          onOpenChange={(open) => !open && setActionDialog({ type: null, order: null })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Return/Exchange for Order #{actionDialog.order?.id}</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div>
                  <p>You can request a return or exchange for eligible items in this order.</p>
                  {actionDialog.order && (
                    <div className="mt-3 space-y-2">
                      <p className="font-medium text-foreground">Eligible for return/exchange:</p>
                      <ul className="list-disc list-inside text-sm">
                        {getReturnableProductsList(actionDialog.order).map((p, idx) => (
                          <li key={idx}>{p.productName}</li>
                        ))}
                      </ul>
                      {getNonReturnableProductsList(actionDialog.order).length > 0 && (
                        <>
                          <p className="font-medium text-destructive mt-2">Not eligible:</p>
                          <ul className="list-disc list-inside text-sm text-destructive/80">
                            {getNonReturnableProductsList(actionDialog.order).map((p, idx) => (
                              <li key={idx}>{p.productName}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}
                  <p className="mt-3 text-muted-foreground text-sm">
                    Return instructions will be sent to your email after confirmation.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleExchangeRequest(true)}>
                Submit Return Request
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>

      <Footer />
    </div>
  );
};

export default CustomerOrders;