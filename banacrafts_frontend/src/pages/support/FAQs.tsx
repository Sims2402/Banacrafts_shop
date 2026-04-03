import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const FAQs = () => {
  const faqs = [
    {
      category: "Orders & Payments",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept UPI payments and Cash on Delivery (COD). For UPI, you can use any UPI app like Google Pay, PhonePe, or Paytm."
        },
        {
          q: "How can I track my order?",
          a: "Once your order is dispatched, you'll receive tracking updates. You can also check your order status in 'My Orders' section of your account."
        },
        {
          q: "Can I cancel my order?",
          a: "You can cancel your order before it's dispatched. Once dispatched, you'll need to wait for delivery and then initiate a return if needed."
        },
        {
          q: "Is it safe to pay online?",
          a: "Yes, all UPI transactions are processed through secure payment gateways. We never store your payment details."
        }
      ]
    },
    {
      category: "Shipping & Delivery",
      questions: [
        {
          q: "How long does delivery take?",
          a: "Delivery times vary: 1-3 days within the city, 3-5 days within the state, and 5-7 days for other states. Remote areas may take up to 10 days."
        },
        {
          q: "Do you offer free shipping?",
          a: "Yes, we offer free shipping on orders above ₹2,000. Self-pickup is always free."
        },
        {
          q: "Can I choose a specific delivery date?",
          a: "We currently don't offer date-specific delivery, but you can choose self-pickup and collect at your convenience."
        },
        {
          q: "What if I'm not available during delivery?",
          a: "The delivery person will attempt to contact you. If unavailable, they may leave the package with a neighbor or reattempt the next day."
        }
      ]
    },
    {
      category: "Returns & Refunds",
      questions: [
        {
          q: "What is your return policy?",
          a: "You can return items within 7 days of delivery. Items must be unused, unworn, and in original packaging. Custom and sale items are non-returnable."
        },
        {
          q: "How long does it take to get a refund?",
          a: "Refunds are processed within 5-7 business days after we receive the returned item. UPI refunds go back to your original payment method."
        },
        {
          q: "What if I receive a damaged item?",
          a: "Report damaged items within 24 hours with photos. We'll arrange free pickup and provide a full refund or replacement."
        },
        {
          q: "Can I exchange an item instead of returning?",
          a: "Yes, exchanges are possible for different sizes or colors of the same product, subject to availability."
        }
      ]
    },
    {
      category: "Products & Artisans",
      questions: [
        {
          q: "Are the products handmade?",
          a: "Yes, all our products are handcrafted by skilled artisans using traditional techniques passed down through generations."
        },
        {
          q: "Why do handmade products have slight variations?",
          a: "Each piece is individually crafted by hand, making every item unique. Minor variations in color, size, or pattern are characteristics of authentic handmade products."
        },
        {
          q: "Can I request custom or personalized items?",
          a: "Yes, many of our artisans accept custom orders. Contact us with your requirements and we'll connect you with the right artisan."
        },
        {
          q: "How do I know my purchase helps artisans?",
          a: "We work directly with artisans and ensure fair prices. A significant portion of each sale goes directly to the craftsperson."
        }
      ]
    },
    {
      category: "Account & Support",
      questions: [
        {
          q: "How do I create an account?",
          a: "Click on 'Login' in the top menu and then select 'Register'. You can sign up as a customer or as a seller if you're an artisan."
        },
        {
          q: "I forgot my password. How can I reset it?",
          a: "Click on 'Forgot Password' on the login page. We'll send a password reset link to your registered email."
        },
        {
          q: "How can I contact customer support?",
          a: "You can reach us through email or phone. Visit our About page for contact details, or use the Track Order feature for order-related queries."
        },
        {
          q: "Can I become a seller on BanaCrafts?",
          a: "Yes! If you're an artisan or represent artisans, you can register as a seller. We'll review your application and help you set up your store."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          
          <h1 className="font-heading text-3xl font-bold mb-2">Frequently Asked Questions</h1>
          <p className="text-muted-foreground mb-8">Find answers to common questions about shopping on BanaCrafts</p>
          
          <div className="space-y-8">
            {faqs.map((section, idx) => (
              <section key={idx} className="bg-card p-6 rounded-xl border border-border">
                <h2 className="font-heading text-xl font-semibold mb-4">{section.category}</h2>
                <Accordion type="single" collapsible className="w-full">
                  {section.questions.map((faq, faqIdx) => (
                    <AccordionItem key={faqIdx} value={`item-${idx}-${faqIdx}`}>
                      <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQs;
