import * as React from "react";

interface ListeningOverlayProps {
  open: boolean;
  label?: string;
  hint?: string;
  onCancel?: () => void;
  /** Live interim/final transcript to display while/after listening. */
  transcript?: string;
  /** Translated error message (mic denied, no speech, no support…). */
  errorMessage?: string;
  /** Called when the user wants to relaunch listening (after error or result). */
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * Full-screen overlay shown while the browser is listening for speech.
 * - Pulsing mic + animated bars
 * - Clear cancel button
 * - Respects safe-area insets on iOS / Android
 */
export function ListeningOverlay({
  open,
  label = "Je vous écoute…",
  hint = "Parlez clairement. Touchez « Arrêter » pour valider.",
  onCancel,
  transcript,
  errorMessage,
  onRetry,
  retryLabel = "Réessayer",
}: ListeningOverlayProps) {
  // ESC to cancel on desktop
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(10, 10, 20, 0.78)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "calc(24px + env(safe-area-inset-top, 0px)) 20px calc(24px + env(safe-area-inset-bottom, 0px))",
        animation: "fadeIn 180ms ease-out",
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes micPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245,200,66,0.55), 0 0 0 0 rgba(245,200,66,0.35); }
          50%      { box-shadow: 0 0 0 18px rgba(245,200,66,0), 0 0 0 36px rgba(245,200,66,0); }
        }
        @keyframes barBounce {
          0%, 100% { transform: scaleY(0.35); }
          50%      { transform: scaleY(1); }
        }
        .lo-bar { animation: barBounce 900ms ease-in-out infinite; transform-origin: center; }
      `}</style>

      <div
        aria-hidden="true"
        style={{
          width: 96,
          height: 96,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #f5c842 0%, #d4a017 100%)",
          display: "grid",
          placeItems: "center",
          color: "#1a1a2e",
          animation: "micPulse 1.6s ease-out infinite",
          marginBottom: 24,
        }}
      >
        <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z" />
          <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V21a1 1 0 1 0 2 0v-3.08A7 7 0 0 0 19 11Z" />
        </svg>
      </div>

      <div
        aria-hidden="true"
        style={{ display: "flex", alignItems: "center", gap: 6, height: 36, marginBottom: 20 }}
      >
        {[0, 120, 240, 360, 480, 240, 120].map((delay, i) => (
          <span
            key={i}
            className="lo-bar"
            style={{
              display: "block",
              width: 6,
              height: 32,
              borderRadius: 3,
              background: "#f5c842",
              animationDelay: `${delay}ms`,
            }}
          />
        ))}
      </div>

      <div style={{ color: "#fff", fontSize: 20, fontWeight: 700, textAlign: "center", marginBottom: 6 }}>
        {label}
      </div>
      {hint && (
        <div style={{ color: "#cbd5e1", fontSize: 14, textAlign: "center", maxWidth: 320, marginBottom: 16 }}>
          {hint}
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          style={{
            color: "#fecaca",
            background: "rgba(220,38,38,0.15)",
            border: "1px solid rgba(220,38,38,0.35)",
            borderRadius: 12,
            padding: "10px 16px",
            fontSize: 14,
            textAlign: "center",
            maxWidth: 320,
            marginBottom: 16,
          }}
        >
          {errorMessage}
        </div>
      )}

      {transcript && (
        <div
          style={{
            color: "#fff",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 12,
            padding: "10px 16px",
            fontSize: 16,
            fontStyle: "italic",
            textAlign: "center",
            maxWidth: 320,
            marginBottom: 20,
          }}
        >
          « {transcript} »
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            style={{
              minHeight: 48,
              padding: "12px 24px",
              borderRadius: 999,
              border: "1px solid rgba(245,200,66,0.5)",
              background: "rgba(245,200,66,0.15)",
              color: "#f5c842",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              touchAction: "manipulation",
            }}
          >
            <span aria-hidden="true">🔄</span> {retryLabel}
          </button>
        )}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              minHeight: 48,
              padding: "12px 28px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              touchAction: "manipulation",
            }}
          >
            <span aria-hidden="true">⏹</span> Arrêter
          </button>
        )}
      </div>
    </div>
  );
}
