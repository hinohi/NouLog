import { useState, useEffect } from "react";

export function useHashRoute(): string {
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || "/");

  useEffect(() => {
    const handler = () => {
      setRoute(window.location.hash.slice(1) || "/");
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  return route;
}
