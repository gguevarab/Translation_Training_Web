"use client";

import { useState, useEffect } from "react";

interface SourcePanelProps {
  text: string;
  language: string;
  targetLanguage: string;
  dictionaryCache: Record<string, DictionaryResult>;
  setDictionaryCache: React.Dispatch<React.SetStateAction<Record<string, DictionaryResult>>>;
  onWordClick: (word: string) => void;
}

type DictionaryResult = {
  originalWord?: string;
  partOfSpeech: string;
  ipa?: string;
  meaning: string;
  translations: string[];
};

type ActiveWordState = {
  word: string;
  isHigh: boolean;
  loading: boolean;
  boxStyle: React.CSSProperties;
  arrowStyle: React.CSSProperties;
  data?: DictionaryResult;
  error?: string;
};

export function SourcePanel({ text, language, targetLanguage, dictionaryCache, setDictionaryCache, onWordClick }: SourcePanelProps) {
  const [activeWord, setActiveWord] = useState<ActiveWordState | null>(null);
  const words = text.split(/(\s+)/); 
  
  const handleWordClick = (e: React.MouseEvent<HTMLSpanElement>, rawWord: string) => {
    e.stopPropagation();
    const cleanWord = rawWord.replace(/[.,/#!$%^&*;:{}=\-_`~()""'']/g,"").trim();
    if (!cleanWord) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const isHigh = rect.top < 250;
    const windowWidth = window.innerWidth;
    const wordCenter = rect.left + rect.width / 2;
    const wordY = isHigh ? rect.bottom + 10 : rect.top - 10;
    
    let boxStyle: React.CSSProperties = {
      top: wordY,
      transform: isHigh ? "translateY(0)" : "translateY(-100%)",
    };
    
    let arrowStyle: React.CSSProperties = {};
    
    if (wordCenter < 200) {
      boxStyle.left = 16;
      arrowStyle.left = wordCenter - 16;
      arrowStyle.transform = "translateX(-50%)";
    } else if (wordCenter > windowWidth - 200) {
      boxStyle.right = 16;
      arrowStyle.right = windowWidth - wordCenter - 16;
      arrowStyle.transform = "translateX(50%) text-xs"; // Note: string concat is handled by React inline styles, but text-xs is a tailwind class. We remove text-xs here.
      arrowStyle.transform = "translateX(50%)";
    } else {
      boxStyle.left = wordCenter;
      boxStyle.transform += " translateX(-50%)";
      arrowStyle.left = "50%";
      arrowStyle.transform = "translateX(-50%)";
    }
    
    setActiveWord({ 
      word: cleanWord,
      isHigh,
      loading: true,
      boxStyle,
      arrowStyle
    });
    
    onWordClick(cleanWord);
  };

  useEffect(() => {
    const handleClickOutside = () => setActiveWord(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // Dictionary API Fetch
  useEffect(() => {
    if (!activeWord || !activeWord.loading) return;

    let isMounted = true;
    const fetchDefinition = async () => {
      // 1. Check if it's already in the shared cache
      if (dictionaryCache[activeWord.word]) {
        setActiveWord(prev => prev ? { 
          ...prev, 
          loading: false, 
          data: dictionaryCache[activeWord.word] 
        } : null);
        return;
      }

      // 2. Otherwise fetch from Gemini
      try {
        const res = await fetch("/api/dictionary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            word: activeWord.word,
            sourceLanguage: language,
            targetLanguage: targetLanguage
          })
        });
        
        const data = await res.json();
        if (!isMounted) return;

        if (!res.ok) {
          throw new Error(data.error || "Translation failed");
        }

        // Add to global cache
        setDictionaryCache(prev => ({ ...prev, [activeWord.word]: data }));

        setActiveWord(prev => prev ? { 
          ...prev, 
          loading: false, 
          data 
        } : null);
        
      } catch (err: any) {
        if (isMounted) {
          setActiveWord(prev => prev ? { ...prev, loading: false, error: err.message || "Error" } : null);
        }
      }
    };

    fetchDefinition();

    return () => { isMounted = false; };
  }, [activeWord?.word, language, targetLanguage, dictionaryCache, setDictionaryCache]);

  return (
    <div className="p-8 md:p-12 relative h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-2">
          Source Material
        </h2>
        <span className="text-sm px-2 py-1 bg-muted text-muted-foreground rounded">
          {language}
        </span>
      </div>
      
      <div className="font-serif text-lg leading-loose text-foreground flex-1 whitespace-pre-wrap">
        {words.map((chunk, i) => {
          if (/\s+/.test(chunk)) {
            return <span key={i}>{chunk}</span>;
          }
          return (
            <span
              key={i}
              onClick={(e) => handleWordClick(e, chunk)}
              className="px-0.5 rounded cursor-pointer hover:bg-primary/10 transition-colors"
            >
              {chunk}
            </span>
          );
        })}
      </div>

      {activeWord && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 bg-surface border border-border text-foreground p-5 rounded-lg shadow-xl text-sm min-w-64 max-w-sm animate-in fade-in zoom-in-95 duration-200"
          style={activeWord.boxStyle}
        >
          <div className="flex items-baseline gap-2 mb-2 flex-wrap">
            <span className="font-serif font-bold text-xl text-primary">{activeWord.word}</span>
            {activeWord.data?.originalWord && activeWord.data.originalWord.toLowerCase() !== activeWord.word.toLowerCase() && (
              <span className="text-sm italic text-muted-foreground">({activeWord.data.originalWord})</span>
            )}
            {activeWord.data?.ipa && (
              <span className="text-muted-foreground font-mono text-xs ml-auto">{activeWord.data.ipa}</span>
            )}
          </div>

          {activeWord.loading ? (
            <div className="text-muted-foreground italic text-xs animate-pulse">Running AI linguistic analysis...</div>
          ) : activeWord.error ? (
            <div className="text-destructive font-medium text-xs">{activeWord.error}</div>
          ) : activeWord.data ? (
            <div>
              <div className="text-xs font-semibold tracking-wider uppercase text-primary/70 mb-2">
                {activeWord.data.partOfSpeech}
              </div>
              <p className="text-sm leading-relaxed text-foreground/90 mb-3 font-serif">
                {activeWord.data.meaning}
              </p>
              
              {activeWord.data.translations && activeWord.data.translations.length > 0 && (
                <div className="pt-3 border-t border-border mt-3">
                  <div className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-2">
                    Direct Translations
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeWord.data.translations.map((t, idx) => (
                      <span key={idx} className="bg-primary/5 text-primary border border-primary/10 px-2 py-1 rounded text-xs font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
          
          <div 
            className={`absolute w-3 h-3 bg-surface border-border rotate-45 ${
              activeWord.isHigh ? "border-t border-l -top-1.5" : "border-b border-r -bottom-1.5"
            }`}
            style={activeWord.arrowStyle}
          ></div>
        </div>
      )}
    </div>
  );
}
