"use client";

import { useEffect, useState } from "react";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");

    if (saved) {
      document.documentElement.classList.toggle("dark", saved === "dark");
    } else {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      document.documentElement.classList.toggle("dark", systemDark);
    }

    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <>{children}</>;
}