"use client";

import { SourcePanel } from "./SourcePanel";
import { TranslationCanvas } from "./TranslationCanvas";
import { ContextSidebar } from "./ContextSidebar";
import { ResultsScreen } from "./ResultsScreen";

export type DictionaryResult = {
  originalWord?: string;
  partOfSpeech: string;
  ipa?: string;
  meaning: string;
  translations: string[];
};

interface EditorLayoutProps {
  appState?: "translating" | "results";
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  translationType?: string;
  languageProficiency?: string;
  timeSpentSeconds: number;
  translationText: string;
  dictionaryCache: Record<string, DictionaryResult>;
  reviewWords?: string[];
  setTranslationText: (text: string) => void;
  setDictionaryCache: React.Dispatch<React.SetStateAction<Record<string, DictionaryResult>>>;
  onTimeUpdate: (seconds: number) => void;
  onWordClick: (word: string) => void;
  onFinish: (translation: string) => void;
  onReset?: () => void;
}

export function EditorLayout({
  appState = "translating",
  sourceText,
  sourceLanguage,
  targetLanguage,
  translationType,
  languageProficiency,
  timeSpentSeconds,
  translationText,
  dictionaryCache,
  reviewWords = [],
  setTranslationText,
  setDictionaryCache,
  onTimeUpdate,
  onWordClick,
  onFinish,
  onReset,
}: EditorLayoutProps) {
  const isResults = appState === "results";
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground animate-in fade-in duration-500">
      {/* Three Column Split */}

      <div className={`border-r border-border bg-surface overflow-y-auto ${isResults ? 'w-1/3 min-w-[300px]' : 'w-1/3 min-w-[300px]'}`}>
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
      <div className={`${isResults ? 'w-1/3 min-w-[300px] border-r border-border' : 'flex-1'} flex flex-col overflow-hidden relative`}>
        <TranslationCanvas
          targetLanguage={targetLanguage}
          content={translationText}
          setContent={setTranslationText}
          readOnly={isResults}
        />
      </div>

      {/* Right Panel: Context Sidebar or Results */}
      <div className={`${isResults ? 'flex-1 min-w-[400px]' : 'w-64 min-w-[256px] border-l'} border-border bg-surface shadow-sm z-10 flex overflow-hidden`}>
        {isResults ? (
          <ResultsScreen
            sourceText={sourceText}
            translationText={translationText}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
            translationType={translationType}
            languageProficiency={languageProficiency}
            reviewWords={reviewWords}
            dictionaryCache={dictionaryCache}
            timeSpentSeconds={timeSpentSeconds}
            onReset={onReset || (() => {})}
          />
        ) : (
          <ContextSidebar
            initialTimeSeconds={timeSpentSeconds}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
            translationType={translationType}
            languageProficiency={languageProficiency}
            dictionaryCache={dictionaryCache}
            onTimeUpdate={onTimeUpdate}
            onFinish={() => onFinish(translationText)}
          />
        )}
      </div>
    </div>
  );
}
