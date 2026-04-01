"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, ArrowLeftRight } from "lucide-react";
import { useState, useEffect } from "react";

interface SetupScreenProps {
  initialSourceText: string;
  initialTargetLang: string;
  onStart: (text: string, srcLang: string, tgtLang: string) => void;
}

const LANGUAGES = [
  "English (US)",
  "English (UK)",
  "French (Modern)",
  "French (Old)",
  "Spanish",
  "German",
  "Italian",
  "Latin",
  "Ancient Greek",
];

export function SetupScreen({
  initialSourceText,
  initialTargetLang,
  onStart,
}: SetupScreenProps) {
  const [text, setText] = useState(initialSourceText);
  const [tgtLang, setTgtLang] = useState(initialTargetLang);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors p-8">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col pt-12 relative animate-in fade-in duration-500">
        <div className="absolute top-0 right-0">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-surface-hover text-muted-foreground transition-colors"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}
        </div>

        <h1 className="text-3xl font-serif text-primary mb-8 font-medium tracking-tight">
          The Academic Editorial
        </h1>

        <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
          <div className="w-full flex-1 flex flex-col gap-2">
            <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Target Language
            </label>
            <select
              value={tgtLang}
              onChange={(e) => setTgtLang(e.target.value)}
              className="p-3 border border-border bg-surface text-foreground rounded-md focus:outline-none focus:ring-1 focus:ring-primary/20 appearance-none font-sans shadow-sm"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 flex flex-col relative bg-surface border border-border rounded-lg shadow-sm overflow-hidden mb-8 transition-colors">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Begin typing or paste the original manuscript here. The editor will automatically preserve formatting and detect linguistic structures..."
            className="w-full flex-1 p-8 bg-transparent focus:outline-none resize-none font-serif text-lg leading-relaxed md:pb-32"
          />
          {text.length === 0 && (
            <div className="absolute inset-x-0 bottom-12 flex flex-col items-center justify-center opacity-40 pointer-events-none">
              <p className="font-serif italic text-lg text-center">
                &quot;To have another language is to possess a second soul.&quot;
              </p>
              <p className="text-xs mt-3 uppercase tracking-widest font-semibold">
                — Charlemagne
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            disabled={!mounted || text.trim().length === 0 || isAnalyzing}
            onClick={async () => {
              setIsAnalyzing(true);
              try {
                const res = await fetch("/api/analyze", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ text, targetLanguage: tgtLang })
                });
                const data = await res.json();
                if (!res.ok) throw new Error("Failed");
                onStart(text, data.detectedLanguage, tgtLang);
              } catch (err) {
                console.error(err);
                setIsAnalyzing(false);
                onStart(text, "Unknown Language", tgtLang);
              }
            }}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-medium shadow-sm hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? "Analyzing Text..." : "Start Translation"}
          </button>
        </div>
      </div>
    </div>
  );
}
