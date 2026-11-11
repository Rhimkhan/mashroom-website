"use client";

import { useEffect, useState, useCallback } from "react";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

/**
 * Registers the admin-only service worker scoped strictly to /admin
 * and captures the PWA install prompt event if available.
 */
export function useAdminPwa() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Ensure browser DOM <link rel="manifest"> on /admin always targets the admin-only manifest
    const manifestLinks = Array.from(document.querySelectorAll('link[rel="manifest"]'));
    if (manifestLinks.length > 0) {
      manifestLinks.forEach((link) => {
        link.setAttribute("href", "/admin-manifest.webmanifest");
      });
    } else {
      const link = document.createElement("link");
      link.rel = "manifest";
      link.href = "/admin-manifest.webmanifest";
      document.head.appendChild(link);
    }

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(standalone);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/admin/sw.js", { scope: "/admin" })
        .catch((err) => {
          console.warn("Admin SW registration failed:", err);
        });
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
      document.querySelectorAll('link[rel="manifest"]').forEach((link) => {
        link.setAttribute("href", "/manifest.webmanifest");
      });
    };
  }, []);

  const triggerInstall = useCallback(async (): Promise<boolean> => {
    if (!installPrompt) return false;
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setInstallPrompt(null);
      return choice.outcome === "accepted";
    } catch {
      return false;
    }
  }, [installPrompt]);

  return {
    canInstall: Boolean(installPrompt) && !isInstalled,
    isInstalled,
    triggerInstall,
  };
}

/**
 * Plays a soft notification beep using Web Audio API when permitted by browser autoplay policy.
 */
export function playSoftOrderBeep(): void {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(660, now);
    osc1.frequency.setValueAtTime(880, now + 0.09);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.06, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 400);
  } catch {
    // Browser autoplay blocked or audio unavailable; fail silently
  }
}
