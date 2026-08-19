export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

/**
 * Reads a user-selected file and returns a downscaled JPEG data URL,
 * so uploads stay small and fast regardless of camera resolution.
 */
export async function fileToDataUrl(file: File, maxEdge = 1280): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("That file doesn't look like a photo. Try a JPG, PNG or HEIC image.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("That photo is very large. Try one under 25MB.");
  }

  const original = await readAsDataUrl(file);

  try {
    const img = await loadImage(original);
    const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return original;
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", 0.82);
  } catch {
    return original;
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("We couldn't read that photo. Try picking it again."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("invalid image"));
    img.src = src;
  });
}

export function haptic(pattern: number | number[] = 8) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* ignore */
    }
  }
}
