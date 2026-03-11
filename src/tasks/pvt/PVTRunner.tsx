import { useEffect } from "react";

interface Props {
  phase: "waiting" | "stimulus";
  elapsedMs: number;
  onRespond: () => void;
}

export function PVTRunner({ phase, elapsedMs, onRespond }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        onRespond();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onRespond]);

  const elapsed = Math.floor(elapsedMs / 1000);
  const remaining = Math.max(0, 180 - elapsed);

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handled via global window listener
    // biome-ignore lint/a11y/useSemanticElements: intentional full-screen click area
    <div className="pvt-runner" role="button" tabIndex={0} onClick={onRespond}>
      <div className="pvt-timer">残り {remaining} 秒</div>
      <div className={`pvt-stimulus ${phase === "stimulus" ? "visible" : ""}`}>
        <div className="pvt-circle" />
      </div>
      <p className="pvt-instruction">
        {phase === "waiting"
          ? "赤い丸が表示されたらすぐにクリックまたはスペースキーを押してください"
          : "今すぐクリック!"}
      </p>
    </div>
  );
}
