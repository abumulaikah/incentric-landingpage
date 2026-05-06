import { useEffect, useState } from "react";

const reducedEffectsQuery = "(max-width: 767px), (pointer: coarse), (prefers-reduced-motion: reduce)";

export function useReducedEffects() {
  const [shouldReduce, setShouldReduce] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia(reducedEffectsQuery);
    const updatePreference = () => setShouldReduce(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return shouldReduce;
}
