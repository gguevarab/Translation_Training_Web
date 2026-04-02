"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Clock, ChevronDown, ChevronUp, ArrowLeft, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import Link from "next/link";

export default function HistoryPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/history");
        if (res.ok) {
          const data = await res.json();
          setSessions(data);
        }
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this translation?")) return;
    
    try {
      const res = await fetch(`/api/history/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert("Failed to delete translation.");
      }
    } catch (err) {
      console.error("Failed to delete", err);
      alert("An error occurred while deleting.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-primary/20 rounded-full mb-4"></div>
          <p className="text-muted-foreground font-medium">Loading History...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif text-primary font-medium tracking-tight mb-2">
              Translation History
            </h1>
            <p className="text-muted-foreground">
              Review your past translations and AI feedback.
            </p>
          </div>
          <Link href="/">
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-surface-hover transition-colors text-sm font-medium">
              <ArrowLeft size={16} />
              Back to Training
            </button>
          </Link>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-20 bg-surface border border-border rounded-xl shadow-sm">
            <h3 className="text-xl font-medium mb-2">No history yet</h3>
            <p className="text-muted-foreground">Your saved translations will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div 
                key={session.id} 
                className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden transition-all duration-200"
              >
                <div 
                  className="p-6 flex items-center justify-between cursor-pointer hover:bg-surface-hover/50"
                  onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
                >
                  <div className="flex flex-col gap-1 w-full max-w-[80%]">
                    <h3 className="font-medium truncate" title={session.sourceText}>
                      {session.sourceText}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {format(new Date(session.createdAt), "MMM d, yyyy • h:mm a")}
                      </span>
                      {session.sourceLanguage && session.targetLanguage && (
                        <span className="bg-secondary/20 text-secondary-foreground border border-secondary/30 px-2 py-0.5 rounded font-medium">
                          {session.sourceLanguage} → {session.targetLanguage}
                        </span>
                      )}
                      {session.languageProficiency && session.languageProficiency !== "unknown" && (
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded capitalize font-medium flex items-center">
                          Level: {session.languageProficiency}
                        </span>
                      )}
                      {session.timeSpentSeconds !== null && session.timeSpentSeconds !== undefined && (
                        <span className="border border-border px-2 py-0.5 rounded font-medium">
                          {Math.floor(session.timeSpentSeconds / 60)}m {session.timeSpentSeconds % 60}s
                        </span>
                      )}
                      <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded capitalize font-medium">
                        {session.translationType.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <button 
                      onClick={(e) => handleDelete(e, session.id)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-2 rounded-full transition-colors"
                      title="Delete Translation"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="text-muted-foreground">
                      {expandedId === session.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {expandedId === session.id && (
                  <div className="p-6 pt-0 border-t border-border bg-surface/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="space-y-2">
                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Original Text</h4>
                        <div className="bg-background border border-border p-4 rounded-lg text-sm whitespace-pre-wrap">
                          {session.sourceText}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Your Translation</h4>
                        <div className="bg-background border border-primary/20 p-4 rounded-lg text-sm whitespace-pre-wrap">
                          {session.translatedText}
                        </div>
                      </div>
                    </div>

                    {session.aiInsights?.text && (
                      <div className="mt-8">
                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-4">AI Analysis</h4>
                        <div className="bg-background border border-border p-6 rounded-lg markdown-body relative">
                          <ReactMarkdown 
                            rehypePlugins={[rehypeRaw]} 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h2: ({node, ...props}) => <h2 className="text-xl font-serif font-bold text-primary mt-6 mb-3 border-b border-border pb-2" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-lg font-serif font-medium text-foreground mt-4 mb-2" {...props} />,
                              p: ({node, ...props}) => <p className="text-sm text-foreground/90 leading-relaxed mb-3" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1 text-sm text-foreground/90" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1 text-sm text-foreground/90" {...props} />,
                              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary bg-primary/5 pl-4 py-2 italic text-muted-foreground my-4 rounded-r-lg" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-bold text-foreground" {...props} />,
                              code: ({node, inline, className, children, ...props}: any) => 
                                inline ? (
                                  <code className="bg-muted text-foreground px-1 py-0.5 rounded font-mono text-xs border border-border" {...props}>{children}</code>
                                ) : (
                                  <pre className="bg-surface-hover border border-border p-3 rounded-lg overflow-x-auto my-3 text-xs font-mono"><code {...props}>{children}</code></pre>
                                ),
                            }}
                          >
                            {session.aiInsights.text}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                    
                    {session.selectedWords && Object.keys(session.selectedWords).length > 0 && (
                      <div className="mt-8">
                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-4">Reviewed Dictionary Words</h4>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(session.selectedWords).map(([word, data]: [string, any], i) => (
                            <div key={i} className="bg-background border border-border px-3 py-2 rounded-md shadow-sm flex items-center gap-2">
                               <span className="font-semibold text-sm">{word}</span>
                               <span className="text-[10px] text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded">{data.partOfSpeech}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
