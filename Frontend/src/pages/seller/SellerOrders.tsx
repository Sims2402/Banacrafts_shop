import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OrderStatusBadge from "@/components/common/OrderStatusBadge";
import PaymentStatusBadge from "@/components/common/PaymentStatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Search, Eye, Truck, Package, CheckCircle, AlertTriangle, XCircle, Check, X } from "lucide-react";
import { mockOrders, Order, getOrdersBySeller, CustomerRequestStatus } from "@/data/orders";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const SellerOrders = () => {
  const [orders, setOrders] = useState<Order[]>(() =>
    getOrdersBySeller(mockOrders, "seller1")
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [requestAction, setRequestAction] = useState<{ order: Order; action: "approve" | "reject" } | null>(null);
  const { toast } = useToast();

  // Get orders with pending customer requests
  const ordersWithPendingRequests = orders.filter(
    (order) => order.customerRequest?.status === "pending"
  );

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      )
    );
    toast({
      title: "Order Updated",
      description: `Order ${orderId} status changed to ${newStatus}`,
    });
  };

  const handleRequestAction = (order: Order, action: "approve" | "reject") => {
    const requestType = order.customerRequest?.type;
    const newRequestStatus: CustomerRequestStatus = action === "approve" ? "approved" : "rejected";
    
    let newOrderStatus = order.status;
    let newPaymentStatus = order.paymentStatus;
    
    if (action === "approve") {
      if (requestType === "cancel") {
        newOrderStatus = "cancelled";
        if (order.paymentStatus === "paid") {
          newPaymentStatus = "refunded";
        }
      }
      // For exchange/return, status might change to a processing state
      // but for now we keep the order status and just mark request as approved
    }

    setOrders(
      orders.map((o) =>
        o.id === order.id
          ? {
              ...o,
              status: newOrderStatus,
              paymentStatus: newPaymentStatus,
              customerRequest: {
                ...o.customerRequest!,
                status: newRequestStatus,
                resolvedAt: new Date().toISOString(),
              },
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    );

    toast({
      title: action === "approve" ? "Request Approved" : "Request Rejected",
      description: `${requestType?.charAt(0).toUpperCase()}${requestType?.slice(1)} request for order ${order.id} has been ${action === "approve" ? "approved" : "rejected"}.`,
    });
    
    setRequestAction(null);
  };

  const getRequestBadgeVariant = (type: string) => {
    switch (type) {
      case "cancel":
        return "destructive";
      case "exchange":
        return "secondary";
      case "return":
        return "outline";
      default:
        return "default";
    }
  };

  const getStatusActions = (order: Order) => {
    // If there's a pending request, show approve/reject instead
    if (order.customerRequest?.status === "pending") {
      return (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={() => setRequestAction({ order, action: "approve" })}
          >
            <Check className="h-3 w-3" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => setRequestAction({ order, action: "reject" })}
          >
            <X className="h-3 w-3" />
            Reject
          </Button>
        </div>
      );
    }

    switch (order.status) {
      case "pending":
        return (
          <Button
            size="sm"
            onClick={() => updateOrderStatus(order.id, "confirmed")}
            className="gap-1"
          >
            <Package className="h-3 w-3" />
            Confirm
          </Button>
        );
      case "confirmed":
        return (
          <Button
            size="sm"
            onClick={() => updateOrderStatus(order.id, "dispatched")}
            className="gap-1"
          >
            <Truck className="h-3 w-3" />
            Dispatch
          </Button>
        );
      case "dispatched":
        return (
          <Button
            size="sm"
            onClick={() => updateOrderStatus(order.id, "delivered")}
            className="gap-1"
          >
            <CheckCircle className="h-3 w-3" />
            Mark Delivered
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Orders Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your customer orders
          </p>
        </div>

        {/* Pending Customer Requests Alert */}
        {ordersWithPendingRequests.length > 0 && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display flex items-center gap-2 text-amber-800">
                <AlertTriangle className="h-5 w-5" />
                Pending Customer Requests ({ordersWithPendingRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {ordersWithPendingRequests.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{order.id}</span>
                          <Badge variant={getRequestBadgeVariant(order.customerRequest!.type)}>
                            {order.customerRequest!.type.charAt(0).toUpperCase() + 
                              order.customerRequest!.type.slice(1)} Request
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.customerName} • {new Date(order.customerRequest!.requestedAt).toLocaleDateString()}
                        </p>
                        {order.customerRequest?.reason && (
                          <p className="text-sm text-muted-foreground mt-1 italic">
                            "{order.customerRequest.reason}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => setRequestAction({ order, action: "approve" })}
                      >
                        <Check className="h-3 w-3" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setRequestAction({ order, action: "reject" })}
                      >
                        <X className="h-3 w-3" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="heritage-card mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order ID or customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="dispatched">Dispatched</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card className="heritage-card">
          <CardHeader>
            <CardTitle className="text-lg font-display">
              All Orders ({filteredOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Request</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className={order.customerRequest?.status === "pending" ? "bg-amber-50/50" : ""}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.customerEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <img
                          src={order.products[0].image}
                          alt=""
                          className="w-10 h-10 rounded object-cover"
                        />
                        <span className="text-sm">
                          {order.products.length} item(s)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ₹{order.totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>
                      {order.customerRequest ? (
                        <div className="flex flex-col gap-1">
                          <Badge variant={getRequestBadgeVariant(order.customerRequest.type)}>
                            {order.customerRequest.type.charAt(0).toUpperCase() + 
                              order.customerRequest.type.slice(1)}
                          </Badge>
                          <span className={`text-xs ${
                            order.customerRequest.status === "pending" 
                              ? "text-amber-600" 
                              : order.customerRequest.status === "approved"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}>
                            {order.customerRequest.status.charAt(0).toUpperCase() + 
                              order.customerRequest.status.slice(1)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {getStatusActions(order)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Order Detail Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-display">
                Order Details - {selectedOrder?.id}
              </DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                {/* Customer Request Section */}
                {selectedOrder.customerRequest && (
                  <div className="p-4 rounded-lg border border-amber-200 bg-amber-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <span className="font-medium text-amber-800">
                            Customer {selectedOrder.customerRequest.type.charAt(0).toUpperCase() + 
                              selectedOrder.customerRequest.type.slice(1)} Request
                          </span>
                          <Badge 
                            variant={
                              selectedOrder.customerRequest.status === "pending" 
                                ? "secondary" 
                                : selectedOrder.customerRequest.status === "approved"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {selectedOrder.customerRequest.status.charAt(0).toUpperCase() + 
                              selectedOrder.customerRequest.status.slice(1)}
                          </Badge>
                        </div>
                        {selectedOrder.customerRequest.reason && (
                          <p className="text-sm text-muted-foreground italic">
                            "{selectedOrder.customerRequest.reason}"
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Requested on {new Date(selectedOrder.customerRequest.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {selectedOrder.customerRequest.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => {
                              setSelectedOrder(null);
                              setRequestAction({ order: selectedOrder, action: "approve" });
                            }}
                          >
                            <Check className="h-3 w-3" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setSelectedOrder(null);
                              setRequestAction({ order: selectedOrder, action: "reject" });
                            }}
                          >
                            <X className="h-3 w-3" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Customer Info</h4>
                    <p>{selectedOrder.customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.customerEmail}
                    </p>
                    {selectedOrder.customerPhone && (
                      <p className="text-sm text-muted-foreground">
                        {selectedOrder.customerPhone}
                      </p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Delivery Details</h4>
                    <Badge variant="outline" className="mb-2">
                      {selectedOrder.deliveryMethod === "self_pickup"
                        ? "Self Pickup"
                        : "Seller Delivery"}
                    </Badge>
                    {selectedOrder.openBoxDelivery && (
                      <Badge variant="outline" className="ml-2 bg-blue-50">
                        Open Box Delivery
                      </Badge>
                    )}
                    {selectedOrder.shippingAddress && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedOrder.shippingAddress}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Products</h4>
                  <div className="space-y-2">
                    {selectedOrder.products.map((product) => (
                      <div
                        key={product.productId}
                        className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
                      >
                        <img
                          src={product.image}
                          alt={product.productName}
                          className="w-16 h-16 rounded object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{product.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {product.quantity} × ₹{product.price}
                          </p>
                        </div>
                        <p className="font-medium">
                          ₹{(product.quantity * product.price).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex gap-4">
                    <OrderStatusBadge status={selectedOrder.status} />
                    <PaymentStatusBadge status={selectedOrder.paymentStatus} />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-2xl font-bold font-display">
                      ₹{selectedOrder.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Request Action Confirmation Dialog */}
        <AlertDialog open={!!requestAction} onOpenChange={() => setRequestAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {requestAction?.action === "approve" ? "Approve" : "Reject"} {requestAction?.order.customerRequest?.type} Request?
              </AlertDialogTitle>
              <AlertDialogDescription>
                {requestAction?.action === "approve" ? (
                  requestAction?.order.customerRequest?.type === "cancel" ? (
                    <>This will cancel order {requestAction?.order.id} and initiate a refund if payment was made.</>
                  ) : (
                    <>This will approve the {requestAction?.order.customerRequest?.type} request for order {requestAction?.order.id}. You'll need to coordinate with the customer for next steps.</>
                  )
                ) : (
                  <>This will reject the {requestAction?.order.customerRequest?.type} request for order {requestAction?.order.id}. The customer will be notified.</>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className={requestAction?.action === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                onClick={() => requestAction && handleRequestAction(requestAction.order, requestAction.action)}
              >
                {requestAction?.action === "approve" ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Approve Request
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-1" />
                    Reject Request
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>

      <Footer />
    </div>
  );
};

export default SellerOrders;
