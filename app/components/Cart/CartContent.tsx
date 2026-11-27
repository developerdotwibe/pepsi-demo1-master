"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cartRequest } from "@/app/lib/cart-api";

interface CartItem {
  key: string;
  id: number;
  name: string;
  permalink: string;
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

interface CartCoupon {
  code: string;
  discount_type: string;
  totals: {
    total_discount: string;
    total_discount_tax: string;
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
    currency_prefix: string;
    currency_suffix: string;
  };
}

interface CartData {
  items: CartItem[];
  items_count: number;
  coupons: CartCoupon[];
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
  const router = useRouter();
  const [cart, setCart] = useState<CartData | null>(null);
  const [deliveryOption, setDeliveryOption] = useState("delivery");
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponMessageType, setCouponMessageType] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [checkoutError, setCheckoutError] = useState("");

  const decodeHtmlEntities = (text: string) => {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  };

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

  useEffect(() => {
    const savedOption = localStorage.getItem("delivery_or_pickup");
    if (savedOption === "delivery" || savedOption === "pickup") {
      setDeliveryOption(savedOption);
    }
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

  const applyCoupon = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const code = couponCode.trim();

    if (!code) {
      setCouponMessage("Please enter a coupon code.");
      setCouponMessageType("error");
      return;
    }

    try {
      setCouponLoading(true);
      setCouponMessage("");
      setError("");

      const updatedCart = await cartRequest(
        "cart/apply-coupon",
        "POST",
        { code }
      );

      setCart(updatedCart);
      setCouponCode("");
      setCouponMessage("Coupon applied successfully!");
      setCouponMessageType("success");
    } catch (err) {
      setCouponMessage(
        err instanceof Error ? err.message : "Unable to apply coupon."
      );
      setCouponMessageType("error");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = async (code: string) => {
    try {
      setCouponLoading(true);
      setCouponMessage("");
      setError("");

      await cartRequest(
        `cart/coupons/${encodeURIComponent(code)}`,
        "DELETE"
      );

      const updatedCart = await cartRequest("cart");

      setCart(updatedCart);
      setCouponMessage(`Coupon "${code}" removed successfully.`);
      setCouponMessageType("success");
    } catch (err) {
      setCouponMessage(
        err instanceof Error ? err.message : "Unable to remove coupon."
      );
      setCouponMessageType("error");
    } finally {
      setCouponLoading(false);
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

  if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
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
                <h3>
                  <Link href={item.permalink}>
                    {decodeHtmlEntities(item.name)}
                  </Link>
                </h3>

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

          <form className="cart-coupon-form" onSubmit={applyCoupon}>
            <h3>Have a coupon?</h3>

            <div className="cart-coupon-input">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setCouponMessage("");
                }}
                disabled={couponLoading}
              />

              <button type="submit" disabled={couponLoading}>
                {couponLoading ? "Applying..." : "Apply Coupon"}
              </button>
            </div>

            {couponMessage && (
              <p className={`cart-coupon-message ${couponMessageType}`}>
                {decodeHtmlEntities(couponMessage)}
              </p>
            )}
          </form>

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

          {cart.coupons?.map((coupon) => (
            <div
              className="cart-summary-row cart-coupon-discount"
              key={coupon.code}
            >
              <div className="cart-applied-coupon">
                <span>Coupon ({coupon.code})</span>
                <span className="cart-coupon-applied-label">Applied</span>

                <button
                  type="button"
                  className="cart-remove-coupon"
                  onClick={() => removeCoupon(coupon.code)}
                  disabled={couponLoading}
                >
                  Remove
                </button>
              </div>

              <strong>
                -
                {formatPrice(
                  coupon.totals.total_discount,
                  coupon.totals.currency_minor_unit,
                  coupon.totals.currency_prefix,
                  coupon.totals.currency_suffix
                )}
              </strong>
            </div>
          ))}

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
              if (deliveryOption === "delivery" && cart.items_count < 3) {
                setCheckoutError(
                  "Free home delivery requires a minimum purchase of 3 items. Please add more items to your cart."
                );
                return;
              }

              setCheckoutError("");
              router.push("/checkout");
            }}
          >
            Proceed to Checkout
          </button>

          {checkoutError && (
            <p className="cart-checkout-error">
              {checkoutError}
            </p>
          )}

          <Link href="/shop" className="continue-shopping">
            Continue Shopping
          </Link>
        </aside>

        <div className="delivery-options">
          <h3>How would you like to get your order?</h3>

          <label>
            <input
              type="radio"
              name="delivery_or_pickup"
              value="delivery"
              checked={deliveryOption === "delivery"}
              onChange={() => {
                setDeliveryOption("delivery");
                localStorage.setItem("delivery_or_pickup", "delivery");
              }}
            />
            Free delivery to my door with a 3 item minimum purchase.
          </label>

          <label>
            <input
              type="radio"
              name="delivery_or_pickup"
              value="pickup"
              checked={deliveryOption === "pickup"}
              onChange={() => {
                setDeliveryOption("pickup");
                localStorage.setItem("delivery_or_pickup", "pickup");
              }}
            />
            Warehouse pick up at Pepsi Cola CU Bottling Co. in Champaign.
          </label>
        </div>
      </div>
    </div>
  );
}
