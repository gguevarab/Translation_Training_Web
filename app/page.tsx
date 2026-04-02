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
  const [translationType, setTranslationType] = useState("");
  const [languageProficiency, setLanguageProficiency] = useState("");

  if (appState === "setup") {
    return (
      <SetupScreen
        initialSourceText={sourceText}
        initialTargetLang={targetLanguage}
        onStart={(text: string, srcLang: string, tgtLang: string, type: string, proficiency: string) => {
          setSourceText(text);
          setSourceLanguage(srcLang);
          setTargetLanguage(tgtLang);
          setTranslationType(type);
          setLanguageProficiency(proficiency);
          setAppState("translating");
          setTimeSpentSeconds(0);
        }}
      />
    );
  }

  if (appState === "translating" || appState === "results") {
    return (
      <EditorLayout
        appState={appState}
        sourceText={sourceText}
        sourceLanguage={sourceLanguage}
        targetLanguage={targetLanguage}
        translationType={translationType}
        languageProficiency={languageProficiency}
        timeSpentSeconds={timeSpentSeconds}
        translationText={translationText}
        dictionaryCache={dictionaryCache}
        reviewWords={reviewWords}
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
        onReset={() => {
          setAppState("setup");
          setSourceText("");
          setTranslationText("");
          setReviewWords([]);
          setDictionaryCache({});
          setTimeSpentSeconds(0);
          setTranslationType("");
          setLanguageProficiency("");
        }}
      />
    );
  }

  return null;
}
