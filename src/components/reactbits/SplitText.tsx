/**
 * ReactBits SplitText TS/CSS adaptation.
 * Source: https://reactbits.dev/get-started/installation
 * This leaf component intentionally keeps GSAP isolated from the Astro document.
 */

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GsapSplitText } from "gsap/SplitText";
import { useEffect, useRef, useState } from "react";

interface SplitTextProps {
  className?: string;
  delay?: number;
  duration?: number;
  rootMargin?: string;
  text: string;
  threshold?: number;
}

function getScrollStart(threshold: number, rootMargin: string): string {
  const percentage = Math.round((1 - threshold) * 100);
  const match = /^(-?\d+)px$/u.exec(rootMargin);

  if (!match) return `top ${percentage}%`;

  const offset = Number(match[1]);
  if (offset === 0) return `top ${percentage}%`;

  return `top ${percentage}%${offset < 0 ? `-=${Math.abs(offset)}px` : `+=${offset}px`}`;
}

export default function SplitText({
  className,
  delay = 80,
  duration = 0.7,
  rootMargin = "-80px",
  text,
  threshold = 0.2,
}: SplitTextProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let active = true;

    if (document.fonts.status === "loaded") {
      setFontsReady(true);
    } else {
      document.fonts.ready.then(() => {
        if (active) setFontsReady(true);
      });
    }

    return () => {
      active = false;
    };
  }, []);

  useGSAP(
    () => {
      if (!headingRef.current || !fontsReady) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.registerPlugin(ScrollTrigger, GsapSplitText);

      const split = new GsapSplitText(headingRef.current, {
        reduceWhiteSpace: false,
        tag: "span",
        type: "words",
        wordsClass: "split-word",
      });

      const animation = gsap.fromTo(
        split.words,
        { yPercent: 16 },
        {
          duration,
          ease: "power3.out",
          stagger: delay / 1000,
          yPercent: 0,
          scrollTrigger: {
            anticipatePin: 0.4,
            fastScrollEnd: true,
            once: true,
            start: getScrollStart(threshold, rootMargin),
            trigger: headingRef.current,
          },
        },
      );

      return () => {
        animation.scrollTrigger?.kill();
        animation.kill();
        split.revert();
      };
    },
    {
      dependencies: [delay, duration, fontsReady, rootMargin, text, threshold],
      scope: headingRef,
    },
  );

  return (
    <h1 className={className} ref={headingRef}>
      {text}
    </h1>
  );
}
