import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle } from "lucide-react";

import { analyzeScene } from "@/lib/analyze.functions";
import { PhotoInput } from "@/components/strike/PhotoInput";
import { GoalComposer } from "@/components/strike/GoalComposer";
import { Analyzing } from "@/components/strike/Analyzing";
import { Clarify } from "@/components/strike/Clarify";
import { TaskRunner } from "@/components/strike/TaskRunner";

const TITLE = "Strikethrough — Photograph it, then get it done";
const DESCRIPTION =
  "Take a photo of the thing you want to get done. Strikethrough turns it into a few clear steps you strike through, one at a time.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Phase = "capture" | "analyzing" | "clarify" | "tasks";

function Index() {
  const analyze = useServerFn(analyzeScene);

  const [phase, setPhase] = useState<Phase>("capture");
  const [image, setImage] = useState<string | null>(null);
  const [goal, setGoal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState<{ question: string; options: string[] } | null>(null);
  const [session, setSession] = useState<{ title: string; tasks: string[] } | null>(null);

  async function run(clarification?: string) {
    if (!image) {
      setError("Add a photo first — Strikethrough works from what it can see.");
      return;
    }
    if (goal.trim().length < 2) {
      setError("Tell me what you'd like to get done, even roughly.");
      return;
    }

    setError(null);
    setPhase("analyzing");

    try {
      const response = await analyze({
        data: {
          imageDataUrl: image,
          goal: goal.trim(),
          ...(clarification ? { clarification } : {}),
        },
      });

      if (!response.ok) {
        setError(response.error);
        setPhase("capture");
        return;
      }

      const result = response.result;
      if (result.type === "question") {
        setQuestion({ question: result.question, options: result.options });
        setPhase("clarify");
        return;
      }
      if (result.type === "unable") {
        setError(result.reason);
        setPhase("capture");
        return;
      }

      setSession({ title: result.title, tasks: result.tasks });
      setPhase("tasks");
    } catch {
      setError("We lost the connection while thinking. Please try again.");
      setPhase("capture");
    }
  }

  function restart() {
    setPhase("capture");
    setImage(null);
    setGoal("");
    setQuestion(null);
    setSession(null);
    setError(null);
  }

  return (
    <main className="min-h-screen px-5 pt-10 pb-20 sm:px-8 sm:pt-14">
      <div className="mx-auto w-full max-w-2xl">
        <div className="flex items-center justify-between">
          <span className="wordmark relative text-[1.05rem] text-foreground">
            Strikethrough
            <span className="absolute top-1/2 -left-0.5 h-[2px] w-[calc(100%+4px)] -rotate-[0.6deg] rounded-full bg-primary opacity-90" />
          </span>
          {phase !== "capture" ? (
            <button
              type="button"
              onClick={restart}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Start over
            </button>
          ) : null}
        </div>

        <div className="mt-12 sm:mt-16">
          <AnimatePresence mode="wait">
            {phase === "capture" ? (
              <motion.section
                key="capture"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ type: "spring", stiffness: 210, damping: 26 }}
              >
                <h1 className="max-w-lg text-[2.1rem] leading-[1.12] font-semibold text-foreground sm:text-[3rem]">
                  Take a photo of what
                  <br className="hidden sm:block" /> you want done.
                </h1>
                <p className="mt-4 max-w-md text-[1.02rem] leading-relaxed text-muted-foreground">
                  Strikethrough looks at the actual space and gives you a handful of real steps —
                  then you strike them through, one by one.
                </p>

                <div className="mt-10">
                  <PhotoInput image={image} onChange={setImage} onError={setError} />
                </div>

                {image ? (
                  <GoalComposer
                    goal={goal}
                    onGoalChange={setGoal}
                    onSubmit={() => void run()}
                    disabled={false}
                  />
                ) : null}

                <AnimatePresence>
                  {error ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-6 flex items-start gap-3 rounded-2xl bg-primary-soft px-5 py-4 text-[0.92rem] text-accent-foreground"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.section>
            ) : null}

            {phase === "analyzing" && image ? (
              <Analyzing key="analyzing" image={image} goal={goal} />
            ) : null}

            {phase === "clarify" && question ? (
              <Clarify
                key="clarify"
                question={question.question}
                options={question.options}
                onAnswer={(answer) => void run(answer)}
              />
            ) : null}

            {phase === "tasks" && session && image ? (
              <TaskRunner
                key="tasks"
                title={session.title}
                tasks={session.tasks}
                image={image}
                onRestart={restart}
              />
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
