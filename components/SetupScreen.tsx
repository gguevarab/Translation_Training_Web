"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, ChevronDown, Search, History } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

interface SetupScreenProps {
  initialSourceText: string;
  initialTargetLang: string;
  onStart: (text: string, srcLang: string, tgtLang: string, type: string, proficiency: string) => void;
}

const LANGUAGES = [
  "English (US)",
  "English (UK)",
  "French (Modern)",
  "French (Old)",
  "Spanish",
  "German",
  "Italian",
  "Portuguese (Brazil)",
  "Portuguese (Portugal)",
  "Japanese",
  "Korean",
  "Chinese (Simplified)",
  "Chinese (Traditional)",
  "Russian",
  "Arabic",
  "Hindi",
  "Dutch",
  "Swedish",
  "Danish",
  "Norwegian",
  "Finnish",
  "Turkish",
  "Polish",
  "Latin",
  "Ancient Greek",
  "Sanskrit",
  "Hebrew",
].sort();

function LanguageSelect({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (val: string) => void;
  label: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = LANGUAGES.filter((l) =>
    l.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full flex-1 flex flex-col gap-2 relative" ref={dropdownRef}>
      <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </label>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch("");
        }}
        className="p-3 border border-border bg-background text-foreground rounded-md focus:outline-none focus:ring-1 focus:ring-primary/20 flex items-center justify-between shadow-sm transition-all text-left"
      >
        <span className="truncate">{value}</span>
        <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-[100%] left-0 w-full z-50 mt-1 bg-surface border border-border rounded-md shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 border-b border-border flex items-center gap-2 bg-background">
            <Search size={14} className="text-muted-foreground" />
            <input
              autoFocus
              type="text"
              className="bg-transparent border-none focus:outline-none text-sm w-full"
              placeholder="Search language..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    onChange(l);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-3 text-sm hover:bg-primary/10 transition-colors ${
                    value === l ? "bg-primary/5 text-primary font-medium" : "text-foreground"
                  }`}
                >
                  {l}
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground italic">
                No languages found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function SetupScreen({
  initialSourceText,
  initialTargetLang,
  onStart,
}: SetupScreenProps) {
  const [text, setText] = useState(initialSourceText);
  const [nativeLang, setNativeLang] = useState("English (US)");
  const [tgtLang, setTgtLang] = useState(initialTargetLang);
  const [translationDirection, setTranslationDirection] = useState<"native-to-target" | "target-to-native">("target-to-native");
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
        <div className="absolute top-0 right-0 flex items-center gap-2">
          {mounted && (
            <>
              <Link href="/history">
                <button
                  className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-surface-hover rounded-md transition-colors font-medium"
                >
                  <History size={18} />
                  History
                </button>
              </Link>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full hover:bg-surface-hover text-muted-foreground transition-colors"
                title="Toggle Theme"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </>
          )}
        </div>

        <h1 className="text-3xl font-serif text-primary mb-8 font-medium tracking-tight">
          The Academic Editorial
        </h1>

        <div className="flex flex-col gap-6 mb-8 bg-surface p-6 rounded-lg border border-border shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6 z-10 w-full relative">
            <LanguageSelect
              label="Native Language"
              value={nativeLang}
              onChange={setNativeLang}
            />
            
            <LanguageSelect
              label="Target Learning Language"
              value={tgtLang}
              onChange={setTgtLang}
            />
          </div>
          
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Translation Direction</span>
            <div className="flex flex-col md:flex-row gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="direction"
                  value="native-to-target"
                  checked={translationDirection === "native-to-target"}
                  onChange={() => setTranslationDirection("native-to-target")}
                  className="accent-primary"
                />
                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                  Translate {nativeLang} to {tgtLang}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="direction"
                  value="target-to-native"
                  checked={translationDirection === "target-to-native"}
                  onChange={() => setTranslationDirection("target-to-native")}
                  className="accent-primary"
                />
                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                  Translate {tgtLang} to {nativeLang}
                </span>
              </label>
            </div>
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
                  body: JSON.stringify({ 
                    text, 
                    nativeLanguage: nativeLang,
                    targetLanguage: tgtLang,
                    translationDirection
                  })
                });
                const data = await res.json();
                if (!res.ok) throw new Error("Failed");
                onStart(
                  text, 
                  data.detectedLanguage, 
                  translationDirection === 'native-to-target' ? tgtLang : nativeLang, 
                  data.translationType, 
                  data.languageProficiencyRequired
                );
              } catch (err) {
                console.error(err);
                setIsAnalyzing(false);
                onStart(
                  text, 
                  "Unknown Language", 
                  translationDirection === 'native-to-target' ? tgtLang : nativeLang, 
                  "Unknown Type", 
                  "Unknown Proficiency"
                );
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
