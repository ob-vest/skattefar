import { useEffect, useMemo, useRef, useState } from "react";

export function AnimatedNumber({
  value,
  format = (n: number) => String(Math.round(n)),
  duration = 450,
  className,
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const [displayed, setDisplayed] = useState<number>(value);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const fromValueRef = useRef<number>(value);

  useEffect(() => {
    fromValueRef.current = displayed;
    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);
    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next =
        fromValueRef.current + (value - fromValueRef.current) * eased;
      setDisplayed(next);
      if (t < 1) {
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animationFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  const formatted = useMemo(() => format(displayed), [displayed, format]);
  return <span className={className}>{formatted}</span>;
}

export default AnimatedNumber;
