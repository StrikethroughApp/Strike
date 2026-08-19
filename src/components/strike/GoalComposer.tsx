import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

const SUGGESTIONS = [
  "Clean this room",
  "Prepare this desk for studying",
  "Organize my closet",
  "Make this kitchen usable",
];

export function GoalComposer({
  goal,
  onGoalChange,
  onSubmit,
  disabled,
}: {
  goal: string;
  onGoalChange: (goal: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 210, damping: 26, delay: 0.05 }}
      className="mt-8"
    >
      <label htmlFor="goal" className="block text-[1.05rem] text-foreground">
        What do you want to get done?
      </label>

      <form
        className="mt-4 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (!disabled && goal.trim()) onSubmit();
        }}
      >
        <input
          id="goal"
          value={goal}
          onChange={(e) => onGoalChange(e.target.value)}
          placeholder="Clean this room"
          className="w-full rounded-full border border-border bg-paper px-6 py-4 text-[1rem] text-foreground shadow-[var(--shadow-tactile)] outline-none placeholder:text-muted-foreground focus:border-primary"
        />
        <button
          type="submit"
          disabled={disabled || !goal.trim()}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-[0.95rem] font-medium text-primary-foreground shadow-[var(--shadow-tactile)] transition-transform duration-200 active:scale-[0.98] disabled:opacity-40"
        >
          Break it down <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onGoalChange(s)}
            className="rounded-full border border-border bg-paper px-4 py-2 text-[0.82rem] text-muted-foreground transition-colors hover:border-primary hover:text-accent-foreground"
          >
            {s}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
