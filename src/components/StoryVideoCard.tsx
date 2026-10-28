"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Play, Pause, Volume2, VolumeX, Sparkles } from "lucide-react";

export default function StoryVideoCard() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // Check user preference for reduced motion
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

  // Pause video when off screen using IntersectionObserver
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
        setHasStarted(true);
      }).catch((err) => {
        console.warn("Video playback interrupted:", err);
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

  return (
    <div
      ref={containerRef}
      className="clay-card rounded-[24px] overflow-hidden bg-[#2B1B17] border-2 border-[#6B352A]/20 shadow-2xl relative group my-8"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-[#2B1B17] rounded-[24px]">
        {prefersReducedMotion ? (
          // Reduced motion fallback: High-res poster image only
          <div className="relative w-full h-full">
            <Image
              src="/images/clay-pot-aging.jpg"
              alt="Artisanal oyster mushroom pickle making process in Jhansi"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-[#4A231B]/40 flex items-center justify-center p-6 text-center">
              <div className="bg-[#2B1B17]/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-[#FFF1A6]/20 text-[#FFF8E7] text-xs max-w-md">
                <p className="font-semibold text-[#FFF1A6] mb-1">Traditional Preparation Process</p>
                <p className="text-[#FFF8E7]/80">Motion reduced per system settings. Fresh oyster mushrooms slow-steeped in pure mustard oil and authentic spices in Jhansi, Uttar Pradesh.</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              preload="metadata"
              poster="/images/clay-pot-aging.jpg"
              controls={hasStarted}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-cover rounded-[24px]"
            >
              <source src="/pickle-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Custom Interactive Play/Pause Button Overlay */}
            {!isPlaying && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 bg-[#4A231B]/45 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer transition-opacity group-hover:bg-[#4A231B]/35 z-10 rounded-[24px]"
              >
                <button
                  type="button"
                  aria-label="Play artisanal pickling video"
                  className="w-20 h-20 rounded-full bg-[#FFF1A6] text-[#4A231B] flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group-hover:ring-8 group-hover:ring-[#FFF1A6]/30 mb-3"
                >
                  <Play className="w-9 h-9 fill-[#4A231B] ml-1" />
                </button>
                <span className="font-serif text-lg font-bold text-[#FFF1A6] drop-shadow-md">
                  Watch The Artisanal Craft
                </span>
                <span className="text-xs text-[#FFF8E7]/90 mt-1 max-w-sm text-center px-4 font-light">
                  From tender oyster mushrooms to rich mustard oil infusion with authentic Indian spices
                </span>
              </div>
            )}

            {/* Top Badge Strip */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2">
              <span className="bg-[#4A231B]/90 backdrop-blur-md text-[#FFF1A6] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#FFF1A6]/20 shadow-md inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FFF1A6]" />
                <span>Craft Documentary</span>
              </span>
            </div>

            {/* Floating Mute Toggle */}
            {isPlaying && (
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute video" : "Mute video"}
                className="absolute bottom-4 right-4 z-20 w-10 h-10 rounded-full bg-[#2B1B17]/85 backdrop-blur-md text-[#FFF1A6] hover:bg-[#6B352A] flex items-center justify-center transition-all shadow-lg border border-[#FFF1A6]/20"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            )}
          </>
        )}
      </div>

      <div className="p-6 bg-white rounded-b-[24px] space-y-2 text-[#2B1B17]">
        <h3 className="font-serif text-xl font-bold text-[#6B352A]">
          Artisanal Kitchen Craft in Motion
        </h3>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          See how our small-batch kitchen prepares tender oyster mushrooms, mixes aromatic whole spices in pure mustard oil, and bottles each jar with care in Village Nandsiya, Moth, Jhansi, Uttar Pradesh.
        </p>
      </div>
    </div>
  );
}
