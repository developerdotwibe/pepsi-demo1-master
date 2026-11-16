"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import "./Delivery.css";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type InfoItem = {
    title: string;
    body: ReactNode;
};

function InfoColumns({ items }: { items: InfoItem[] }) {
    return (
        <div className="delivery-columns">
            {items.map((item) => (
                <article key={item.title} className="delivery-column">
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                </article>
            ))}
        </div>
    );
}

export default function Delivery() {
    const [pageTitle, setPageTitle] = useState("Delivery or Warehouse Pick Up");
    const [homeDeliveryContent, setHomeDeliveryContent] = useState<string[]>([]);
    const [warehousePickupContent, setWarehousePickupContent] = useState<string[]>([]);

const deliveryRef = useRef<HTMLElement>(null);


    useEffect(() => {
        const fetchDeliveryPage = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/page/delivery`);
                if (!response.ok) {
                    throw new Error("Failed to fetch delivery page");
                }
                const data = await response.json();
                setPageTitle(data.title || "Delivery or Warehouse Pick Up");
                const meta = data["wck-meta"] || {};
                setHomeDeliveryContent([
                    meta.freehome_delivery_content?.[0] || "",
                    meta.freehome_delivery_content_1?.[0] || "",
                    meta.freehome_delivery_content_2?.[0] || "",
                ]);
                setWarehousePickupContent([
                    meta.freepickupcontent?.[0] || "",
                    meta.freepickupcontent_1?.[0] || "",
                    meta.freepickupcontent_2?.[0] || "",
                ]);
            }
            catch (error) {
                console.error("Error fetching delivery page:", error);
            }
        };
        fetchDeliveryPage();
    }, []);



// animation ...on scroll....

useEffect(() => {
    if (!deliveryRef.current) return;

    const ctx = gsap.context(() => {

        const sections = gsap.utils.toArray<HTMLElement>(
            ".delivery-section"
        );

        sections.forEach((section) => {

            const elements = section.querySelectorAll(
                ".delivery-breadcrumb, h1, p, .delivery-btn, .delivery-column"
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

}, [homeDeliveryContent, warehousePickupContent]);


    return (
        <main className="delivery-page" ref={deliveryRef}>
            {/* Intro + Free Home Delivery */}
            <section className="delivery-section">
                <div className="container">
                    <nav className="delivery-breadcrumb" aria-label="Breadcrumb">
                        <Link href="/">
                            Home
                        </Link>
                        <span>/</span>
                        <span aria-current="page">
                            {pageTitle}
                        </span>
                    </nav>

                    <h1>
                        <span>Delivery or</span>
                        Warehouse Pick Up
                    </h1>

                    <p>
                        We are offering home delivery as well as warehouse pick up in order
                        to provide you with the most convenient method of receiving your
                        favorite beverages.
                    </p>

                    <button className="delivery-btn">Free Home Delivery</button>
                    <div className="delivery-columns">
                        {homeDeliveryContent.map((content, index) => ( content && (
                        <article key={index} className="delivery-column">
                            <div dangerouslySetInnerHTML={{ __html: content }} />
                        </article>
                        ) ))}
                    </div>
                </div>
            </section>

            {/* Free Warehouse Pick Up */}
            <section className="delivery-section delivery-section-alt">
                <div className="container">
                    <button className="delivery-btn">Free Warehouse Pick Up</button>
                    <div className="delivery-columns">
                        {warehousePickupContent.map((content, index) => ( content && (
                        <article key={index} className="delivery-column">
                            <div dangerouslySetInnerHTML={{ __html: content }} />
                        </article>
                        ) ))}
                    </div>
                </div>
            </section>
        </main>
    );
}