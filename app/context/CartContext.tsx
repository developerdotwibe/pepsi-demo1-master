"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";

import { cartRequest } from "@/app/lib/cart-api";

interface CartContextType {
    cartCount: number;
    setCartCount: (count: number) => void;
    refreshCartCount: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartCount, setCartCount] = useState(0);

    const refreshCartCount = useCallback(async () => {
        try {
            const cart = await cartRequest("cart");
            setCartCount(cart?.items_count || 0);
        } catch (error) {
            console.error("Unable to fetch cart count:", error);
        }
    }, []);

    useEffect(() => {
        // Fetch cart count when the application loads
        refreshCartCount();

        // Fetch again when the user returns using browser Back/Forward
        const handlePageShow = () => {
            refreshCartCount();
        };

        // Fetch again when the tab becomes visible
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                refreshCartCount();
            }
        };

        window.addEventListener("pageshow", handlePageShow);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("pageshow", handlePageShow);
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [refreshCartCount]);

    return (
        <CartContext.Provider
            value={{ cartCount, setCartCount, refreshCartCount }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error("useCart must be used inside CartProvider");
    }

    return context;
}
