"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import "./PrivacyPolicy.css";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type PolicySection = {
    heading: string;
    paragraphs: ReactNode[];
};

const sections: PolicySection[] = [
    {
        heading: "[SHORT NAME] United States Privacy Policy",
        paragraphs: [
            "It is our aim through this [SHORT NAME] UNITED STATES PRIVACY POLICY (“Policy”) to explain what information we collect about you and why we collect that information. We also want to make sure you understand how we use and share your information and the choices available to you. Our goal is to earn and keep your trust as you visit websites and applications about our products and brands.",
            "This Policy describes how we treat personal information on websites (“sites”), mobile or social media applications (“apps”), and any other services where we include an authorized link or reference to this Policy (together, the “Services”). This Policy does not describe our practices on sites or apps where it is not referenced.",
            "Your use of our apps and sites indicates you agree to our collection, use, and sharing of your information as set forth in this Policy.",
        ],
    },
    {
        heading: "What information do we collect?",
        paragraphs: [
            <>
                <strong>
                    We collect identifiers and contact information. For example, we may
                    collect your
                </strong>{" "}
                name and street address if you register on our site or apps. We may
                also collect your phone number or email address. We also collect online
                identifiers. For example, if you engage with us through a social media
                site, we may collect your social media user identifier.
            </>,
            <>
                <strong>
                    We collect payment information. If you make purchases with us, we (or
                    our business
                </strong>{" "}
                partners who process credit cards for us) may collect your billing
                information. This includes your credit card number.
            </>,
            <>
                <strong>
                    We collect information you submit or otherwise provide or authorize us
                    to collect.
                </strong>{" "}
                We collect the information you post in a public space on our site. This
                includes comments and videos or photos. We also collect any other
                information you may provide to us or authorize us to collect. [REST OF
                THIS PARAGRAPH]
            </>,
        ],
    },
    {
        heading: "[Next section heading]",
        paragraphs: ["[POLICY SECTION TEXT]"],
    },
    {
        heading: "[Next section heading]",
        paragraphs: ["[POLICY SECTION TEXT]"],
    },
];

export default function PrivacyPolicy() {
    
    const privacyRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!privacyRef.current) return;

        // Tags to animate
        const TAGS = "h1, h2, h3, h4, h5, h6, p, li, img, a.btn, button, blockquote, table";

        // Find animatable elements in a block, skipping ones whose ancestor is already selected
        const getItems = (block: Element | null): HTMLElement[] => {
            if (!block) return [];
            const all = Array.from(block.querySelectorAll<HTMLElement>(TAGS));
            return all.filter((el) => !all.some((other) => other !== el && other.contains(el)));
        };

        const ctx = gsap.context(() => {
            const root = privacyRef.current!;

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

            // Breadcrumb + heading + intro: play on page load
            animate(
                [
                    ...root.querySelectorAll<HTMLElement>(".delivery-breadcrumb, .privacy-top h1, .privacy-intro"),
                ],
                50,
                true
            );

            // Each privacy section: h2 + paragraphs on scroll
            root.querySelectorAll<HTMLElement>(".privacy-section").forEach((section) => {
                animate(getItems(section), 40);
            });
        }, privacyRef);

        // Recalculate trigger positions once fonts/images finish loading
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
        <main className="privacy-page" ref={privacyRef}>
            <section className="privacy-top">
                <div className="container">

                    <nav className="delivery-breadcrumb " aria-label="Breadcrumb">
                        <Link href="/">Home</Link>
                        <span>/</span>
                        <Link href="/shop" className="current">Privacy</Link>


                    </nav>


                    <h1>
                        Privacy Policy
                        <span>Updated: [DATE]</span>
                    </h1>

                    <div className="privacy-body">
                        <p className="privacy-intro">
                            Welcome to the [YOUR COMPANY NAME] (“[SHORT NAME]”) web site.
                            Below you will find our Privacy Policy regarding any personal
                            information that you may supply to us through this web site.
                        </p>

                        {sections.map((section, index) => (
                            <article key={index} className="privacy-section">
                                <h2>{section.heading}</h2>
                                {section.paragraphs.map((text, i) => (
                                    <p key={i}>{text}</p>
                                ))}
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}