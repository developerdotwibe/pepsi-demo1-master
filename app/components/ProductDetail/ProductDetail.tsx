"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { cartRequest } from "@/app/lib/cart-api";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./ProductDetail.css";

gsap.registerPlugin(ScrollTrigger);

export interface ApiProductDetail {
    id: number;
    title: string;
    slug: string;
    type: "simple" | "variable";
    short_description: string;
    featured_image: string;
    nutritional_info?: string | null;
    price: string;
    price_range?: {
        min: string;
        max: string;
    };
    categories: {
        id: number;
        name: string;
        slug: string;
    }[];
    attributes: {
        name: string;
        slug: string;
        is_variation: boolean;
        is_taxonomy?: boolean;
        options: {
            slug: string;
            label: string;
        }[];
    }[];
    variations: {
        variation_id: number;
        attributes: Record<string, string>;
        regular_price: number;
        display_price: number;
        stock_status: string;
        is_purchasable: boolean;
        image: string;
    }[];
}

type ProductDetailProps = {
    product: ApiProductDetail;
};

const features = [
    {
        title: "Free delivery",
        text: "Free home delivery is available Tuesday – Friday between the hours of 7:00 A.M. and 4:00 P.M., with a minimum of 3 items.",
    },
    {
        title: "Free pick up",
        text: "Order pick up is available on Tuesday – Friday from 8:00 A.M. to 12 P.M. and 1 P.M. to 4 P.M. at our warehouse.",
    },
];

const MIN_QTY = 1;

const decodeHtmlEntities = (value: string) => {
    if (typeof window === "undefined") return value;

    const textarea = document.createElement("textarea");
    textarea.innerHTML = value;
    return textarea.value.trim();
};

export default function ProductDetail({ product }: ProductDetailProps) {
    const [quantity, setQuantity] = useState(MIN_QTY);
    const decrease = () => setQuantity((q) => Math.max(MIN_QTY, q - 1));
    const increase = () => setQuantity((q) => q + 1);
    const [showNutritionPopup, setShowNutritionPopup] = useState(false);
    const [selectedAttributes, setSelectedAttributes] = useState < Record < string, string > > ({});
    const variationAttributes = product.attributes.filter(
        (attribute) => attribute.is_variation);
    const getVariationAttributeKey = (attribute: ApiProductDetail["attributes"][number]) => {
        if (attribute.is_taxonomy) {
            return `attribute_${attribute.slug}`;
        }
        const normalizedName = attribute.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
        return `attribute_${normalizedName}`;
    };
    const matchableAttributes = variationAttributes.filter((attribute) => {
        const key = getVariationAttributeKey(attribute);
        return product.variations?.some(
            (variation) => variation.attributes[key]?.trim() !== "");
    });
    const selectedVariation = product.variations?.find((variation) => matchableAttributes.every((attribute) => {
        const selectedSlug = selectedAttributes[attribute.slug];
        if (!selectedSlug) return false;
        const selectedOption = attribute.options.find(
            (option) => option.slug === selectedSlug);
        if (!selectedOption) return false;
        const expectedValue = attribute.is_taxonomy ? selectedOption.slug : selectedOption.label;
        const variationValue = variation.attributes[getVariationAttributeKey(attribute)]?.trim();
        if (!variationValue) return true;
        return variationValue === expectedValue;
    }));
    const [addingToCart, setAddingToCart] = useState(false);
    const [cartMessage, setCartMessage] = useState("");
    const [cartError, setCartError] = useState(false);

    // Dynamic product values
    const name = product.title;
    const variant = "";
    const price = selectedVariation ? `$${Number(selectedVariation.display_price).toFixed(2)}` : product.type === "variable" && product.price_range ? `$${Number(product.price_range.min).toFixed(2)} - $${Number(product.price_range.max).toFixed(2)}` : product.price ? `$${Number(product.price).toFixed(2)}` : "";
    const image = selectedVariation?.image || product.featured_image || "/images/bottle.png";
    const description = product.short_description || "";
    const productRef = useRef<HTMLElement>(null);
    const categories = product.categories || [];
    const firstCategory = categories[0]?.name ? decodeHtmlEntities(categories[0].name) : "";

    const handleAddToCart = async () => {
        setCartMessage("");
        setCartError(false);
        if (product.type === "variable" && variationAttributes.some((attribute) => !selectedAttributes[attribute.slug])) {
            setCartError(true);
            setCartMessage("Please select all product options.");
            return;
        }
        setAddingToCart(true);
        try {
            const payload: Record < string, unknown > = {
                id: product.id,
                quantity,
            };
            if (product.type === "variable") {
                const variationPayload = variationAttributes.map((attribute) => {
                    const selectedOption = attribute.options.find(
                        (option) => option.slug === selectedAttributes[attribute.slug]);
                    if (!selectedOption) {
                        throw new Error(`Please select ${attribute.name}.`);
                    }
                    return {
                        attribute: attribute.is_taxonomy ? attribute.slug : attribute.name,
                        value: attribute.is_taxonomy ? selectedOption.slug : selectedOption.label,
                    };
                });
                if (!selectedVariation) {
                    throw new Error("Selected product variation is unavailable.");
                }
                if (!selectedVariation.is_purchasable) {
                    throw new Error("This product variation is currently unavailable.");
                }
                payload.variation = variationPayload;
            }
            console.log("Add to cart payload:", payload);
            await cartRequest("cart/add-item", "POST", payload);
            setCartMessage("Product added to cart successfully.");
        }
        catch (error) {
            setCartError(true);
            setCartMessage(error instanceof Error ? error.message : "Unable to add product to cart.");
        }
        finally {
            setAddingToCart(false);
        }
    };

    useEffect(() => {
        if (!productRef.current) return;

        const ctx = gsap.context(() => {
            const root = productRef.current!;

            // One shared reveal for every element
            const reveal = (
                els: HTMLElement[],
                from: gsap.TweenVars = { y: 50 },
                step = 0.1
            ) => {
                els.forEach((el, i) => {
                    // Inline tags (like <a>) ignore transforms, so make them inline-block
                    if (getComputedStyle(el).display === "inline") {
                        el.style.display = "inline-block";
                    }

                    const savedTransition = el.style.transition;
                    el.style.transition = "none"; // stop CSS transitions fighting GSAP

                    gsap.fromTo(
                        el,
                        { ...from, autoAlpha: 0 },
                        {
                            x: 0,
                            y: 0,
                            scale: 1,
                            autoAlpha: 1,
                            duration: 0.8,
                            ease: "power3.out",
                            delay: i * step,
                            overwrite: "auto",
                            immediateRender: false, // don't hide before the trigger is ready
                            onComplete: () => {
                                gsap.set(el, { clearProps: "transform,opacity,visibility" });
                                el.style.transition = savedTransition; // restore hover effects
                            },
                            scrollTrigger: {
                                trigger: el,
                                start: "top 92%",
                                once: true, // animate once, never hide again
                            },
                        }
                    );
                });
            };

            // Breadcrumb: plays on load
            gsap.fromTo(
                ".delivery-breadcrumb",
                { y: 20, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.7, ease: "power2.out" }
            );

            // Product image
            reveal(
                Array.from(root.querySelectorAll<HTMLElement>(".product-image")),
                { x: -70, scale: 0.92 }
            );

            // Product info: direct children + every link/button inside (includes the <a> above the cart form)
            const infoRoot = root.querySelector(".product-info");
            if (infoRoot) {
                const infoItems = new Set<HTMLElement>([
                    ...Array.from(infoRoot.children as HTMLCollectionOf<HTMLElement>),
                    ...Array.from(infoRoot.querySelectorAll<HTMLElement>("a, button")),
                ]);
                reveal(Array.from(infoItems), { x: 60 }, 0.08);
            }

            // Product features
            reveal(
                Array.from(root.querySelectorAll<HTMLElement>(".product-feature")),
                { y: 60 },
                0.15
            );
        }, productRef);

        // Recalculate trigger positions once images and fonts finish loading
        const refresh = () => ScrollTrigger.refresh();
        window.addEventListener("load", refresh);
        const t = setTimeout(refresh, 500);

        return () => {
            window.removeEventListener("load", refresh);
            clearTimeout(t);
            ctx.revert();
        };
    }, []);

    return (
        <main className="product-page" ref={productRef}>
            <section className="product-top">
                <div className="container">
                    <nav className="delivery-breadcrumb" aria-label="Breadcrumb">
                        <Link href="/">Home</Link>
                        <span>/</span>
                        <Link href="/shop">Products</Link>
                        <span>/</span>
                        <span className="current">{name}</span>
                    </nav>

                    <div className="product-main">
                        <div className="product-image">
                            <Image
                                src={image}
                                alt={name}
                                width={500}
                                height={500}
                                priority
                            />
                        </div>

                        <div className="product-info">
                            {product.type === "simple" ? (
                                <>
                                    <h4>{firstCategory}</h4>

                                    <h1>
                                        {name}
                                        <span> {variant}</span>
                                    </h1>

                                    <h2>{price}</h2>

                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: description,
                                        }}
                                    />

                                    {product.nutritional_info && (
                                        <button
                                            type="button"
                                            className="nutrition-link"
                                            onClick={() => setShowNutritionPopup(true)}
                                        >
                                            Nutrition Information
                                        </button>
                                    )}

                                    <form
                                        className="product-cart"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleAddToCart();
                                        }}
                                    >
                                        <div className="product-qty-wrap">
                                            <label htmlFor="product-qty-value">
                                                Quantity
                                            </label>

                                            <div className="product-qty">
                                                <button
                                                    type="button"
                                                    onClick={decrease}
                                                    disabled={quantity <= MIN_QTY}
                                                    aria-label="Decrease quantity"
                                                >
                                                    &minus;
                                                </button>

                                                <span
                                                    id="product-qty-value"
                                                    aria-live="polite"
                                                >
                                                    {quantity}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={increase}
                                                    aria-label="Increase quantity"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="product-add"
                                            disabled={addingToCart}
                                        >
                                            {addingToCart ? "Adding..." : "Add to cart"}
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <>
                                    <h1>{name}</h1>

                                    <h2>{price}</h2>

                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: description,
                                        }}
                                    />

                                    {variationAttributes.length > 0 && (
                                        <div className="product-variation">

                                            {variationAttributes.map((attribute) => (
                                                <div
                                                    className="product-variation-option"
                                                    key={attribute.slug}
                                                >
                                                    <label htmlFor={`product-attribute-${attribute.slug}`}>
                                                        {attribute.name}
                                                    </label>

                                                    <select
                                                        id={`product-attribute-${attribute.slug}`}
                                                        value={selectedAttributes[attribute.slug] || ""}
                                                        onChange={(e) =>
                                                            setSelectedAttributes((prev) => ({
                                                                ...prev,
                                                                [attribute.slug]: e.target.value,
                                                            }))
                                                        }
                                                    >
                                                        <option value="">Choose an option</option>

                                                        {attribute.options.map((option) => (
                                                            <option key={option.slug} value={option.slug}>
                                                                {option.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ))}

                                            <form
                                                className="product-cart"
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    handleAddToCart();
                                                }}
                                            >
                                                {/* Keep your existing quantity controls and Add to cart button here */}
                                                <div className="product-qty-wrap">
                                                    <label htmlFor="variable-product-qty">
                                                        Quantity
                                                    </label>

                                                    <div className="product-qty">
                                                        <button
                                                            type="button"
                                                            onClick={decrease}
                                                            disabled={quantity <= MIN_QTY}
                                                            aria-label="Decrease quantity"
                                                        >
                                                            &minus;
                                                        </button>

                                                        <span id="variable-product-qty" aria-live="polite">
                                                            {quantity}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={increase}
                                                            aria-label="Increase quantity"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>

                                                <button
                                                    type="submit"
                                                    className="product-add"
                                                    disabled={addingToCart}
                                                >
                                                    {addingToCart ? "Adding..." : "Add to cart"}
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="product-meta">
                                <p>
                                    Categories:{" "}
                                    {categories.map((category, index) => (
                                        <span key={category.id}>
                                            {decodeHtmlEntities(category.name)}
                                            {index < categories.length - 1 && ", "}
                                        </span>
                                    ))}
                                </p>
                            </div>

                            {cartMessage && (
                                <p
                                    className={cartError ? "cart-message error" : "cart-message success"}
                                    role="status"
                                >
                                    {cartMessage}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {product.type === "simple" && (
                <section className="product-features">
                    <div className="container">
                        <div className="product-features-list">
                            {features.map((item) => (
                                <article
                                    key={item.title}
                                    className="product-feature"
                                >
                                    <h3>{item.title}</h3>
                                    <p>{item.text}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {showNutritionPopup && product.nutritional_info && (
                <div
                    className="nutrition-popup-overlay"
                    onClick={() => setShowNutritionPopup(false)}
                >
                    <div
                        className="nutrition-popup"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="nutrition-popup-close"
                            onClick={() => setShowNutritionPopup(false)}
                            aria-label="Close nutrition information"
                        >
                            &times;
                        </button>

                        <Image
                            src={product.nutritional_info}
                            alt={`${name} nutritional information`}
                            width={500}
                            height={500}
                            className="nutrition-popup-image"
                        />
                    </div>
                </div>
            )}
        </main>
    );
}