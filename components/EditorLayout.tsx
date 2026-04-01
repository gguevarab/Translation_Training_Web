"use client";

import { SourcePanel } from "./SourcePanel";
import { TranslationCanvas } from "./TranslationCanvas";
import { ContextSidebar } from "./ContextSidebar";

export type DictionaryResult = {
  originalWord?: string;
  partOfSpeech: string;
  ipa?: string;
  meaning: string;
  translations: string[];
};

interface EditorLayoutProps {
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  timeSpentSeconds: number;
  translationText: string;
  dictionaryCache: Record<string, DictionaryResult>;
  setTranslationText: (text: string) => void;
  setDictionaryCache: React.Dispatch<React.SetStateAction<Record<string, DictionaryResult>>>;
  onTimeUpdate: (seconds: number) => void;
  onWordClick: (word: string) => void;
  onFinish: (translation: string) => void;
}

export function EditorLayout({
  sourceText,
  sourceLanguage,
  targetLanguage,
  timeSpentSeconds,
  translationText,
  dictionaryCache,
  setTranslationText,
  setDictionaryCache,
  onTimeUpdate,
  onWordClick,
  onFinish,
}: EditorLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground animate-in fade-in duration-500">
      {/* Three Column Split */}

      <div className="w-1/3 min-w-[300px] border-r border-border bg-surface overflow-y-auto">
        <SourcePanel
          text={sourceText}
          language={sourceLanguage}
          targetLanguage={targetLanguage}
          dictionaryCache={dictionaryCache}
          setDictionaryCache={setDictionaryCache}
          onWordClick={onWordClick}
        />
      </div>

      {/* Center Panel: Translation Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TranslationCanvas 
          targetLanguage={targetLanguage} 
          content={translationText}
          setContent={setTranslationText}
        />
      </div>

      {/* Right Panel: Context Sidebar */}
      <div className="w-64 min-w-[256px] border-l border-border bg-surface shadow-sm z-10">
        <ContextSidebar
          initialTimeSeconds={timeSpentSeconds}
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          dictionaryCache={dictionaryCache}
          onTimeUpdate={onTimeUpdate}
          onFinish={() => onFinish(translationText)}
        />
      </div>
    </div>
  );
}
