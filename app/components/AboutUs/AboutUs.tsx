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

    const ctx = gsap.context(() => {

      // Hero section animation
      gsap.from(".about-breadcrumb, .about-hero h1, .about-hero > .container > p", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".about-hero",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      // About columns animation
      gsap.from(".about-column", {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".about-columns",
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });

      // About note animation
      gsap.from(".about-note", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".about-note",
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      });

      // Holidays section animation
      gsap.from(".about-holidays .container > *", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".about-holidays",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

    }, aboutRef);

    return () => ctx.revert();

  }, []);



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