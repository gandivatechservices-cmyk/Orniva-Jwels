import { useEffect } from "react";

export function useKeyPress(
  targetKey: string,
  handler: (event: KeyboardEvent) => void,
  active: boolean = true
): void {
  useEffect(() => {
    if (!active) return;

    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        handler(event);
      }
    };

    window.addEventListener("keydown", keyHandler);
    return () => {
      window.removeEventListener("keydown", keyHandler);
    };
  }, [targetKey, handler, active]);
}
