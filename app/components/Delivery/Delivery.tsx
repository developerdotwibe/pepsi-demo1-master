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
// GSAP animation
useEffect(() => {
    if (!deliveryRef.current) return;

    // Tags to animate inside the backend HTML
    const TAGS = "h1, h2, h3, h4, h5, h6, p, li, img, a.btn, button, blockquote, table";

    // Find animatable elements in a block, skipping ones whose ancestor is already selected
    const getItems = (block: Element | null): HTMLElement[] => {
        if (!block) return [];
        const all = Array.from(block.querySelectorAll<HTMLElement>(TAGS));
        return all.filter((el) => !all.some((other) => other !== el && other.contains(el)));
    };

    const ctx = gsap.context(() => {
        const root = deliveryRef.current!;

        // One shared animation for every element
        const animate = (els: HTMLElement[], y = 50, onLoad = false) => {
            els.forEach((el, i) => {
                const savedTransition = el.style.transition;
                el.style.transition = "none"; // stop CSS transitions fighting GSAP

                gsap.fromTo(
                    el,
                    { y, autoAlpha: 0 },
                    {
                        y: 0,
                        autoAlpha: 1,
                        duration: 0.8,
                        ease: "power3.out",
                        delay: onLoad ? i * 0.15 : 0,
                        overwrite: "auto",
                        immediateRender: onLoad,
                        onComplete: () => {
                            gsap.set(el, { clearProps: "transform,opacity,visibility" });
                            el.style.transition = savedTransition;
                        },
                        scrollTrigger: onLoad
                            ? undefined
                            : { trigger: el, start: "top 92%", once: true },
                    }
                );
            });
        };

        // Breadcrumb + intro: play on page load
        animate(
            [
                ...root.querySelectorAll<HTMLElement>(".delivery-breadcrumb"),
                ...getItems(root.querySelector(".delivery-intro")),
            ],
            50,
            true
        );

        // Each section: button, columns, column content
        root.querySelectorAll<HTMLElement>(".delivery-section").forEach((section) => {
            animate(Array.from(section.querySelectorAll<HTMLElement>(".delivery-btn")), 50);

            section.querySelectorAll<HTMLElement>(".delivery-column").forEach((col) => {
                animate([col], 60);
                animate(getItems(col), 30);
            });
        });
    }, deliveryRef);

    // Recalculate trigger positions once images/fonts finish loading
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const t = setTimeout(refresh, 500);

    return () => {
        window.removeEventListener("load", refresh);
        clearTimeout(t);
        ctx.revert();
    };
}, [deliveryIntro, homeDeliveryContent, warehousePickupContent, homeDeliveryHeading, warehouseHeading]);
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