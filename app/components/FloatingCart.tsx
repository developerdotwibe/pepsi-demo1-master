"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import "./floating-cart.css";

export default function FloatingCart() {
    const { cartCount } = useCart();

    return (
        <aside aria-label="Shopping Cart">
            <Link
                href="/cart"
                className="pepsi-floating-cart"
                aria-label={`View cart with ${cartCount} items`}
            >
                <div className="cart-icon-wrapper">
                    <Image
                        src="/images/icons/cart-icon.svg"
                        alt="Shopping Cart"
                        width={24}
                        height={24}
                        style={{ objectFit: "contain" }}
                    />
                </div>

                <span className="cart-badge-count">{cartCount}</span>
            </Link>
        </aside>
    );
}