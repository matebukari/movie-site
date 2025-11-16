import { useRef } from "react";

export default function useFetchLock() {
  const lock = useRef(false);

  const runLocked = async (fn) => {
    if (lock.current) return;
    lock.current = true;

    try {
      await fn();
    } finally {
      lock.current = false;
    }
  };

  return runLocked;
}
