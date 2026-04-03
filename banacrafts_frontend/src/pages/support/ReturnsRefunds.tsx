import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Package, RefreshCcw, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const ReturnsRefunds = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          
          <h1 className="font-heading text-3xl font-bold mb-8">Returns & Refunds Policy</h1>
          
          <div className="space-y-8">
            <section className="bg-card p-6 rounded-xl border border-border">
              <div className="flex items-center gap-3 mb-4">
                <RefreshCcw className="h-6 w-6 text-primary" />
                <h2 className="font-heading text-xl font-semibold">Return Policy</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>We want you to be completely satisfied with your purchase. If you're not happy with your order, you may return it within <strong className="text-foreground">7 days</strong> of delivery.</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Items must be unused, unworn, and in original packaging</li>
                  <li>Handcrafted items with minor variations are not eligible for return based on those variations</li>
                  <li>Custom or personalized items cannot be returned</li>
                  <li>Sale items are final sale and cannot be returned</li>
                </ul>
              </div>
            </section>

            <section className="bg-card p-6 rounded-xl border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Package className="h-6 w-6 text-primary" />
                <h2 className="font-heading text-xl font-semibold">How to Initiate a Return</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Contact our customer support within 7 days of delivery</li>
                  <li>Provide your order number and reason for return</li>
                  <li>Pack the item securely in its original packaging</li>
                  <li>Ship the item back to the seller or arrange for pickup</li>
                </ol>
              </div>
            </section>

            <section className="bg-card p-6 rounded-xl border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-6 w-6 text-primary" />
                <h2 className="font-heading text-xl font-semibold">Refund Timeline</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Refunds are processed within 5-7 business days after we receive the returned item</li>
                  <li>UPI payments: Refund credited to original payment method</li>
                  <li>Cash payments: Refund via bank transfer or store credit</li>
                  <li>Shipping charges are non-refundable unless the return is due to our error</li>
                </ul>
              </div>
            </section>

            <section className="bg-card p-6 rounded-xl border border-border">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-6 w-6 text-primary" />
                <h2 className="font-heading text-xl font-semibold">Damaged or Defective Items</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>If you receive a damaged or defective item:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Report within 24 hours of delivery with photos</li>
                  <li>We'll arrange free pickup and full refund or replacement</li>
                  <li>Open the package during delivery if possible to check contents</li>
                </ul>
              </div>
            </section>

            <div className="bg-muted/50 p-6 rounded-xl text-center">
              <p className="text-muted-foreground mb-4">Need help with a return?</p>
              <Link to="/support/faqs">
                <Button variant="heritage">View FAQs</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReturnsRefunds;
