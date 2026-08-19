import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Camera, ImagePlus, RefreshCw, X } from "lucide-react";
import { fileToDataUrl } from "@/lib/image";

type Props = {
  image: string | null;
  onChange: (dataUrl: string | null) => void;
  onError: (message: string) => void;
};

export function PhotoInput({ image, onChange, onError }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await fileToDataUrl(file));
    } catch (e) {
      onError(e instanceof Error ? e.message : "We couldn't use that photo. Try another one.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {image ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 26 }}
          className="surface relative overflow-hidden rounded-3xl p-2"
        >
          <img
            src={image}
            alt="The space you want to work on"
            className="max-h-[52vh] w-full rounded-[1.25rem] object-cover"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <IconAction label="Replace photo" onClick={() => galleryRef.current?.click()}>
              <RefreshCw className="h-4 w-4" />
            </IconAction>
            <IconAction label="Remove photo" onClick={() => onChange(null)}>
              <X className="h-4 w-4" />
            </IconAction>
          </div>
        </motion.div>
      ) : (
        <motion.div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void handleFile(e.dataTransfer.files?.[0]);
          }}
          animate={{ scale: dragOver ? 1.008 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className={`relative rounded-[1.75rem] border border-dashed p-8 text-center transition-colors sm:p-14 ${
            dragOver ? "border-primary bg-primary-soft" : "border-border bg-paper"
          }`}
          style={{ boxShadow: "var(--shadow-tactile)" }}
        >
          <div className="mx-auto flex h-16 w-16 rotate-[-3deg] items-center justify-center rounded-[1.4rem] bg-primary-soft text-accent-foreground">
            <Camera className="h-7 w-7" strokeWidth={1.8} />
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-foreground sm:text-[1.75rem]">
            Show me the space
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-[0.95rem] leading-relaxed text-muted-foreground">
            One photo is enough. Strikethrough looks at what's actually there.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              disabled={busy}
              onClick={() => cameraRef.current?.click()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-[0.95rem] font-medium text-primary-foreground shadow-[var(--shadow-tactile)] transition-transform duration-200 active:scale-[0.98] disabled:opacity-60 sm:w-auto"
            >
              <Camera className="h-4 w-4" /> Take a photo
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => galleryRef.current?.click()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-paper px-7 py-3.5 text-[0.95rem] font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60 sm:w-auto"
            >
              <ImagePlus className="h-4 w-4" /> Choose an image
            </button>
          </div>
          {busy ? (
            <p className="mt-5 text-sm text-muted-foreground">Getting your photo ready…</p>
          ) : null}
        </motion.div>
      )}
    </div>
  );
}

function IconAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-paper/90 text-foreground shadow-[var(--shadow-tactile)] backdrop-blur transition-transform duration-200 active:scale-95"
    >
      {children}
    </button>
  );
}
