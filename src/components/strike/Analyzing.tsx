import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const BEATS = [
  "Looking at your photo",
  "Finding what's actually there",
  "Thinking about the order",
  "Writing your steps",
];

export function Analyzing({ image, goal }: { image: string; goal: string }) {
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setBeat((b) => Math.min(b + 1, BEATS.length - 1)), 2600);
    return () => window.clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 26 }}
      className="mx-auto max-w-xl text-center"
    >
      <div className="surface relative mx-auto overflow-hidden rounded-3xl p-2">
        <img src={image} alt="" className="max-h-[38vh] w-full rounded-[1.25rem] object-cover" />
        <div className="pointer-events-none absolute inset-2 overflow-hidden rounded-[1.25rem]">
          <div
            className="animate-sweep h-full w-1/3"
            style={{
              background:
                "linear-gradient(100deg, transparent, oklch(1 0.02 84 / 0.55), transparent)",
            }}
          />
        </div>
      </div>

      <div className="mt-10 flex items-center justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="animate-breathe h-2 w-2 rounded-full bg-primary"
            style={{ animationDelay: `${i * 0.28}s` }}
          />
        ))}
      </div>

      <div className="mt-6 h-7">
        <AnimatePresence mode="wait">
          <motion.p
            key={beat}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32 }}
            className="text-lg text-foreground"
          >
            {BEATS[beat]}
          </motion.p>
        </AnimatePresence>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">“{goal}”</p>
    </motion.div>
  );
}
