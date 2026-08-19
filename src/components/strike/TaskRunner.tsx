import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronLeft, RotateCcw, SkipForward } from "lucide-react";
import { StrikeTask } from "./StrikeTask";

export type TaskStatus = "pending" | "done" | "skipped";

export function TaskRunner({
  title,
  tasks,
  image,
  onRestart,
}: {
  title: string;
  tasks: string[];
  image: string;
  onRestart: () => void;
}) {
  const [statuses, setStatuses] = useState<TaskStatus[]>(() => tasks.map(() => "pending"));
  const [history, setHistory] = useState<number[]>([]);

  const currentIndex = useMemo(() => statuses.findIndex((s) => s === "pending"), [statuses]);
  const doneCount = statuses.filter((s) => s === "done").length;
  const resolved = statuses.filter((s) => s !== "pending").length;
  const progress = Math.round((resolved / tasks.length) * 100);
  const finished = currentIndex === -1;

  function resolve(index: number, status: TaskStatus) {
    setStatuses((prev) => prev.map((s, i) => (i === index ? status : s)));
    setHistory((prev) => [...prev, index]);
  }

  function goBack() {
    const last = history[history.length - 1];
    if (last === undefined) return;
    setHistory((prev) => prev.slice(0, -1));
    setStatuses((prev) => prev.map((s, i) => (i === last ? "pending" : s)));
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {doneCount} of {tasks.length} struck through
          </p>
        </div>
        <img
          src={image}
          alt=""
          className="h-14 w-14 rotate-[2deg] rounded-2xl border border-border object-cover shadow-[var(--shadow-tactile)]"
        />
      </header>

      <div className="mt-6 h-[3px] w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="h-full rounded-full bg-primary"
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 160, damping: 24 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {finished ? (
          <motion.section
            key="finished"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            className="mt-14 text-center"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success text-success-foreground">
              <Check className="h-7 w-7" strokeWidth={3} />
            </div>
            <h2 className="mt-7 text-3xl font-semibold text-foreground sm:text-4xl">
              That's the whole thing.
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
              {doneCount === tasks.length
                ? "Every step done. Take a look around."
                : `${doneCount} done, ${tasks.length - doneCount} skipped. Still progress.`}
            </p>
            <button
              type="button"
              onClick={onRestart}
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-[0.95rem] font-medium text-primary-foreground transition-transform duration-200 active:scale-[0.98]"
            >
              <RotateCcw className="h-4 w-4" /> Start something new
            </button>
          </motion.section>
        ) : (
          <motion.section
            key={currentIndex}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ type: "spring", stiffness: 230, damping: 26 }}
            className="surface mt-10 rounded-[1.75rem] px-6 py-8 sm:px-9 sm:py-10"
          >
            <p className="mb-6 text-xs tracking-[0.14em] text-muted-foreground uppercase">
              Right now
            </p>
            <StrikeTask
              index={currentIndex}
              text={tasks[currentIndex] ?? ""}
              onComplete={() => resolve(currentIndex, "done")}
            />

            <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
              <button
                type="button"
                onClick={goBack}
                disabled={history.length === 0}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-35"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => resolve(currentIndex, "skipped")}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Skip this one <SkipForward className="h-4 w-4" />
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {!finished ? (
        <ol className="mt-10 space-y-3.5 pb-16">
          {tasks.map((task, i) =>
            i === currentIndex ? null : (
              <motion.li
                key={task + i}
                layout
                className="flex items-start gap-3.5 text-[0.98rem] leading-relaxed"
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.7rem] ${
                    statuses[i] === "done"
                      ? "bg-success text-success-foreground"
                      : "border border-border text-muted-foreground"
                  }`}
                >
                  {statuses[i] === "done" ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={
                    statuses[i] === "done"
                      ? "text-muted-foreground line-through decoration-primary decoration-2"
                      : statuses[i] === "skipped"
                        ? "text-muted-foreground/70 italic"
                        : "text-muted-foreground"
                  }
                >
                  {task}
                </span>
              </motion.li>
            ),
          )}
        </ol>
      ) : null}
    </div>
  );
}
