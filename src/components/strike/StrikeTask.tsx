import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "motion/react";
import { Check, ChevronRight } from "lucide-react";
import { haptic } from "@/lib/image";

type Props = {
  index: number;
  text: string;
  onComplete: () => void;
};

/**
 * The signature Strikethrough interaction: drag the chevron across the task.
 * Letters strike as it passes, the chevron flies off the edge, the numbered
 * circle flips into a check.
 */
export function StrikeTask({ index, text, onComplete }: Props) {
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useMotionValue(0);

  const [width, setWidth] = useState(0);
  const [struck, setStruck] = useState(0);
  const [done, setDone] = useState(false);
  const lastHaptic = useRef(0);

  const chars = useMemo(() => Array.from(text), [text]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const travel = Math.max(width - 56, 1);

  useMotionValueEvent(x, "change", (value) => {
    if (done) return;
    const start = 56;
    const progress = Math.max(0, Math.min(1.08, (value - start) / Math.max(travel - start, 1)));
    const next = Math.min(chars.length, Math.round(progress * chars.length * 1.06));
    setStruck((prev) => {
      if (next !== prev && next > lastHaptic.current && next % 4 === 0) {
        lastHaptic.current = next;
        haptic(3);
      }
      return next;
    });
  });

  const finish = useCallback(() => {
    if (done) return;
    setDone(true);
    setStruck(chars.length);
    haptic([12, 30, 18]);
    if (reduced) {
      onComplete();
      return;
    }
    animate(x, travel + 120, { type: "spring", stiffness: 210, damping: 16, velocity: 900 });
    animate(rotate, 78, { duration: 0.5, ease: [0.3, 0, 0.7, 1] });
    animate(y, 260, { duration: 0.52, ease: [0.35, 0, 1, 1] });
    window.setTimeout(onComplete, 420);
  }, [chars.length, done, onComplete, reduced, rotate, travel, x, y]);

  const release = useCallback(() => {
    if (done) return;
    if (x.get() > travel * 0.68) {
      finish();
      return;
    }
    setStruck(0);
    lastHaptic.current = 0;
    animate(x, 0, { type: "spring", stiffness: 320, damping: 30 });
  }, [done, finish, travel, x]);

  return (
    <div className="select-none">
      <div className="flex items-start gap-4">
        <NumberBadge index={index} done={done} />

        <div ref={trackRef} className="relative min-h-14 min-w-0 flex-1 py-1">
          <p className="pl-16 pr-2 whitespace-pre-wrap break-words text-[1.35rem] leading-[1.55] tracking-[-0.012em] text-foreground sm:text-2xl">
            {chars.map((ch, i) => (
              <span
                key={`${ch}-${i}`}
                className={
                  i < struck
                    ? "text-muted-foreground line-through decoration-primary decoration-[2.5px]"
                    : undefined
                }
                style={{ transition: "color 220ms ease" }}
              >
                {ch}
              </span>
            ))}
          </p>

          <motion.button
            type="button"
            aria-label="Drag across the task to complete it"
            drag="x"
            dragConstraints={{ left: 0, right: travel }}
            dragElastic={{ left: 0, right: 0.16 }}
            dragMomentum={false}
            onDragEnd={release}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setStruck(chars.length);
                finish();
              }
            }}
            whileTap={{ scale: 1.06 }}
            style={{ x, y, rotate }}
            className="absolute top-1/2 left-0 -mt-6 flex h-12 w-12 cursor-grab touch-none items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-lift)] transition-shadow active:cursor-grabbing"
          >
            <ChevronRight className="h-6 w-6" strokeWidth={2.6} />
          </motion.button>
        </div>
      </div>

      <p className="mt-5 pl-16 text-[0.8rem] text-muted-foreground">
        Drag the arrow across to strike it through
      </p>
    </div>
  );
}

function NumberBadge({ index, done }: { index: number; done: boolean }) {
  return (
    <div className="relative mt-1 h-10 w-10 shrink-0" style={{ perspective: 600 }}>
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ rotateY: done ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center rounded-full border border-border bg-paper text-sm font-medium text-muted-foreground"
          style={{ backfaceVisibility: "hidden" }}
        >
          {index + 1}
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center rounded-full bg-success text-success-foreground"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <Check className="h-5 w-5" strokeWidth={3} />
        </div>
      </motion.div>
    </div>
  );
}
