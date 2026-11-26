
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cartRequest } from "@/app/lib/cart-api";

interface CartItem {
  key: string;
  id: number;
  name: string;
  quantity: number;
  images: {
    id: number;
    src: string;
    thumbnail: string;
    alt: string;
  }[];
  totals: {
    line_total: string;
  };
}

interface CartTotals {
  total_items: string;
  total_tax: string;
  total_price: string;
  currency_code: string;
  currency_minor_unit: number;
  currency_prefix: string;
  currency_suffix: string;
}

interface CartData {
  items: CartItem[];
  items_count: number;
  totals: CartTotals;
}

interface Address {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  phone: string;
}

interface CheckoutMeta {
  [key: string]: string[] | string | undefined;
}

interface GeneralSettings {
  "wck-meta"?: CheckoutMeta;
}

interface CheckoutPageData {
  "wck-meta"?: CheckoutMeta;
}

const WORDPRESS_API =
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
  "https://pepsihomedelivery.com/wp-json/custom/v1";

const emptyAddress: Address = {
  first_name: "",
  last_name: "",
  address_1: "",
  address_2: "",
  city: "",
  state: "Illinois",
  postcode: "",
  phone: "",
};

const getMetaValue = (
  meta: CheckoutMeta | undefined,
  key: string
): string => {
  const value = meta?.[key];

  if (Array.isArray(value)) {
    return String(value[0] || "");
  }

  return typeof value === "string" ? value : "";
};

const getHolidayDates = (meta?: CheckoutMeta): string[] => {
  if (!meta) return [];

  const dates = new Set<string>();

  // New repeater field. The API returns this as serialized PHP data.
  const serialized = getMetaValue(meta, "holydaydatenew");

  if (serialized) {
    const matches = serialized.match(/\d{4}-\d{2}-\d{2}/g) || [];
    matches.forEach((date) => dates.add(date));
  }

  // Older individual date fields.
  Object.entries(meta).forEach(([key, value]) => {
    if (key === "holydaydatenew" || key.startsWith("_")) return;

    if (
      key === "hdate" ||
      /^hdate_\d+$/.test(key)
    ) {
      const date = Array.isArray(value) ? value[0] : value;

      if (typeof date === "string") {
        const normalized = date.replace(
          /^(\d{4})(\d{2})(\d{2})$/,
          "$1-$2-$3"
        );

        if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
          dates.add(normalized);
        }
      }
    }
  });

  return [...dates];
};

const getToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function CheckoutContent() {
  const router = useRouter();

  const [cart, setCart] = useState<CartData | null>(null);
  const [deliveryOption, setDeliveryOption] = useState<
    "delivery" | "pickup"
  >("delivery");

  const [deliveryAddress, setDeliveryAddress] =
    useState<Address>(emptyAddress);

  const [billingAddress, setBillingAddress] =
    useState<Address>(emptyAddress);

  const [email, setEmail] = useState("");
  const [sameAsDelivery, setSameAsDelivery] = useState(false);

  const [deliveryDay, setDeliveryDay] = useState("");
  const [pickupDay, setPickupDay] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");

  const [holidays, setHolidays] = useState<string[]>([]);
  const [pickupMessage, setPickupMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [validated, setValidated] = useState(false);

  const today = useMemo(() => getToday(), []);

  useEffect(() => {
    const loadCheckout = async () => {
      try {
        setLoading(true);

        const savedOption = localStorage.getItem(
          "delivery_or_pickup"
        );

        if (savedOption === "delivery" || savedOption === "pickup") {
          setDeliveryOption(savedOption);
        }

        setDeliveryDay(
          localStorage.getItem("delivery_day") || ""
        );

        setPickupDay(
          localStorage.getItem("deliverypickup_day") || ""
        );

        setDeliveryNote(
          localStorage.getItem("delivery_note") || ""
        );

        const savedEmail = localStorage.getItem("checkout_email");
        if (savedEmail) setEmail(savedEmail);

        const savedDelivery = localStorage.getItem(
          "checkout_delivery_address"
        );

        const savedBilling = localStorage.getItem(
          "checkout_billing_address"
        );

        if (savedDelivery) {
          try {
            setDeliveryAddress({
              ...emptyAddress,
              ...JSON.parse(savedDelivery),
            });
          } catch {
            // Ignore invalid saved address data.
          }
        }

        if (savedBilling) {
          try {
            setBillingAddress({
              ...emptyAddress,
              ...JSON.parse(savedBilling),
            });
          } catch {
            // Ignore invalid saved address data.
          }
        }

        const data = await cartRequest("cart");

        if (!data.items || data.items.length === 0) {
          router.replace("/cart");
          return;
        }

        setCart(data);

        // Load checkout holiday dates.
        const checkoutResponse = await fetch(
          `${WORDPRESS_API}/page/checkout`,
          { cache: "no-store" }
        );

        if (checkoutResponse.ok) {
          const checkoutData: CheckoutPageData =
            await checkoutResponse.json();

          setHolidays(
            getHolidayDates(checkoutData["wck-meta"])
          );
        }

        // Load warehouse pickup message from General Settings.
        const settingsResponse = await fetch(
          `${WORDPRESS_API}/page/general-settings`,
          { cache: "no-store" }
        );

        if (settingsResponse.ok) {
          const settingsData: GeneralSettings =
            await settingsResponse.json();

          setPickupMessage(
            getMetaValue(
              settingsData["wck-meta"],
              "cart_pickup_red_banner_content_new"
            ) ||
              getMetaValue(
                settingsData["wck-meta"],
                "cart_pickup_red_banner_content"
              )
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load checkout."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCheckout();
  }, [router]);

  const formatPrice = (value: string) => {
    if (!cart) return "";

    const amount =
      Number(value) /
      Math.pow(10, cart.totals.currency_minor_unit);

    return `${cart.totals.currency_prefix}${amount.toFixed(
      cart.totals.currency_minor_unit
    )}${cart.totals.currency_suffix}`;
  };

  const updateDeliveryAddress = (
    field: keyof Address,
    value: string
  ) => {
    setDeliveryAddress((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateBillingAddress = (
    field: keyof Address,
    value: string
  ) => {
    setBillingAddress((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSameAsDelivery = (checked: boolean) => {
    setSameAsDelivery(checked);

    if (checked) {
      setBillingAddress({ ...deliveryAddress });
    }
  };

  const handleDeliveryAddressChange = (
    field: keyof Address,
    value: string
  ) => {
    updateDeliveryAddress(field, value);

    if (sameAsDelivery) {
      setBillingAddress((previous) => ({
        ...previous,
        [field]: value,
      }));
    }
  };

  const handleDeliveryOptionChange = (
    option: "delivery" | "pickup"
  ) => {
    setDeliveryOption(option);
    localStorage.setItem("delivery_or_pickup", option);
    setFormError("");
    setValidated(false);
  };

  const validateAddress = (address: Address) => {
    return (
      address.first_name.trim() &&
      address.last_name.trim() &&
      address.address_1.trim() &&
      address.city.trim() &&
      address.state.trim() &&
      address.postcode.trim() &&
      address.phone.trim()
    );
  };

  const handleContinue = () => {
    setFormError("");
    setValidated(false);

    if (deliveryOption === "delivery") {
      if (cart && cart.items_count < 3) {
        setFormError(
          "Free home delivery requires a minimum purchase of 3 items."
        );
        return;
      }

      if (!validateAddress(deliveryAddress)) {
        setFormError(
          "Please complete all required delivery address fields."
        );
        return;
      }

      if (!deliveryDay) {
        setFormError("Please select your delivery date.");
        return;
      }

      if (deliveryDay < today) {
        setFormError("Please select a future delivery date.");
        return;
      }

      if (holidays.includes(deliveryDay)) {
        setFormError(
          "The selected delivery date is a holiday. Please choose another date."
        );
        return;
      }

      localStorage.setItem("delivery_day", deliveryDay);
      localStorage.setItem("delivery_note", deliveryNote);
      localStorage.setItem(
        "checkout_delivery_address",
        JSON.stringify(deliveryAddress)
      );
    } else {
      if (!pickupDay) {
        setFormError("Please select your pickup date.");
        return;
      }

      if (pickupDay < today) {
        setFormError("Please select a future pickup date.");
        return;
      }

      if (holidays.includes(pickupDay)) {
        setFormError(
          "The selected pickup date is a holiday. Please choose another date."
        );
        return;
      }

      localStorage.setItem("deliverypickup_day", pickupDay);
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Please enter a valid billing email address.");
      return;
    }

    if (!validateAddress(billingAddress)) {
      setFormError(
        "Please complete all required billing address fields."
      );
      return;
    }

    localStorage.setItem("checkout_email", email);
    localStorage.setItem(
      "checkout_billing_address",
      JSON.stringify(billingAddress)
    );

    setValidated(true);
  };

  if (loading) {
    return (
      <div className="checkout-status">
        Loading checkout...
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-status checkout-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  if (!cart) return null;

  return (
    <div className="checkout-content">
      <div className="checkout-heading">
        <h1>Checkout</h1>
      </div>

      <div className="checkout-coupon">
        <span>Have a coupon?</span>{" "}
        <button
          type="button"
          onClick={() =>
            setFormError(
              "Coupon application will be connected to WooCommerce."
            )
          }
        >
          Click here to enter your code
        </button>
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          {/* Delivery / Pickup selection */}
          <section className="checkout-section checkout-fulfilment">
            <div className="checkout-section-heading">
              <h2>
                {deliveryOption === "delivery"
                  ? "You Chose Free Home Delivery"
                  : "You Chose Warehouse Pick Up"}
              </h2>

              <button
                type="button"
                className="checkout-change-btn"
                onClick={() => router.push("/cart")}
              >
                Change
              </button>
            </div>

            <div className="checkout-option-switch">
              <label>
                <input
                  type="radio"
                  name="deliveryOption"
                  checked={deliveryOption === "delivery"}
                  onChange={() =>
                    handleDeliveryOptionChange("delivery")
                  }
                />
                Free Home Delivery
              </label>

              <label>
                <input
                  type="radio"
                  name="deliveryOption"
                  checked={deliveryOption === "pickup"}
                  onChange={() =>
                    handleDeliveryOptionChange("pickup")
                  }
                />
                Warehouse Pick Up
              </label>
            </div>

            {deliveryOption === "delivery" ? (
              <>
                <p className="checkout-info-text">
                  All deliveries placed before 2:00 P.M. will be
                  delivered on the 2nd business day between 7:00 A.M.
                  and 4:00 P.M. Orders placed after 2:00 P.M. will be
                  delivered the 3rd business day between 7:00 A.M.
                  and 4:00 P.M.
                </p>

                {cart.items_count < 3 && (
                  <p className="checkout-warning">
                    Free home delivery requires a minimum purchase
                    of 3 items. Your cart currently has{" "}
                    {cart.items_count} items.
                  </p>
                )}

                <h3>Delivery Address</h3>

                <div className="checkout-form-grid">
                  <div className="checkout-field">
                    <label>First name *</label>
                    <input
                      value={deliveryAddress.first_name}
                      onChange={(e) =>
                        handleDeliveryAddressChange(
                          "first_name",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="checkout-field">
                    <label>Last name *</label>
                    <input
                      value={deliveryAddress.last_name}
                      onChange={(e) =>
                        handleDeliveryAddressChange(
                          "last_name",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="checkout-field checkout-full">
                    <label>Street address *</label>
                    <input
                      placeholder="House number and street name"
                      value={deliveryAddress.address_1}
                      onChange={(e) =>
                        handleDeliveryAddressChange(
                          "address_1",
                          e.target.value
                        )
                      }
                      required
                    />

                    <input
                      placeholder="Apartment, suite, unit, etc. (optional)"
                      value={deliveryAddress.address_2}
                      onChange={(e) =>
                        handleDeliveryAddressChange(
                          "address_2",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="checkout-field">
                    <label>Town / City *</label>
                    <input
                      value={deliveryAddress.city}
                      onChange={(e) =>
                        handleDeliveryAddressChange(
                          "city",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="checkout-field">
                    <label>State *</label>
                    <input
                      value={deliveryAddress.state}
                      onChange={(e) =>
                        handleDeliveryAddressChange(
                          "state",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="checkout-field">
                    <label>ZIP *</label>
                    <input
                      value={deliveryAddress.postcode}
                      onChange={(e) =>
                        handleDeliveryAddressChange(
                          "postcode",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="checkout-field">
                    <label>Phone *</label>
                    <input
                      type="tel"
                      placeholder="(XXX) XXX-XXXX"
                      value={deliveryAddress.phone}
                      onChange={(e) =>
                        handleDeliveryAddressChange(
                          "phone",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="checkout-field">
                    <label>Choose Your Delivery Day *</label>
                    <input
                      type="date"
                      min={today}
                      value={deliveryDay}
                      onChange={(e) => {
                        setDeliveryDay(e.target.value);
                        setFormError("");
                      }}
                      required
                    />

                    {deliveryDay && holidays.includes(deliveryDay) && (
                      <small className="checkout-field-error">
                        This date is a holiday. Please choose another date.
                      </small>
                    )}
                  </div>

                  <div className="checkout-field checkout-full">
                    <label>
                      Your delivery will be left at your doorstep.
                      If there is anything else we should know, like
                      beware of your dog, tell us here (optional)
                    </label>

                    <textarea
                      rows={5}
                      value={deliveryNote}
                      onChange={(e) =>
                        setDeliveryNote(e.target.value)
                      }
                    />

                    <small className="checkout-message">
                      We will text you when your delivery is complete
                    </small>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="checkout-field checkout-pickup-date">
                  <label>Choose Your Pick Up Day *</label>
                  <input
                    type="date"
                    min={today}
                    value={pickupDay}
                    onChange={(e) => {
                      setPickupDay(e.target.value);
                      setFormError("");
                    }}
                    required
                  />

                  {pickupDay && holidays.includes(pickupDay) && (
                    <small className="checkout-field-error">
                      This date is a holiday. Please choose another date.
                    </small>
                  )}
                </div>

                <p className="checkout-info-text">
                  Orders placed by 2:00 P.M. will be available for
                  pick up from 7:00 A.M. until 4:00 P.M. the 2nd
                  business day. If you placed your order after
                  2:00 P.M. your order will be ready for pickup
                  the 3rd business day.
                </p>

                <div className="checkout-warehouse">
                  <strong>Pepsi Cola C-U Bottling Co.</strong>
                  <p>
                    1306 W. Anthony Dr.
                    <br />
                    Champaign, IL 61821
                  </p>

                  <p>
                    We are located on Anthony Drive North of
                    Interstate 74 not far from Rural King &amp;
                    Sams Club. Pull through our main gate and park
                    in the first lot on the left. First go to the
                    office to sign for your order, and then you
                    will be directed where to pick up your order.
                  </p>

                  <a
                    href="https://maps.app.goo.gl/9tLZPRUDaicsup7S8"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View On Google Maps
                  </a>
                </div>

                {pickupMessage && (
                  <div className="checkout-pickup-notice">
                    {pickupMessage}
                  </div>
                )}
              </>
            )}
          </section>

          {/* Billing address */}
          <section className="checkout-section checkout-billing">
            <h2>Your Billing Address</h2>

            <label className="checkout-checkbox">
              <input
                type="checkbox"
                checked={sameAsDelivery}
                onChange={(e) =>
                  handleSameAsDelivery(e.target.checked)
                }
                disabled={deliveryOption !== "delivery"}
              />
              Same as Delivery
            </label>

            <div className="checkout-form-grid">
              <div className="checkout-field checkout-full">
                <label>Email address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="checkout-field">
                <label>First name *</label>
                <input
                  value={billingAddress.first_name}
                  onChange={(e) =>
                    updateBillingAddress("first_name", e.target.value)
                  }
                  required
                />
              </div>

              <div className="checkout-field">
                <label>Last name *</label>
                <input
                  value={billingAddress.last_name}
                  onChange={(e) =>
                    updateBillingAddress("last_name", e.target.value)
                  }
                  required
                />
              </div>

              <div className="checkout-field checkout-full">
                <label>Country / Region *</label>
                <input value="United States (US)" disabled />
              </div>

              <div className="checkout-field checkout-full">
                <label>Street address *</label>
                <input
                  placeholder="House number and street name"
                  value={billingAddress.address_1}
                  onChange={(e) =>
                    updateBillingAddress("address_1", e.target.value)
                  }
                  required
                />

                <input
                  placeholder="Apartment, suite, unit, etc. (optional)"
                  value={billingAddress.address_2}
                  onChange={(e) =>
                    updateBillingAddress("address_2", e.target.value)
                  }
                />
              </div>

              <div className="checkout-field checkout-full">
                <label>Town / City *</label>
                <input
                  value={billingAddress.city}
                  onChange={(e) =>
                    updateBillingAddress("city", e.target.value)
                  }
                  required
                />
              </div>

              <div className="checkout-field">
                <label>State *</label>
                <input
                  value={billingAddress.state}
                  onChange={(e) =>
                    updateBillingAddress("state", e.target.value)
                  }
                  required
                />
              </div>

              <div className="checkout-field">
                <label>ZIP Code *</label>
                <input
                  value={billingAddress.postcode}
                  onChange={(e) =>
                    updateBillingAddress("postcode", e.target.value)
                  }
                  required
                />
              </div>

              <div className="checkout-field checkout-full">
                <label>Phone *</label>
                <input
                  type="tel"
                  placeholder="(XXX) XXX-XXXX"
                  value={billingAddress.phone}
                  onChange={(e) =>
                    updateBillingAddress("phone", e.target.value)
                  }
                  required
                />
              </div>
            </div>
          </section>
        </div>

        {/* Order summary */}
        <aside className="checkout-order">
          <h2>Your Order</h2>

          <div className="checkout-order-table">
            <div className="checkout-table-heading">
              <span>Product</span>
              <span>Subtotal</span>
            </div>

            {cart.items.map((item) => (
              <div className="checkout-order-item" key={item.key}>
                <div className="checkout-product-image">
                  {item.images[0]?.src && (
                    <Image
                      src={item.images[0].src}
                      alt={item.images[0].alt || item.name}
                      width={65}
                      height={65}
                    />
                  )}
                </div>

                <div className="checkout-product-details">
                  <p>{item.name}</p>
                  <span>× {item.quantity}</span>
                </div>

                <strong>
                  {formatPrice(item.totals.line_total)}
                </strong>
              </div>
            ))}
          </div>

          <div className="checkout-total-row">
            <span>Subtotal</span>
            <span>{formatPrice(cart.totals.total_items)}</span>
          </div>

          <div className="checkout-total-row">
            <span>Tax</span>
            <span>{formatPrice(cart.totals.total_tax)}</span>
          </div>

          <div className="checkout-total-row checkout-grand-total">
            <strong>Total</strong>
            <strong>{formatPrice(cart.totals.total_price)}</strong>
          </div>

          <p className="checkout-selected-option">
            Delivery method:{" "}
            <strong>
              {deliveryOption === "delivery"
                ? "Free Home Delivery"
                : "Warehouse Pickup"}
            </strong>
          </p>

          <div className="checkout-payment">
            <h3>Payment options</h3>
            <p>
              Payment methods will be displayed here when the
              WooCommerce payment gateway is connected.
            </p>

            <p className="checkout-payment-security">
              Your personal data will be used to process your order,
              support your experience throughout this website, and
              for other purposes described in our privacy policy.
            </p>

            <label className="checkout-checkbox checkout-terms">
              <input type="checkbox" id="checkout-terms" />
              <span>
                I have read and agree to the website{" "}
                <Link href="/terms-and-conditions">
                  terms and conditions
                </Link>
                .
              </span>
            </label>

            <button
              type="button"
              className="checkout-place-order"
              onClick={handleContinue}
            >
              Validate Checkout Details
            </button>

            {validated && (
              <p className="checkout-success">
                Your checkout details have been validated and saved
                in this browser. Payment and order placement still
                need to be connected to WooCommerce.
              </p>
            )}
          </div>
        </aside>
      </div>

      {formError && (
        <div className="checkout-form-error" role="alert">
          {formError}
        </div>
      )}

      <Link href="/cart" className="checkout-back-link">
        Return to Cart
      </Link>
    </div>
  );
}
