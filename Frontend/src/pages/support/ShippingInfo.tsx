import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Truck, MapPin, Clock, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const ShippingInfo = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          
          <h1 className="font-heading text-3xl font-bold mb-8">Shipping Information</h1>
          
          <div className="space-y-8">
            <section className="bg-card p-6 rounded-xl border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Truck className="h-6 w-6 text-primary" />
                <h2 className="font-heading text-xl font-semibold">Delivery Options</h2>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-2">Self Pickup</h3>
                  <p className="text-muted-foreground text-sm">Pick up your order directly from the artisan or local collection point. No shipping charges apply.</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-2">Seller-Managed Delivery</h3>
                  <p className="text-muted-foreground text-sm">The seller will arrange delivery to your address. Delivery charges may vary based on location.</p>
                </div>
              </div>
            </section>

            <section className="bg-card p-6 rounded-xl border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-6 w-6 text-primary" />
                <h2 className="font-heading text-xl font-semibold">Delivery Timeline</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 font-semibold">Location</th>
                      <th className="text-left py-3 font-semibold">Estimated Time</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border">
                      <td className="py-3">Within City</td>
                      <td className="py-3">1-3 business days</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3">Within State</td>
                      <td className="py-3">3-5 business days</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3">Other States</td>
                      <td className="py-3">5-7 business days</td>
                    </tr>
                    <tr>
                      <td className="py-3">Remote Areas</td>
                      <td className="py-3">7-10 business days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-card p-6 rounded-xl border border-border">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-6 w-6 text-primary" />
                <h2 className="font-heading text-xl font-semibold">Shipping Charges</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Free shipping on orders above ₹2,000</li>
                  <li>Standard delivery: ₹50 - ₹150 based on weight and location</li>
                  <li>Express delivery available for select locations at additional cost</li>
                  <li>Self pickup is always free</li>
                </ul>
              </div>
            </section>

            <section className="bg-card p-6 rounded-xl border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Package className="h-6 w-6 text-primary" />
                <h2 className="font-heading text-xl font-semibold">Packaging</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>All our products are carefully packaged to ensure safe delivery:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Eco-friendly packaging materials</li>
                  <li>Extra protection for fragile items like brass and ceramic</li>
                  <li>Fabric items wrapped in breathable cloth bags</li>
                  <li>Gift wrapping available on request</li>
                </ul>
              </div>
            </section>

            <div className="bg-muted/50 p-6 rounded-xl text-center">
              <p className="text-muted-foreground mb-4">Have questions about your shipment?</p>
              <Link to="/support/track-order">
                <Button variant="heritage">Track Your Order</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShippingInfo;
