import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

export function Clarify({
  question,
  options,
  onAnswer,
}: {
  question: string;
  options: string[];
  onAnswer: (answer: string) => void;
}) {
  const [custom, setCustom] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 24 }}
      className="mx-auto max-w-xl"
    >
      <p className="text-sm tracking-wide text-muted-foreground uppercase">One quick thing</p>
      <h2 className="mt-3 text-[1.75rem] leading-[1.25] font-semibold text-foreground sm:text-4xl">
        {question}
      </h2>

      <div className="mt-8 space-y-3">
        {options.map((option, i) => (
          <motion.button
            key={option}
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 * i, type: "spring", stiffness: 240, damping: 24 }}
            onClick={() => onAnswer(option)}
            className="surface flex w-full items-center justify-between gap-4 rounded-2xl px-6 py-5 text-left text-[1.05rem] text-foreground transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.99]"
          >
            <span>{option}</span>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </motion.button>
        ))}
      </div>

      <form
        className="mt-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (custom.trim()) onAnswer(custom.trim());
        }}
      >
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Or say it in your own words"
          className="w-full rounded-full border border-border bg-paper px-6 py-3.5 text-[0.95rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
        />
        <button
          type="submit"
          disabled={!custom.trim()}
          className="shrink-0 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-transform duration-200 active:scale-[0.98] disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </motion.div>
  );
}
