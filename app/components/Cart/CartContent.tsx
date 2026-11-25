"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cartRequest } from "@/app/lib/cart-api";

interface CartItem {
  key: string;
  id: number;
  name: string;
  quantity: number;
  quantity_limits: {
    minimum: number;
    maximum: number;
    editable: boolean;
  };
  images: {
    id: number;
    src: string;
    thumbnail: string;
    alt: string;
  }[];
  prices: {
    price: string;
    currency_code: string;
    currency_minor_unit: number;
    currency_prefix: string;
    currency_suffix: string;
  };
  totals: {
    line_total: string;
  };
}

interface CartData {
  items: CartItem[];
  items_count: number;
  totals: {
    total_items: string;
    total_items_tax: string;
    total_price: string;
    total_tax: string;
    currency_code: string;
    currency_minor_unit: number;
    currency_prefix: string;
    currency_suffix: string;
  };
}

export default function CartContent() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadCart = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await cartRequest("cart");
      setCart(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load cart."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const formatPrice = (value: string, minorUnit: number, prefix: string, suffix: string) => {
    const amount = Number(value) / Math.pow(10, minorUnit);

    return `${prefix}${amount.toFixed(minorUnit)}${suffix}`;
  };

  const updateQuantity = async (key: string, quantity: number) => {
    try {
      setUpdatingKey(key);
      setError("");

      const updatedCart = await cartRequest("cart/update-item", "POST", {
        key,
        quantity,
      });

      setCart(updatedCart);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update quantity."
      );
    } finally {
      setUpdatingKey(null);
    }
  };

  const removeItem = async (key: string) => {
    try {
      setUpdatingKey(key);
      setError("");

      const updatedCart = await cartRequest("cart/remove-item", "POST", {
        key,
      });

      setCart(updatedCart);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to remove product."
      );
    } finally {
      setUpdatingKey(null);
    }
  };

  if (loading) {
    return <div className="cart-status">Loading cart...</div>;
  }

  if (error && !cart) {
    return (
      <div className="cart-status">
        <p>{error}</p>
        <button onClick={loadCart}>Try Again</button>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your cart is empty</h2>
        <p>You haven't added any products to your cart yet.</p>
        <Link href="/shop">Continue Shopping</Link>
      </div>
    );
  }

  const currency = cart.totals;

  return (
    <div className="cart-content">
      <div className="cart-heading">
        <h1>Shopping Cart</h1>
        <p>{cart.items_count} item(s) in your cart</p>
      </div>

      {error && <p className="cart-error">{error}</p>}

      <div className="cart-layout">
        <div className="cart-products">
          {cart.items.map((item) => (
            <div className="cart-item" key={item.key}>
              <div className="cart-item-image">
                {item.images[0]?.src && (
                  <Image
                    src={item.images[0].src}
                    alt={item.images[0].alt || item.name}
                    width={110}
                    height={110}
                  />
                )}
              </div>

              <div className="cart-item-details">
                <h3>{item.name}</h3>

                <p className="cart-item-price">
                  {formatPrice(
                    item.prices.price,
                    currency.currency_minor_unit,
                    currency.currency_prefix,
                    currency.currency_suffix
                  )}
                </p>

                <div className="cart-item-actions">
                  <div className="cart-quantity">
                    <button
                      type="button"
                      disabled={
                        updatingKey === item.key ||
                        !item.quantity_limits.editable ||
                        item.quantity <= item.quantity_limits.minimum
                      }
                      onClick={() =>
                        updateQuantity(item.key, item.quantity - 1)
                      }
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      disabled={
                        updatingKey === item.key ||
                        !item.quantity_limits.editable ||
                        item.quantity >= item.quantity_limits.maximum
                      }
                      onClick={() =>
                        updateQuantity(item.key, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="cart-remove"
                    disabled={updatingKey === item.key}
                    onClick={() => removeItem(item.key)}
                  >
                    {updatingKey === item.key ? "Updating..." : "Remove"}
                  </button>
                </div>
              </div>

              <div className="cart-item-total">
                {formatPrice(
                  item.totals.line_total,
                  currency.currency_minor_unit,
                  currency.currency_prefix,
                  currency.currency_suffix
                )}
              </div>
            </div>
          ))}
        </div>

        <aside className="cart-summary">
          <h2>Cart Summary</h2>

          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>
              {formatPrice(
                currency.total_items,
                currency.currency_minor_unit,
                currency.currency_prefix,
                currency.currency_suffix
              )}
            </span>
          </div>

          <div className="cart-summary-row">
            <span>Tax</span>
            <span>
              {formatPrice(
                currency.total_tax,
                currency.currency_minor_unit,
                currency.currency_prefix,
                currency.currency_suffix
              )}
            </span>
          </div>

          <div className="cart-summary-row cart-grand-total">
            <strong>Total</strong>
            <strong>
              {formatPrice(
                currency.total_price,
                currency.currency_minor_unit,
                currency.currency_prefix,
                currency.currency_suffix
              )}
            </strong>
          </div>

          <p className="cart-shipping-note">
            Shipping charges are calculated during checkout.
          </p>

          <button
            type="button"
            className="cart-checkout-btn"
            onClick={() => {
              window.location.href = "/checkout";
            }}
          >
            Proceed to Checkout
          </button>

          <Link href="/shop" className="continue-shopping">
            Continue Shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
