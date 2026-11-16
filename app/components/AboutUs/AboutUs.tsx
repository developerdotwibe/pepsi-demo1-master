"use client";

import Link from "next/link";
import "./AboutUs.css";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);


const columns = [
  {
    title: "Our drinks",
    text: "You deserve to have easy access to delicious drinks like [BRAND 1], [BRAND 2], [BRAND 3] and our other brands. Through this site, we are now offering you delivery of our products right to your door in [CITY 1], [CITY 2] and [CITY 3], or warehouse pick up at our location in [CITY 1].",
  },
  {
    title: "Delivery",
    text: "Order now through this secure site and our delivery drivers will bring our products right to your home when it is convenient for you. Minimize shopping time and maximize your enjoyment of quality Bluefizz products.",
  },
  {
    title: "Pick up",
    text: "Alternatively you can select warehouse pick up, drop by our location on [YOUR STREET] and pick up your previously ordered items.",
  },
];

const holidays = [
  "New Year's Day",
  "Memorial Day",
  "July 4th",
  "Labor Day",
  "Thanksgiving Day",
  "Christmas Eve",
  "Christmas Day",
];

export default function AboutUs() {

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

          <h1>
            <span>Every day is a great day</span>
            For Bluefizz at your door
          </h1>

          <p>
            Every day is a great day to enjoy Bluefizz products delivered free
            to your <span>home by your local bottler, [YOUR COMPANY NAME]!</span>
          </p>

          <div className="about-columns">
            {columns.map((item) => (
              <article key={item.title} className="about-column">
                <h2>{item.title}</h2>
                <p>{item.text}</p>
              </article>
            ))}
          </div>

          <div className="about-note">
            <p>
              [YOURDOMAIN.COM] is owned and operated by [YOUR COMPANY NAME]. You
              can visit us online and learn more at [COMPANY WEBSITE].
            </p>
          </div>
        </div>
      </section>

      <section className="about-holidays">
        <div className="container">
          <h2>Holidays</h2>
          <p>
            Delivery and curbside pick up are not available on the following
            dates:
          </p>
          <ul>
            {holidays.map((day) => (
              <li key={day}>{day}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}