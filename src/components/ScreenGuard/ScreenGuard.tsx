import { useState, useEffect } from "react";
import ScreenRotationIcon from "@mui/icons-material/ScreenRotation";

export const MIN_SIZE = 768;

export function ScreenGuard() {
  const [blocked, setBlocked] = useState(false);
  const [recommendRotate, setRecommendRotate] = useState(false);

  useEffect(() => {
    const mqWidth = window.matchMedia(`(max-width: ${MIN_SIZE}px)`);
    const mqHeight = window.matchMedia(`(min-height: ${MIN_SIZE}px)`);

    const evaluate = () => {
      const tooNarrow = mqWidth.matches;
      const tallEnough = mqHeight.matches;

      setBlocked(tooNarrow);
      setRecommendRotate(tooNarrow && tallEnough);
    };

    evaluate();

    mqWidth.addEventListener("change", evaluate);
    mqHeight.addEventListener("change", evaluate);

    return () => {
      mqWidth.removeEventListener("change", evaluate);
      mqHeight.removeEventListener("change", evaluate);
    };
  }, []);

  if (!blocked) return null;

  const message = recommendRotate
    ? "Screen too narrow. Rotate the device for a usable layout."
    : "Screen too small. Minimum width of 768 px is required.";

  return (
    <div
      style={{
        position: "fixed",
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.8)",
        color: "#fff",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.2rem",
        textAlign: "center",
      }}
    >
      {recommendRotate && <ScreenRotationIcon sx={{ fontSize: 48 }} />}
      {message}
    </div>
  );
}
