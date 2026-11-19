"use client";

import Link from "next/link";
import "./Delivery.css";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface DeliveryProps {
    pageTitle: string;
    deliveryIntro: string;
    homeDeliveryHeading: string;
    warehouseHeading: string;
    homeDeliveryContent: string[];
    warehousePickupContent: string[];
}

export default function Delivery({
    pageTitle,
    deliveryIntro,
    homeDeliveryHeading,
    warehouseHeading,
    homeDeliveryContent,
    warehousePickupContent,
}: DeliveryProps) {

    const deliveryRef = useRef<HTMLElement>(null);

    // GSAP animation
    useEffect(() => {
        if (!deliveryRef.current) return;

        const ctx = gsap.context(() => {
            const sections = gsap.utils.toArray<HTMLElement>(
                ".delivery-section"
            );

            sections.forEach((section) => {
                const elements = section.querySelectorAll(
                    ".delivery-breadcrumb, h1, p, .delivery-column"
                );

                gsap.from(elements, {
                    y: 60,
                    opacity: 0,
                    duration: 0.9,
                    stagger: 0.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: section,
                        start: "top 80%",
                        toggleActions: "play none none reverse",
                    },
                });
            });
        }, deliveryRef);

        return () => ctx.revert();
    }, []);

    return (
        <main className="delivery-page" ref={deliveryRef}>

            {/* Intro + Free Home Delivery */}
            <section className="delivery-section">
                <div className="container">

                    <nav className="delivery-breadcrumb" aria-label="Breadcrumb">
                        <Link href="/">Home</Link>
                        <span>/</span>
                        <span aria-current="page">
                            {pageTitle}
                        </span>
                    </nav>

                    {deliveryIntro && (
                        <div
                            className="delivery-intro"
                            dangerouslySetInnerHTML={{ __html: deliveryIntro }}
                        />
                    )}

                    <button className="delivery-btn">
                        {homeDeliveryHeading}
                    </button>

                    <div className="delivery-columns">
                        {homeDeliveryContent.map((content, index) => (
                            content && (
                                <article key={index} className="delivery-column">
                                    <div dangerouslySetInnerHTML={{ __html: content }} />
                                </article>
                            )
                        ))}
                    </div>

                </div>
            </section>

            {/* Free Warehouse Pick Up */}
            <section className="delivery-section delivery-section-alt">
                <div className="container">

                    <button className="delivery-btn">
                        {warehouseHeading}
                    </button>

                    <div className="delivery-columns">
                        {warehousePickupContent.map((content, index) => (
                            content && (
                                <article key={index} className="delivery-column">
                                    <div dangerouslySetInnerHTML={{ __html: content }} />
                                </article>
                            )
                        ))}
                    </div>

                </div>
            </section>

        </main>
    );
}