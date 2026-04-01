"use client";

import { useState } from "react";
import { SetupScreen } from "../components/SetupScreen";
import { EditorLayout, DictionaryResult } from "../components/EditorLayout";
import { ResultsScreen } from "../components/ResultsScreen";

export type AppState = "setup" | "translating" | "results";

export default function TranslationInterface() {
  const [appState, setAppState] = useState<AppState>("setup");
  const [sourceText, setSourceText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("French (Modern)");
  const [reviewWords, setReviewWords] = useState<string[]>([]);
  const [dictionaryCache, setDictionaryCache] = useState<Record<string, DictionaryResult>>({});
  const [translationText, setTranslationText] = useState("");
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);

  if (appState === "setup") {
    return (
      <SetupScreen
        initialSourceText={sourceText}
        initialTargetLang={targetLanguage}
        onStart={(text: string, srcLang: string, tgtLang: string) => {
          setSourceText(text);
          setSourceLanguage(srcLang);
          setTargetLanguage(tgtLang);
          setAppState("translating");
          setTimeSpentSeconds(0);
        }}
      />
    );
  }

  if (appState === "translating") {
    return (
      <EditorLayout
        sourceText={sourceText}
        sourceLanguage={sourceLanguage}
        targetLanguage={targetLanguage}
        timeSpentSeconds={timeSpentSeconds}
        translationText={translationText}
        dictionaryCache={dictionaryCache}
        setTranslationText={setTranslationText}
        setDictionaryCache={setDictionaryCache}
        onTimeUpdate={setTimeSpentSeconds}
        onWordClick={(word: string) => {
          if (!reviewWords.includes(word)) {
            setReviewWords((prev) => [...prev, word]);
          }
        }}
        onFinish={(finalTranslation: string) => {
          setTranslationText(finalTranslation);
          setAppState("results");
        }}
      />
    );
  }

  return (
    <ResultsScreen
      sourceText={sourceText}
      translationText={translationText}
      sourceLanguage={sourceLanguage}
      targetLanguage={targetLanguage}
      reviewWords={reviewWords}
      dictionaryCache={dictionaryCache}
      timeSpentSeconds={timeSpentSeconds}
      onReset={() => {
        setAppState("setup");
        setSourceText("");
        setTranslationText("");
        setReviewWords([]);
        setDictionaryCache({});
        setTimeSpentSeconds(0);
      }}
    />
  );
}
