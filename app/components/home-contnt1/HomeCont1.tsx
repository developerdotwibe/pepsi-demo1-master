
"use client";

import { useRef, useState, useEffect  } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import './homeCont1.css'

gsap.registerPlugin(ScrollTrigger, useGSAP);
interface HomeCont1Props {
    description: string;
    videoUrl: string;
}

export default function HomeCont1({description, videoUrl}: HomeCont1Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)?.[1] || "";

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const flow = section.querySelector(".home-cont1__flow");
      const paragraphs = gsap.utils.toArray<HTMLElement>(
        ".home-cont1 .container p"
      );

      // Reveal paragraphs and float the gradient as you scroll.

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 75%", // Animation starts earlier
          end: "bottom 40%",
          scrub: 0.8,
        },
      });

      timeline
        .fromTo(
          flow,
          {
            xPercent: -5,
            yPercent: 2,
            scale: 1,
          },
          {
            xPercent: 5,
            yPercent: -2,
            scale: 1.12,
            ease: "none",
          },
          0
        )
        .fromTo(
          paragraphs,
          {
            y: 28,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            stagger: 0.15,
            ease: "power2.out",
          },
          -0.3
        );

    },
    {
      scope: sectionRef,
      dependencies: [description],
      revertOnUpdate: true,
    }
  );

  return (
    <section className="home-cont1" ref={sectionRef}>
      <div
        className="home-cont1__flow"
        aria-hidden="true"
      />

      <div className="homecont-video">
        {videoId && (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1`}
            title="Background Video"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        )}
      </div>

      <div className="container">
        <div dangerouslySetInnerHTML={{ __html: description, }} />
      </div>
    </section>
  );
}
