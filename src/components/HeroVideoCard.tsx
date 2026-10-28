"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Pause, Volume2, VolumeX, Sparkles, Maximize2, ShieldCheck } from "lucide-react";
import { FSSAI_NUMBER } from "@/lib/config";

export default function HeroVideoCard() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches && videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };

    mediaQuery.addEventListener("change", handleMotionChange);
    return () => mediaQuery.removeEventListener("change", handleMotionChange);
  }, []);

  // Pause when scrolled off screen
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!prefersReducedMotion && video.paused && !hasUserInteracted) {
              video.play().catch(() => {});
              setIsPlaying(true);
            }
          } else {
            if (!video.paused) {
              video.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [prefersReducedMotion, hasUserInteracted]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    setHasUserInteracted(true);
    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn("Video play error:", err);
      });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-lg aspect-[4/3] sm:aspect-square rounded-[36px] overflow-hidden shadow-2xl border-4 border-[#FFF1A6]/30 bg-[#2B1B17] group"
    >
      {prefersReducedMotion ? (
        <div className="relative w-full h-full">
          <Image
            src="/images/products/mushroom-mela-front.jpg"
            alt="Mushroom Mela Pickle Jar - Akhil Foods"
            fill
            className="object-contain p-6"
            priority
          />
        </div>
      ) : (
        <>
          {/* Main Video */}
          <video
            ref={videoRef}
            playsInline
            autoPlay
            loop
            muted={isMuted}
            preload="metadata"
            poster="/images/products/mushroom-mela-front.jpg"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="w-full h-full object-cover rounded-[32px] cursor-pointer"
            onClick={togglePlay}
          >
            <source src="/pickle-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Interactive Play/Pause Button Overlay (Centered when paused) */}
          {!isPlaying && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 bg-[#4A231B]/60 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer transition-all z-20 p-6 text-center"
            >
              <button
                type="button"
                aria-label="Play video"
                className="w-20 h-20 rounded-full bg-[#FFF1A6] text-[#4A231B] flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all ring-8 ring-[#FFF1A6]/30 mb-3"
              >
                <Play className="w-9 h-9 fill-[#4A231B] ml-1" />
              </button>
              <span className="font-serif text-xl font-bold text-[#FFF1A6] drop-shadow-md">
                Watch The Artisanal Craft
              </span>
              <p className="text-xs text-[#FFF8E7]/90 mt-1 max-w-xs font-light">
                From fresh oyster harvest to stone-ground spices infusion in Village Nandsiya, Moth, Jhansi
              </p>
            </div>
          )}

          {/* Top Left: Craft Documentary Pill */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2">
            <span className="bg-[#2B1B17]/90 backdrop-blur-md text-[#FFF1A6] text-[11px] font-bold px-3.5 py-1.5 rounded-full border border-[#FFF1A6]/30 shadow-lg inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FFF1A6]" />
              <span>Craft Documentary</span>
            </span>
          </div>

          {/* Top Right: Sound & Fullscreen Controls */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute audio" : "Mute audio"}
              className="w-9 h-9 rounded-full bg-[#2B1B17]/85 backdrop-blur-md text-[#FFF1A6] hover:bg-[#6B352A] flex items-center justify-center transition-all shadow-md border border-[#FFF1A6]/25"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              type="button"
              onClick={handleFullscreen}
              aria-label="Fullscreen video"
              className="w-9 h-9 rounded-full bg-[#2B1B17]/85 backdrop-blur-md text-[#FFF1A6] hover:bg-[#6B352A] flex items-center justify-center transition-all shadow-md border border-[#FFF1A6]/25"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Floating Card: Mini Product Badge & Play Status */}
          <div className="absolute bottom-4 left-4 right-4 z-20 bg-[#FFFBEF]/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#6B352A]/20 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-[#6B352A] text-[#FFF1A6] flex items-center justify-center shadow-md hover:bg-[#4A231B] transition-colors shrink-0"
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
              <div>
                <p className="font-serif text-xs sm:text-sm font-bold text-[#4A231B] line-clamp-1">
                  Mushroom Mela • 400g Jar
                </p>
                <p className="text-[10px] text-stone-600 font-medium">
                  AKHIL FOODS • Village Nandsiya, Moth, Jhansi
                </p>
              </div>
            </div>

            <Link
              href="/shop"
              className="text-[11px] font-bold text-[#4A231B] bg-[#FFF1A6] hover:bg-[#FFF9D6] px-3 py-1.5 rounded-xl border border-[#6B352A]/20 shadow-sm transition-all shrink-0"
            >
              Shop ₹399
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
