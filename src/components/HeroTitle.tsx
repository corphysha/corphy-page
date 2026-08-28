import { useEffect, useState } from "react";
import SplitText from "@/components/reactbits/SplitText";

interface HeroTitleProps {
  className?: string;
  text: string;
}

export default function HeroTitle({ className, text }: HeroTitleProps) {
  const [shouldEnhance, setShouldEnhance] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncPreference = () => setShouldEnhance(!mediaQuery.matches);
    syncPreference();

    mediaQuery.addEventListener("change", syncPreference);
    return () => mediaQuery.removeEventListener("change", syncPreference);
  }, []);

  if (!shouldEnhance) {
    return <h1 className={className}>{text}</h1>;
  }

  return (
    <SplitText
      className={className ?? ""}
      delay={80}
      duration={0.7}
      rootMargin="-80px"
      text={text}
      threshold={0.2}
    />
  );
}
