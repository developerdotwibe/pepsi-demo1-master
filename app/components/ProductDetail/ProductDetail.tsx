"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
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
        options: {
            slug: string;
            label: string;
        }[];
    }[];
    variations: {
        variation_id: number;
        attributes: {
            attribute_packaging: string;
        };
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

export default function ProductDetail({ product }: ProductDetailProps) {
    const [quantity, setQuantity] = useState(MIN_QTY);
    const decrease = () => setQuantity((q) => Math.max(MIN_QTY, q - 1));
    const increase = () => setQuantity((q) => q + 1);
    const [selectedPackaging, setSelectedPackaging] = useState("");
    
    const selectedVariation = product.variations?.find(
        (variation) =>
            variation.attributes.attribute_packaging === selectedPackaging
    );

    // Dynamic product values
    const name = product.title;

    const variant =
        product.attributes.find((attribute) =>
            attribute.name.toLowerCase().includes("packaging")
        )?.options?.[0]?.label || "";

    const price = selectedVariation ? `$${Number(selectedVariation.display_price).toFixed(2)}` : product.type === "variable" && product.price_range ? `$${Number(product.price_range.min).toFixed(2)} - $${Number(product.price_range.max).toFixed(2)}` : product.price ? `$${Number(product.price).toFixed(2)}` : "";
    const image = selectedVariation?.image || product.featured_image || "/images/bottle.png";
    const description = product.short_description || "";

    const packagingOptions =
        product.attributes.find((attribute) =>
            attribute.name.toLowerCase().includes("packaging")
        )?.options || [];

    // Static values
    const category = "Carbonated Soft Drinks";
    const brand = "[BRAND NAME]";

    const productRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!productRef.current) return;

        const ctx = gsap.context(() => {
            // Breadcrumb animation
            gsap.from(".delivery-breadcrumb", {
                y: 20,
                opacity: 0,
                duration: 0.7,
                ease: "power2.out",
            });

            // Product image animation
            gsap.from(".product-image", {
                x: -70,
                opacity: 0,
                scale: 0.92,
                duration: 1.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: ".product-main",
                    start: "top 80%",
                    toggleActions: "play none none reverse",
                },
            });

            // Product information animation
            gsap.from(".product-info > *", {
                x: 60,
                opacity: 0,
                duration: 0.8,
                stagger: 0.12,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: ".product-info",
                    start: "top 80%",
                    toggleActions: "play none none reverse",
                },
            });

            // Product features animation
            gsap.from(".product-feature", {
                y: 60,
                opacity: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: ".product-features",
                    start: "top 80%",
                    toggleActions: "play none none reverse",
                },
            });
        }, productRef);

        return () => ctx.revert();
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
                                    <h4>{category}</h4>

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

                                    <Link href="#nutrition">
                                        Nutrition Information
                                    </Link>

                                    <form
                                        className="product-cart"
                                        onSubmit={(e) => e.preventDefault()}
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

                                        <button type="submit" className="product-add">
                                            Add to cart
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

                                    {packagingOptions.length > 0 && (
                                        <div className="product-variation">
                                            <label htmlFor="product-packaging">
                                                Packaging:
                                            </label>

                                            <select
                                                id="product-packaging"
                                                value={selectedPackaging}
                                                onChange={(e) => setSelectedPackaging(e.target.value)}
                                            >
                                                <option value="">Choose an option</option>

                                                {packagingOptions.map((option) => (
                                                    <option
                                                        key={option.slug}
                                                        value={option.label}
                                                    >
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="product-meta">
                                <p>
                                    Categories:{" "}
                                    <Link href="/shop">{category}</Link>,{" "}
                                    <Link href="/shop">{brand}</Link>
                                </p>
                            </div>
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
        </main>
    );
}