
"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);
interface HomeCont2Props {
    aboutContent: string;
    backgroundImage: string;
}

export function HomeCont2({aboutContent, backgroundImage}: HomeCont2Props) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const heading = section.querySelector("h2");
      const paragraphs = section.querySelectorAll("p");
      const background = section.querySelector(
        ".home-cont-wrapp__bg"
      );

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          end: "bottom bottom",
          scrub: 0.8,
        },
      });

      tl.fromTo(
        heading,
        { y: 45, opacity: 0 },
        { y: 0, opacity: 1, ease: "none" },
        0
      )
        .fromTo(
          paragraphs,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.18,
            ease: "none",
          },
          0.15
        )
        .fromTo(
          background,
          { yPercent: -8, scale: 1.08 },
          { yPercent: 8, scale: 1.15, ease: "none" },
          0
        );
    },
    {
      scope: sectionRef,
      dependencies: [aboutContent],
      revertOnUpdate: true,
    }
  );

  return (
    <section className="home-cont-wrapp" ref={sectionRef} style={{ "--about-bg-image": backgroundImage ? `url( "${backgroundImage}")` : "none", } as React.CSSProperties}>
      <div
        className="home-cont-wrapp__bg"
        aria-hidden="true"
      />

      <div className="container">
        <h2>About</h2>
        <div dangerouslySetInnerHTML={{ __html: aboutContent }} />
      </div>
    </section>
  );
}
