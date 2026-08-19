type ErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

export function reportAppError(error: unknown, context: Record<string, unknown> = {}) {
  // Minimal, non-branded error reporting shim:
  // - Logs to console for debugging
  // - If the host page exposes a reporting hook (e.g. for integrations), call it
  if (typeof window === "undefined") return;

  // Console logging is always useful locally
  try {
    console.error("Reported error:", error, context);
  } catch (e) {
    // ignore
  }

  // Allow host apps to hook into runtime error reporting using a neutral name
  // This keeps integrations possible without mentioning a vendor.
  // Expected payload: { message, stack?, filename?, context? }
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  if (typeof (window as any).__appReportRuntimeError === "function") {
    try {
      (window as any).__appReportRuntimeError({
        message,
        ...(stack ? { stack } : {}),
        filename: window.location?.pathname,
        context,
      });
    } catch (e) {
      // swallow to avoid secondary failures
    }
  }
}
