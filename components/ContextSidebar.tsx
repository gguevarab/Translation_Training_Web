"use client";

import { useState, useEffect, useRef } from "react";
import { Clock, Info, ArrowRight } from "lucide-react";

interface ContextSidebarProps {
  sourceLanguage: string;
  targetLanguage: string;
  dictionaryCache: Record<string, any>;
  initialTimeSeconds: number;
  onTimeUpdate: (seconds: number) => void;
  onFinish: () => void;
}

export function ContextSidebar({
  sourceLanguage,
  targetLanguage,
  dictionaryCache,
  initialTimeSeconds,
  onTimeUpdate,
  onFinish
}: ContextSidebarProps) {
  const [seconds, setSeconds] = useState(initialTimeSeconds);
  const onTimeUpdateRef = useRef(onTimeUpdate);

  // Keep a fresh reference to onTimeUpdate so the interval doesn't go stale or continuously reset
  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Sync with parent occasionally outside of the render phase
  useEffect(() => {
    if (seconds > 0 && seconds % 5 === 0) {
      onTimeUpdateRef.current(seconds);
    }
  }, [seconds]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-0 overflow-y-auto flex-1 flex flex-col gap-8">
        
        {/* Header */}
        <div>
          <h2 className="font-serif text-xl font-medium text-foreground mb-1">Session Context</h2>
          <p className="text-xs text-muted-foreground font-semibold tracking-wider uppercase">Linguistic Nuance Mode</p>
        </div>

        {/* Timer */}
        <div className="bg-surface border border-border rounded-lg p-4 flex flex-col items-center justify-center shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock size={16} />
            <span className="text-xs uppercase font-semibold tracking-wider">Session Timer</span>
          </div>
          <div className="text-3xl font-mono text-primary font-medium tracking-tight">
            {formatTime(seconds)}
          </div>
        </div>

        {/* Metadata */}
        <div>
          <div className="flex items-center justify-between text-sm font-medium mb-2 border-b border-border pb-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Source</span>
              <span>{sourceLanguage.split(' ')[0]}</span>
            </div>
            <ArrowRight className="text-muted-foreground" size={16} strokeWidth={1.5} />
            <div className="flex flex-col text-right">
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Target</span>
              <span>{targetLanguage.split(' ')[0]}</span>
            </div>
          </div>
        </div>

        {/* Dictionary History */}
        <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden flex flex-col max-h-[40vh]">
          <div className="bg-muted p-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
              <Info size={14} />
              <span>Dictionary History</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium bg-background px-2 py-0.5 rounded-full border border-border">
              {Object.keys(dictionaryCache).length} words
            </span>
          </div>
          
          <div className="overflow-y-auto p-3 flex-1">
            {Object.keys(dictionaryCache).length > 0 ? (
              <ul className="space-y-3">
                {Object.entries(dictionaryCache).map(([word, data]) => (
                  <li key={word} className="pb-3 border-b border-border/50 last:border-0 last:pb-0">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="font-serif font-bold text-foreground text-sm">{word}</span>
                      {data?.originalWord && data.originalWord !== word && (
                         <span className="text-[10px] italic text-muted-foreground">({data.originalWord})</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {data?.translations?.[0] || data?.meaning || "Definition captured"}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-24 flex items-center justify-center text-center">
                <p className="text-xs text-muted-foreground italic">
                  Click on words in the source text to log them here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="pt-6 border-t border-border mt-auto">
        <button 
          onClick={() => {
            onTimeUpdate(seconds); // Ensure we save the final exact second
            onFinish();
          }}
          className="w-full bg-primary text-primary-foreground py-4 rounded-md font-medium shadow-sm hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          Finish Translation
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
