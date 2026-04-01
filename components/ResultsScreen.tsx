"use client";

import { useState, useEffect } from "react";
import { CheckCircle, RotateCcw, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface ResultsScreenProps {
  sourceText: string;
  translationText: string;
  sourceLanguage: string;
  targetLanguage: string;
  dictionaryCache: Record<string, any>;
  reviewWords: string[];
  timeSpentSeconds: number;
  onReset: () => void;
}

export function ResultsScreen({
  sourceText,
  translationText,
  sourceLanguage,
  targetLanguage,
  dictionaryCache,
  timeSpentSeconds,
  onReset,
}: ResultsScreenProps) {
  const [evaluation, setEvaluation] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchEvaluation = async () => {
      try {
        const res = await fetch("/api/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceText,
            translationText,
            sourceLanguage,
            targetLanguage
          })
        });
        
        const data = await res.json();
        if (!isMounted) return;

        if (!res.ok) {
          throw new Error(data.error || "Failed to evaluate");
        }
        
        setEvaluation(data.evaluation);
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "An error occurred during evaluation.");
        }
      } finally {
        if (isMounted) setIsEvaluating(false);
      }
    };

    if (translationText.trim().length > 0) {
      fetchEvaluation();
    } else {
      setIsEvaluating(false);
      setError("No translation provided to evaluate.");
    }

    return () => { isMounted = false; };
  }, [sourceText, translationText, sourceLanguage, targetLanguage]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (m === 0) return `${s} seconds`;
    if (m === 1) return `1 minute, ${s} seconds`;
    return `${m} minutes, ${s} seconds`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors p-8 relative animate-in fade-in duration-500 overflow-y-auto w-full">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col py-8 pb-20">
        
        <div className="flex flex-col items-center text-center mb-12">
          <div className="mb-6 text-primary">
            {isEvaluating ? (
              <Loader2 size={64} strokeWidth={1.5} className="animate-spin text-primary/50" />
            ) : (
              <CheckCircle size={64} strokeWidth={1.5} />
            )}
          </div>
          <h1 className="text-4xl font-serif text-primary mb-4 font-medium tracking-tight">
            {isEvaluating ? "Analyzing Translation..." : "Translation Complete"}
          </h1>
          <p className="text-lg text-muted-foreground">
            You completed this session in <span className="font-semibold text-foreground">{formatTime(timeSpentSeconds)}</span>.
          </p>
        </div>
        
        {!isEvaluating && evaluation && (
          <div className="bg-surface border border-border rounded-xl p-8 md:p-12 mb-12 shadow-sm text-left">
            <ReactMarkdown 
              rehypePlugins={[rehypeRaw]} 
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({node, ...props}) => <h2 className="text-2xl font-serif font-bold text-primary mt-8 mb-4 border-b border-border pb-2" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-xl font-serif font-medium text-foreground mt-6 mb-3" {...props} />,
                p: ({node, ...props}) => <p className="text-base text-foreground/90 leading-relaxed mb-4" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/90" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-foreground/90" {...props} />,
                li: ({node, ...props}) => <li className="leading-relaxed marker:text-primary/50" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary bg-primary/5 pl-5 py-3 italic text-muted-foreground my-6 rounded-r-lg shadow-sm" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-foreground relative inline-block after:content-[''] after:absolute after:w-full after:h-2 after:bg-primary/20 after:left-0 after:-bottom-1 after:-z-10" {...props} />,
                code: ({node, inline, className, children, ...props}: any) => 
                  inline ? (
                    <code className="bg-muted text-foreground px-1.5 py-0.5 rounded font-mono text-sm border border-border" {...props}>{children}</code>
                  ) : (
                    <pre className="bg-surface-hover border border-border p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono"><code {...props}>{children}</code></pre>
                  ),
                table: ({node, ...props}) => <div className="overflow-x-auto my-6 border border-border rounded-lg"><table className="w-full text-left border-collapse" {...props} /></div>,
                thead: ({node, ...props}) => <thead className="bg-muted text-foreground font-semibold" {...props} />,
                th: ({node, ...props}) => <th className="p-3 border-b border-border" {...props} />,
                td: ({node, ...props}) => <td className="p-3 border-b border-border" {...props} />,
              }}
            >
              {evaluation}
            </ReactMarkdown>
          </div>
        )}

        {!isEvaluating && error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-8 mb-12 shadow-sm">
            <h3 className="font-semibold mb-2">Evaluation Failed</h3>
            <p>{error}</p>
          </div>
        )}
        
        {Object.keys(dictionaryCache).length > 0 && (
          <div className="w-full bg-surface border border-border rounded-xl p-8 mb-12 text-left shadow-sm">
            <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-6 text-center">
              Dictionary History
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(dictionaryCache).map(([word, data], i) => (
                <div key={i} className="p-4 bg-background border border-border rounded-lg shadow-sm">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="font-serif font-bold text-lg text-foreground">{word}</span>
                    <span className="text-[10px] uppercase font-semibold text-primary/70 tracking-wider bg-primary/10 px-2 py-0.5 rounded">
                      {data.partOfSpeech}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{data.meaning}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {data.translations?.slice(0, 3).map((t: string, idx: number) => (
                      <span key={idx} className="bg-surface-hover text-foreground border border-border px-2 py-1 rounded text-xs">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center mt-auto pt-8 border-t border-border">
          <button
            onClick={onReset}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-8 py-4 rounded-md hover:bg-surface-hover font-medium border border-transparent hover:border-border"
          >
            <RotateCcw size={18} />
            Start New Translation
          </button>
        </div>
      </div>
    </div>
  );
}
