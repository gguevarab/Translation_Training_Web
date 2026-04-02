"use client";

import { useState } from "react";

interface TranslationCanvasProps {
  targetLanguage: string;
  content: string;
  setContent: (content: string) => void;
  readOnly?: boolean;
}

export function TranslationCanvas({ targetLanguage, content, setContent, readOnly }: TranslationCanvasProps) {
  return (
    <div className="h-full flex flex-col p-8 md:p-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-2">
            Translation Draft
          </h2>
          <span className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
            {targetLanguage}
          </span>
        </div>
        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {content.length > 0 ? "Autosaved" : "Ready"}
        </div>
      </div>

      <textarea
        value={content}
        onChange={(e) => {
          if (!readOnly) setContent(e.target.value);
        }}
        readOnly={readOnly}
        placeholder={`Begin your ${targetLanguage} translation here...`}
        className={`flex-1 w-full bg-transparent resize-none outline-none font-serif text-lg leading-loose placeholder:text-muted-foreground/40 ${readOnly ? 'opacity-80' : ''}`}
      />
    </div>
  );
}
