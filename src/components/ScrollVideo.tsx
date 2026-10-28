"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { BRAND } from "@/lib/brand";
import { FSSAI_NUMBER } from "@/lib/config";

export default function ScrollVideo() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [duration, setDuration] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);

  // Framer Motion useScroll over 350vh wrapper
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  // Scale and tilt effects for 3D feel
  const videoScale = useTransform(scrollYProgress, [0, 1], [1.0, 1.08]);
  const videoTiltX = useTransform(scrollYProgress, [0, 0.5, 1], [-2, 0, 2]);
  const videoTiltY = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0, -1]);
  const progressHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Video metadata and iOS Safari touch unlock
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.load();
    video.pause();

    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
        setIsLoaded(true);
      }
    };

    if (video.readyState >= 1 && video.duration && !isNaN(video.duration)) {
      setDuration(video.duration);
      setIsLoaded(true);
    }

    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    // iOS Safari unlock on first touch
    const handleFirstTouch = () => {
      if (video.paused) {
        video
          .play()
          .then(() => {
            video.pause();
          })
          .catch(() => {});
      }
      window.removeEventListener("touchstart", handleFirstTouch);
    };

    window.addEventListener("touchstart", handleFirstTouch, { passive: true });

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      window.removeEventListener("touchstart", handleFirstTouch);
    };
  }, []);

  // Smooth scrubbing with LERP in requestAnimationFrame
  useEffect(() => {
    if (prefersReducedMotion) return;

    let targetTime = 0;
    let currentTime = 0;
    let animationFrameId: number;

    const unsubscribe = scrollYProgress.on("change", (latest) => {
      setScrollPercent(latest);
      if (duration > 0) {
        targetTime = latest * duration;
      }
    });

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const renderLoop = () => {
      const video = videoRef.current;
      if (video && duration > 0) {
        // LERP factor 0.12 for buttery smooth scrubbing
        currentTime = lerp(currentTime, targetTime, 0.12);

        // Clamp inside [0, duration]
        const clamped = Math.max(0, Math.min(duration, currentTime));

        // Only update if difference is meaningful to prevent micro-stutter
        if (Math.abs(video.currentTime - clamped) > 0.015) {
          video.currentTime = clamped;
        }
      }
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      unsubscribe();
      cancelAnimationFrame(animationFrameId);
    };
  }, [scrollYProgress, duration, prefersReducedMotion]);

  // Smooth skip to hero section
  const handleSkipIntro = () => {
    const heroEl = document.getElementById("hero-section");
    if (heroEl) {
      heroEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  // If user prefers reduced motion, show only poster for a short intro, then hero follows
  if (prefersReducedMotion) {
    return (
      <section className="relative h-[65vh] flex items-center justify-center bg-[#2B1B17] text-[#FFF8E7] overflow-hidden px-4">
        <div className="absolute inset-0">
          <Image
            src="/images/products/mushroom-mela-front.jpg"
            alt="Akhil Foods Mushroom Mela Pickle"
            fill
            className="object-cover opacity-35"
            priority
          />
          <div className="absolute inset-0 bg-[#4A231B]/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2B1B17] via-transparent to-[#2B1B17]" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4 bg-[#2B1B17]/80 backdrop-blur-md p-6 sm:p-10 rounded-[32px] border border-[#FFF1A6]/20 shadow-2xl">
          <span className="text-xs uppercase tracking-widest font-bold text-[#FFF1A6] bg-[#6B352A] px-4 py-1.5 rounded-full border border-[#FFF1A6]/20 inline-block">
            Artisanal Heritage • Jhansi
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#FFF1A6]">
            Handcrafted in Jhansi
          </h2>
          <p className="text-sm text-[#FFF8E7]/90 max-w-lg mx-auto font-sans leading-relaxed">
            Fresh mushrooms, real spices. Handcrafted in Village Nandsiya, Moth, Jhansi, Uttar Pradesh under FSSAI Lic. #{FSSAI_NUMBER}.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSkipIntro}
              className="px-8 py-3 rounded-full bg-[#FFF1A6] hover:bg-[#FFF9D6] text-[#4A231B] font-bold text-sm shadow-xl transition-all"
            >
              Explore Akhil Foods ↓
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={wrapperRef} className="relative h-[350vh] bg-[#2B1B17]">
      {/* Sticky 100vh Viewport Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Scrubbing Video Element with 3D scale & parallax tilt */}
        <motion.div
          style={{
            scale: videoScale,
            rotateX: videoTiltX,
            rotateY: videoTiltY,
            transformPerspective: 2000,
          }}
          className="absolute inset-0 w-full h-full pointer-events-none select-none will-change-transform"
        >
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            poster="/images/products/mushroom-mela-front.jpg"
            className="w-full h-full object-cover object-center"
          >
            <source src="/pickle-scroll.mp4" type="video/mp4" />
            <source src="/pickle-video.mp4" type="video/mp4" />
          </video>
        </motion.div>

        {/* Loading poster while video initializes */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-[#2B1B17] z-10 flex items-center justify-center">
            <Image
              src="/images/products/mushroom-mela-front.jpg"
              alt="Loading Akhil Foods Artisanal Craft..."
              fill
              className="object-cover opacity-60"
              priority
            />
            <div className="relative z-20 text-center space-y-2 bg-[#2B1B17]/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-[#FFF1A6]/20">
              <span className="w-3 h-3 rounded-full bg-[#FFF1A6] animate-ping inline-block mb-1" />
              <p className="text-xs font-bold text-[#FFF1A6] uppercase tracking-wider">
                Loading Interactive Experience...
              </p>
            </div>
          </div>
        )}

        {/* Deep Clay Dark Overlay at about 35% for text readability */}
        <div className="absolute inset-0 bg-[#4A231B]/35 pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2B1B17]/80 via-transparent to-[#2B1B17]/50 pointer-events-none z-10" />

        {/* Top-Right "Skip intro" Button */}
        <div className="absolute top-20 sm:top-24 right-4 sm:right-8 z-30">
          <button
            type="button"
            onClick={handleSkipIntro}
            className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#2B1B17]/75 hover:bg-[#4A231B] text-[#FFF1A6] text-xs font-semibold backdrop-blur-md border border-[#FFF1A6]/30 shadow-xl transition-all hover:scale-105 active:scale-95"
            aria-label="Skip video intro and go to hero section"
          >
            <span>Skip intro</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#FFF1A6] group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Top-Left Floating Badge */}
        <div className="absolute top-20 sm:top-24 left-4 sm:left-8 z-30 pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#2B1B17]/75 backdrop-blur-md text-[#FFF1A6] border border-[#FFF1A6]/30 shadow-xl text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#FFF1A6]" />
            <span className="hidden xs:inline sm:inline">Crafted in Jhansi</span>
            <span className="xs:hidden sm:hidden">Jhansi, UP</span>
          </div>
        </div>

        {/* Thin Soft Butter Right Progress Bar Indicator */}
        <div className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 h-36 sm:h-44 w-[3px] bg-white/20 rounded-full overflow-hidden z-30 shadow-md">
          <motion.div
            style={{ height: progressHeight }}
            className="w-full bg-[#FFF1A6] rounded-full shadow-[0_0_8px_#FFF1A6]"
          />
        </div>

        {/* Bottom "Scroll to explore" Hint with animated mouse/arrow in Soft Butter */}
        {scrollPercent < 0.12 && (
          <div className="absolute bottom-6 sm:bottom-10 z-30 pointer-events-none flex flex-col items-center gap-2 animate-bounce">
            <div className="w-5 h-8 rounded-full border-2 border-[#FFF1A6] flex justify-center pt-1.5 shadow-[0_0_10px_rgba(255,241,166,0.35)]">
              <motion.div
                animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                className="w-1.5 h-2 bg-[#FFF1A6] rounded-full"
              />
            </div>
            <span className="text-[11px] sm:text-xs uppercase tracking-widest text-[#FFF1A6] font-bold drop-shadow flex items-center gap-1">
              <span>Scroll to explore</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </span>
          </div>
        )}

        {/* Story Text Overlay #1 (~20% Scroll: 0.14 - 0.36) */}
        <div
          className={`absolute inset-0 z-30 flex items-center justify-center p-4 sm:p-6 text-center transition-all duration-700 pointer-events-none ${
            scrollPercent >= 0.14 && scrollPercent <= 0.36
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-8 scale-95"
          }`}
        >
          <div className="max-w-2xl bg-[#2B1B17]/85 backdrop-blur-md p-6 sm:p-12 rounded-[28px] sm:rounded-[32px] border border-[#FFF1A6]/25 shadow-2xl space-y-3 sm:space-y-4">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#FFF1A6] bg-[#6B352A] px-3.5 sm:px-4 py-1.5 rounded-full border border-[#FFF1A6]/20 inline-block shadow-sm">
              Authentic Origin
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#FFF8E7] leading-tight">
              Handcrafted in Jhansi
            </h2>
            <p className="text-xs sm:text-base text-[#FFF8E7]/85 leading-relaxed font-sans max-w-lg mx-auto">
              Prepared in clean, hygienic micro-batches in Village Nandsiya, Moth, Jhansi, Uttar Pradesh with tender oyster mushrooms and maternal culinary care.
            </p>
          </div>
        </div>

        {/* Story Text Overlay #2 (~50% Scroll: 0.42 - 0.64) */}
        <div
          className={`absolute inset-0 z-30 flex items-center justify-center p-4 sm:p-6 text-center transition-all duration-700 pointer-events-none ${
            scrollPercent >= 0.42 && scrollPercent <= 0.64
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-8 scale-95"
          }`}
        >
          <div className="max-w-2xl bg-[#2B1B17]/85 backdrop-blur-md p-6 sm:p-12 rounded-[28px] sm:rounded-[32px] border border-[#FFF1A6]/25 shadow-2xl space-y-3 sm:space-y-4">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#FFF1A6] bg-[#6B352A] px-3.5 sm:px-4 py-1.5 rounded-full border border-[#FFF1A6]/20 inline-block shadow-sm">
              Pure Ingredients
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#FFF8E7] leading-tight">
              Fresh Mushrooms, Real Spices
            </h2>
            <p className="text-xs sm:text-base text-[#FFF8E7]/85 leading-relaxed font-sans max-w-lg mx-auto">
              Steeped in cold-pressed mustard oil, vinegar, red chilli, coriander, fennel, fenugreek, cumin, turmeric, ajwain, fresh ginger, and garlic. Zero synthetic shortcuts.
            </p>
          </div>
        </div>

        {/* Story Text Overlay #3 (~80% Scroll: 0.70 - 0.90) */}
        <div
          className={`absolute inset-0 z-30 flex items-center justify-center p-4 sm:p-6 text-center transition-all duration-700 pointer-events-none ${
            scrollPercent >= 0.70 && scrollPercent <= 0.90
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-8 scale-95"
          }`}
        >
          <div className="max-w-2xl bg-[#2B1B17]/85 backdrop-blur-md p-6 sm:p-12 rounded-[28px] sm:rounded-[32px] border border-[#FFF1A6]/25 shadow-2xl space-y-3 sm:space-y-4">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#FFF1A6] bg-[#6B352A] px-3.5 sm:px-4 py-1.5 rounded-full border border-[#FFF1A6]/20 inline-block shadow-sm">
              Culinary Heritage
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#FFF8E7] leading-tight">
              Taste the Tradition
            </h2>
            <p className="text-xs sm:text-base text-[#FFF8E7]/85 leading-relaxed font-sans max-w-lg mx-auto">
              Time-honoured recipes, premium quality ingredients, and authentic flavors sealed in every jar. Continue scrolling to discover Akhil Foods.
            </p>
          </div>
        </div>

        {/* Bottom completion indicator towards 100% */}
        {scrollPercent > 0.92 && (
          <div className="absolute bottom-6 sm:bottom-10 z-30 pointer-events-none text-center animate-pulse">
            <span className="text-xs uppercase tracking-widest text-[#FFF1A6] font-bold drop-shadow flex items-center justify-center gap-1.5">
              <span>Entering Akhil Foods</span>
              <ChevronDown className="w-4 h-4 text-[#FFF1A6]" />
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
