"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";

export default function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches && videoRef.current) {
        videoRef.current.pause();
      } else if (!e.matches && videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    };

    mediaQuery.addEventListener("change", handleMotionChange);
    return () => mediaQuery.removeEventListener("change", handleMotionChange);
  }, []);

  // Pause the video when it scrolls off screen to preserve CPU & battery
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!prefersReducedMotion && video.paused) {
              video.play().catch(() => {});
            }
          } else {
            if (!video.paused) {
              video.pause();
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none -z-10">
      {prefersReducedMotion ? (
        // High-definition poster fallback for users who prefer reduced motion
        <Image
          src="/images/hero-pickle.jpg"
          alt="Akhil Foods Artisanal Pickle Jar"
          fill
          priority
          className="object-cover object-center"
        />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/hero-pickle.jpg"
          className="w-full h-full object-cover object-center scale-105"
        >
          <source src="/pickle-video.mp4" type="video/mp4" />
        </video>
      )}

      {/* Dark Clay Overlay (Deep Clay #4A231B at ~55% opacity) for high contrast and readability */}
      <div className="absolute inset-0 bg-[#4A231B]/55 backdrop-brightness-95" />
      {/* Subtle vignette gradient from edges */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#2B1B17]/70 via-transparent to-[#4A231B]/40" />
    </div>
  );
}
