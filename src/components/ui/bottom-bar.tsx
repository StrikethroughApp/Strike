import { useEffect } from "react";

export default function FloatingBottomBar() {
  useEffect(() => {
    // Warm up haptics permission where available (best-effort)
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      // small, non-intrusive vibration to indicate UI readiness on first load
      try {
        navigator.vibrate?.(10);
      } catch (e) {
        // no-op
      }
    }
  }, []);

  function triggerHaptic() {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        // short, pleasant tap
        navigator.vibrate?.([8]);
      } catch (e) {}
    }
  }

  return (
    <div className="floating-bottom-bar" role="navigation" aria-label="Quick actions">
      <div className="bb-inner surface">
        <button
          className="bb-button"
          aria-label="Create"
          onClick={() => {
            triggerHaptic();
            // Placeholder: app-specific create flow can be hooked here
            const evt = new CustomEvent('app:action', { detail: { action: 'create' } });
            window.dispatchEvent(evt);
          }}
        >
          Create
        </button>

        <button
          className="bb-button"
          aria-label="Scan"
          onClick={() => {
            triggerHaptic();
            const evt = new CustomEvent('app:action', { detail: { action: 'scan' } });
            window.dispatchEvent(evt);
          }}
        >
          Scan
        </button>

        <button
          className="bb-button bb-cta"
          aria-label="Quick add"
          onClick={() => {
            triggerHaptic();
            const evt = new CustomEvent('app:action', { detail: { action: 'quick-add' } });
            window.dispatchEvent(evt);
          }}
        >
          Quick add
        </button>
      </div>
    </div>
  );
}
