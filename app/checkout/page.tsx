import Header from "@/app/components/header/Header";
import Footer from "@/app/components/footer/Footer";
import CheckoutContent from "@/app/components/Checkout/CheckoutContent";
import "./checkout.css";

export default function CheckoutPage() {
  return (
    <>
      <Header />

      <main className="checkout-page">
        <div className="container">
          <CheckoutContent />
        </div>
      </main>

      <Footer />
    </>
  );
}