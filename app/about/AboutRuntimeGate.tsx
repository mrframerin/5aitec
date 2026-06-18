"use client";

import { useEffect } from "react";

export function AboutRuntimeGate() {
  useEffect(() => {
    const root = document.documentElement;
    const topbar = document.querySelector<HTMLElement>("[data-about-topbar]");
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const filmStrip = document.querySelector<HTMLElement>("[data-film-strip]");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let dragging = false;
    let startX = 0;
    let startScroll = 0;

    const sync = () => {
      const scrollY = window.scrollY;
      const maxScroll = Math.max(1, root.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, scrollY / maxScroll));

      root.style.setProperty("--about-scroll", progress.toFixed(4));
      root.style.setProperty("--about-scroll-y", scrollY.toFixed(1));
      topbar?.classList.toggle("is-scrolled", scrollY > 24);

      raf = window.requestAnimationFrame(sync);
    };

    if (!reduceMotion) {
      raf = window.requestAnimationFrame(sync);
    } else {
      topbar?.classList.add("is-scrolled");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );

    revealItems.forEach((item) => observer.observe(item));

    const onPointerDown = (event: PointerEvent) => {
      if (!filmStrip) return;
      dragging = true;
      startX = event.clientX;
      startScroll = filmStrip.scrollLeft;
      filmStrip.classList.add("is-dragging");
      filmStrip.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!filmStrip || !dragging) return;
      filmStrip.scrollLeft = startScroll - (event.clientX - startX);
    };

    const stopDragging = (event: PointerEvent) => {
      if (!filmStrip || !dragging) return;
      dragging = false;
      filmStrip.classList.remove("is-dragging");
      if (filmStrip.hasPointerCapture(event.pointerId)) {
        filmStrip.releasePointerCapture(event.pointerId);
      }
    };

    filmStrip?.addEventListener("pointerdown", onPointerDown);
    filmStrip?.addEventListener("pointermove", onPointerMove);
    filmStrip?.addEventListener("pointerup", stopDragging);
    filmStrip?.addEventListener("pointercancel", stopDragging);

    // Subtle cursor parallax for the hero image collage.
    const onMouseMove = (event: PointerEvent) => {
      const mx = (event.clientX / window.innerWidth - 0.5) * 2;
      const my = (event.clientY / window.innerHeight - 0.5) * 2;
      root.style.setProperty("--about-mx", mx.toFixed(3));
      root.style.setProperty("--about-my", my.toFixed(3));
    };

    if (!reduceMotion) {
      window.addEventListener("pointermove", onMouseMove, { passive: true });
    }

    return () => {
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      filmStrip?.removeEventListener("pointerdown", onPointerDown);
      filmStrip?.removeEventListener("pointermove", onPointerMove);
      filmStrip?.removeEventListener("pointerup", stopDragging);
      filmStrip?.removeEventListener("pointercancel", stopDragging);
      window.removeEventListener("pointermove", onMouseMove);
      root.style.removeProperty("--about-scroll");
      root.style.removeProperty("--about-scroll-y");
      root.style.removeProperty("--about-mx");
      root.style.removeProperty("--about-my");
    };
  }, []);

  return null;
}
