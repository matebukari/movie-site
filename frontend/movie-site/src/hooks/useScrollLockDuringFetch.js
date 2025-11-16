import { useRef } from "react";

export default function useScrollLockDuringFetch() {
  const lockRef = useRef(false);

  const runLocked = async (fn) => {
    if (lockRef.current) return;
    lockRef.current = true;

    try {
      await fn();
    } finally {
      lockRef.current = false;
    }
  };

  return { runLocked };
}
