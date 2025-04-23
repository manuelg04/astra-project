"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="rounded px-3 py-2 bg-primary text-primary-foreground"
    >
      {dark ? "Tema claro" : "Tema oscuro"}
    </button>
  );
}
