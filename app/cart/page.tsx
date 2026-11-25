import Header from "@/app/components/header/Header";
import Footer from "@/app/components/footer/Footer";
import CartContent from "@/app/components/Cart/CartContent";
import "./cart.css";

export default function CartPage() {
  return (
    <>
      <Header />

      <main className="cart-page">
        <div className="container">
          <CartContent />
        </div>
      </main>

      <Footer />
    </>
  );
}