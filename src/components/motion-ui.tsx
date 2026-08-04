import { useEffect, useRef, useState, type ReactNode } from"react";
import { motion, useInView } from"motion/react";

/** Apparition discrète (fade + slide-up) quand la section entre dans le viewport. */
export function Reveal({
 children,
 delay = 0,
 className,
 as ="div"}: {
 children: ReactNode;
 delay?: number;
 className?: string;
 as?:"div" |"section" |"article" |"li";
}) {
 const Cmp = motion[as];
 return (
 <Cmp
 className={className}
 initial={{ opacity: 0, y: 18 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, amount: 0.2 }}
 transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
 >
 {children}
 </Cmp>
 );
}

/** Compteur animé de 0 à `value` quand l'élément devient visible. */
export function Counter({
 value,
 suffix =""decimals = 0,
 duration = 1200,
}: {
 value: number;
 suffix?: string;
 decimals?: number;
 duration?: number;
}) {
 const ref = useRef<HTMLSpanElement>(null);
 const inView = useInView(ref, { once: true, amount: 0.4 });
 const [n, setN] = useState(0);

 useEffect(() => {
 if (!inView) return;
 let raf = 0;
 const start = performance.now();
 const tick = (now: number) => {
 const p = Math.min(1, (now - start) / duration);
 setN(value * (1 - Math.pow(1 - p, 3)));
 if (p < 1) raf = requestAnimationFrame(tick);
 };
 raf = requestAnimationFrame(tick);
 return () => cancelAnimationFrame(raf);
 }, [inView, value, duration]);

 return (
 <span ref={ref} className="tabular-nums">
 {n.toFixed(decimals)}
 {suffix}
 </span>
 );
}
