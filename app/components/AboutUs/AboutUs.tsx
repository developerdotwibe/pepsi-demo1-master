"use client";

import Link from "next/link";
import "./AboutUs.css";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);





const holidays = [
  "New Year's Day",
  "Memorial Day",
  "July 4th",
  "Labor Day",
  "Thanksgiving Day",
  "Christmas Eve",
  "Christmas Day",
];

interface AboutUsProps {
  aboutDescription: string;
  aboutFeatures: string[];
  featureBottomContent: string;
  holidaysContent: string;
}

export default function AboutUs({ aboutDescription, aboutFeatures, featureBottomContent, holidaysContent }: AboutUsProps) {


const aboutRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!aboutRef.current) return;

    // Tags to animate inside the backend HTML
    const TAGS = "h1, h2, h3, h4, h5, h6, p, li, img, a.btn, button, blockquote, table";

    // Find animatable elements in a block, skipping ones whose ancestor is already selected
    const getItems = (block: Element | null): HTMLElement[] => {
      if (!block) return [];
      const all = Array.from(block.querySelectorAll<HTMLElement>(TAGS));
      return all.filter((el) => !all.some((other) => other !== el && other.contains(el)));
    };

    const ctx = gsap.context(() => {
      const root = aboutRef.current!;

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
                el.style.transition = savedTransition; // restore hover effects
              },
              scrollTrigger: onLoad
                ? undefined
                : { trigger: el, start: "top 92%", once: true },
            }
          );
        });
      };

      // Hero: plays on page load
      animate(
        [
          ...root.querySelectorAll<HTMLElement>(".about-breadcrumb"),
          ...getItems(root.querySelector(".about-description")),
        ],
        50,
        true
      );

      // Feature columns: card, then its inner content
      root.querySelectorAll<HTMLElement>(".about-column").forEach((col) => {
        animate([col], 60);
        animate(getItems(col), 30);
      });

      // Bottom note
      animate(getItems(root.querySelector(".about-note")), 40);

      // Holidays (h2 + everything else)
      animate(getItems(root.querySelector(".about-holidays .container")), 50);
    }, aboutRef);

    // Recalculate trigger positions once images/fonts finish loading
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const t = setTimeout(refresh, 500);

    return () => {
      window.removeEventListener("load", refresh);
      clearTimeout(t);
      ctx.revert();
    };
  }, [aboutDescription, aboutFeatures, featureBottomContent, holidaysContent]);


  return (
    <main className="about-page111" ref={aboutRef}>
      <section className="about-hero">
        <div className="container">
          <nav className="delivery-breadcrumb about-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span aria-current="page">About us</span>
          </nav>

          {aboutDescription && (
              <div
                  className="about-description"
                  dangerouslySetInnerHTML={{
                      __html: aboutDescription,
                  }}
              />
          )}

          <div className="about-columns">
              {aboutFeatures.map((content, index) => (
                  content && (
                      <article key={index} className="about-column">
                          <div
                              dangerouslySetInnerHTML={{
                                  __html: content,
                              }}
                          />
                      </article>
                  )
              ))}
          </div>

          {featureBottomContent && (
            <div
              className="about-note"
              dangerouslySetInnerHTML={{
                __html: featureBottomContent,
              }}
            />
          )}
        </div>
      </section>

      <section className="about-holidays">
        <div
          className="container"
          dangerouslySetInnerHTML={{
            __html: holidaysContent,
          }}
        />
      </section>
    </main>
  );
}