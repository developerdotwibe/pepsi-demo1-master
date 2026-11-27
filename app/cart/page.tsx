import { Suspense } from "react";
import Header from "@/app/components/header/Header";
import Footer from "@/app/components/footer/Footer";
import CartContent from "@/app/components/Cart/CartContent";
import "./cart.css";

async function CartPageContent() {
    let pickupMessage = "";

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/page/general-settings`,
            { cache: "no-store" }
        );

        if (response.ok) {
            const data = await response.json();
            pickupMessage =
                data?.["wck-meta"]?.cart_pickup_red_banner_content_new?.[0] || "";
        }
    } catch (error) {
        console.error("Error fetching general settings:", error);
    }

    return (
        <>
            <Header />
            <main className="cart-page">
                <div className="container">
                    <CartContent pickupMessage={pickupMessage} />
                </div>
            </main>
            <Footer />
        </>
    );
}

export default function CartPage() {
    return (
        <Suspense fallback={<main className="cart-page" />}>
            <CartPageContent />
        </Suspense>
    );
}