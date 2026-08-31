import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { mode, toggleMode } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={mode === "dark" ? "Switch to light studio theme" : "Switch to obsidian dark theme"}
      className={`glass magnetic grid h-9 w-9 shrink-0 place-items-center rounded-full text-foreground ${className}`}
    >
      {mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
