"use client";

import { useState, useCallback, useRef } from "react";
import { clusterKeywords } from "@/lib/clustering";

interface Cluster {
  id: number;
  label: string;
  keywords: string[];
  color: string;
  textColor: string;
}

const CLUSTER_STYLES = [
  { bg: "from-violet-500/20 to-violet-500/5", border: "border-violet-500/30", text: "text-violet-300", badge: "bg-violet-500/20 text-violet-300 border-violet-500/30", pill: "bg-violet-500/10 text-violet-200 border-violet-500/20" },
  { bg: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-500/30", text: "text-emerald-300", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", pill: "bg-emerald-500/10 text-emerald-200 border-emerald-500/20" },
  { bg: "from-sky-500/20 to-sky-500/5", border: "border-sky-500/30", text: "text-sky-300", badge: "bg-sky-500/20 text-sky-300 border-sky-500/30", pill: "bg-sky-500/10 text-sky-200 border-sky-500/20" },
  { bg: "from-amber-500/20 to-amber-500/5", border: "border-amber-500/30", text: "text-amber-300", badge: "bg-amber-500/20 text-amber-300 border-amber-500/30", pill: "bg-amber-500/10 text-amber-200 border-amber-500/20" },
  { bg: "from-rose-500/20 to-rose-500/5", border: "border-rose-500/30", text: "text-rose-300", badge: "bg-rose-500/20 text-rose-300 border-rose-500/30", pill: "bg-rose-500/10 text-rose-200 border-rose-500/20" },
  { bg: "from-teal-500/20 to-teal-500/5", border: "border-teal-500/30", text: "text-teal-300", badge: "bg-teal-500/20 text-teal-300 border-teal-500/30", pill: "bg-teal-500/10 text-teal-200 border-teal-500/20" },
  { bg: "from-indigo-500/20 to-indigo-500/5", border: "border-indigo-500/30", text: "text-indigo-300", badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30", pill: "bg-indigo-500/10 text-indigo-200 border-indigo-500/20" },
  { bg: "from-orange-500/20 to-orange-500/5", border: "border-orange-500/30", text: "text-orange-300", badge: "bg-orange-500/20 text-orange-300 border-orange-500/30", pill: "bg-orange-500/10 text-orange-200 border-orange-500/20" },
  { bg: "from-cyan-500/20 to-cyan-500/5", border: "border-cyan-500/30", text: "text-cyan-300", badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30", pill: "bg-cyan-500/10 text-cyan-200 border-cyan-500/20" },
  { bg: "from-fuchsia-500/20 to-fuchsia-500/5", border: "border-fuchsia-500/30", text: "text-fuchsia-300", badge: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30", pill: "bg-fuchsia-500/10 text-fuchsia-200 border-fuchsia-500/20" },
];

const DEMO_KEYWORDS = `best seo tools 2024
seo software for small business
free seo tools online
keyword research tool
keyword planner free
long tail keyword generator
content marketing strategy
content creation tips
content calendar template
link building services
backlink checker tool
how to get backlinks
on page seo checklist
on page optimization guide
meta description best practices
local seo optimization
google my business tips
local search ranking factors
technical seo audit
site speed optimization
mobile friendly website test
seo audit tool free
website analysis tool
competitor analysis seo`;

/**
 * Derive a human-readable cluster label from the keywords in a cluster.
 * Picks the most frequently occurring significant word across all keywords.
 */
function deriveClusterLabel(keywords: string[]): string {
  const stopWords = new Set([
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from",
    "has", "he", "in", "is", "it", "its", "of", "on", "that", "the",
    "to", "was", "will", "with", "how", "what", "when", "where", "who",
    "why", "best", "top", "vs", "versus", "or", "new", "old", "free",
    "online", "tool", "tools", "tips", "guide", "2024", "2025", "2026",
  ]);

  const freq: Record<string, number> = {};
  for (const kw of keywords) {
    const words = kw.toLowerCase().split(/\s+/).filter((w) => w.length > 2 && !stopWords.has(w));
    for (const w of words) {
      freq[w] = (freq[w] || 0) + 1;
    }
  }

  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  if (sorted.length >= 2) {
    return (sorted[0][0] + " " + sorted[1][0]).replace(/^\w/, (c) => c.toUpperCase());
  }
  if (sorted.length === 1) {
    return sorted[0][0].replace(/^\w/, (c) => c.toUpperCase());
  }
  return "General";
}

/**
 * Parse a file's text content into newline-separated keywords.
 * Supports CSV (first column) and plain text (one keyword per line).
 */
function parseFileContent(text: string, fileName: string): string {
  if (fileName.endsWith(".csv")) {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    const keywords = lines
      .map((line) => {
        const match = line.match(/^"([^"]*)"/) || line.match(/^([^,]*)/);
        return match ? match[1].trim() : line.trim();
      })
      .filter(
        (k) =>
          k.length > 0 &&
          k.toLowerCase() !== "keyword" &&
          k.toLowerCase() !== "keywords"
      );
    return keywords.join("\n");
  }
  return text.trim();
}

export default function KeywordClusterer() {
  const [input, setInput] = useState("");
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const keywordCount = input.split(/[\n,]/).filter((k) => k.trim().length > 0).length;

  const handleCluster = useCallback(() => {
    setError("");
    setLoading(true);
    setProcessingTime(null);

    // Use requestAnimationFrame to let the loading state render before blocking
    requestAnimationFrame(() => {
      const startTime = performance.now();
      try {
        const keywords = input
          .split(/[\n,]/)
          .map((k) => k.trim().toLowerCase())
          .filter((k) => k.length > 0);

        // Deduplicate
        const unique = Array.from(new Set(keywords));

        if (unique.length === 0) {
          setError("Please enter some keywords to cluster.");
          setLoading(false);
          return;
        }

        if (unique.length < 2) {
          setError("Please enter at least 2 keywords to form clusters.");
          setLoading(false);
          return;
        }

        const grouped = clusterKeywords(unique);

        const clustersWithMeta: Cluster[] = grouped.map((kws, index) => {
          const style = CLUSTER_STYLES[index % CLUSTER_STYLES.length];
          return {
            id: index + 1,
            label: deriveClusterLabel(kws),
            keywords: kws,
            color: style.bg,
            textColor: style.text,
          };
        });

        setClusters(clustersWithMeta);
        setProcessingTime(Math.round(performance.now() - startTime));
      } catch {
        setError("Something went wrong during clustering. Please try again.");
      } finally {
        setLoading(false);
      }
    });
  }, [input]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      setInput(parseFileContent(text, file.name));
    };
    reader.readAsText(file);

    // Reset file input so the same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      setInput(parseFileContent(text, file.name));
    };
    reader.readAsText(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleExport = useCallback(() => {
    if (clusters.length === 0) return;

    const csvRows = [
      ["Cluster ID", "Cluster Label", "Keyword"],
      ...clusters.flatMap((cluster) =>
        cluster.keywords.map((keyword) => [
          cluster.id.toString(),
          `"${cluster.label}"`,
          `"${keyword}"`,
        ])
      ),
    ];

    const csvContent = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "keyword-clusters.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [clusters]);

  const handleClear = useCallback(() => {
    setInput("");
    setClusters([]);
    setError("");
    setProcessingTime(null);
  }, []);

  const handleLoadDemo = useCallback(() => {
    setInput(DEMO_KEYWORDS.trim());
    setClusters([]);
    setError("");
    setProcessingTime(null);
  }, []);

  const totalKeywordsInClusters = clusters.reduce((sum, c) => sum + c.keywords.length, 0);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Input Section */}
      <div className="glass rounded-2xl p-6 md:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <label className="block text-sm font-semibold text-zinc-200">
            Enter your keywords
            <span className="font-normal text-zinc-500 ml-1">(one per line or comma-separated)</span>
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLoadDemo}
              className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              Load demo keywords
            </button>
            <label className="text-xs text-zinc-500 hover:text-zinc-300 font-medium cursor-pointer transition-colors flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload CSV / TXT
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.tsv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Textarea with drop zone */}
        <div
          className={`relative rounded-xl transition-all duration-200 ${
            isDragging
              ? "ring-2 ring-violet-500/50 bg-violet-500/5"
              : ""
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"best seo tools\nseo software\nfree seo tools\nkeyword research tool\nkeyword planner free\ncontent marketing strategy\n..."}
            className="w-full h-48 p-4 bg-zinc-900/80 border border-zinc-700/50 rounded-xl focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 focus-glow resize-none font-mono text-sm text-zinc-200 placeholder:text-zinc-600 transition-all outline-none"
          />
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center bg-violet-500/10 rounded-xl border-2 border-dashed border-violet-500/40">
              <div className="text-violet-300 font-medium text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Drop your file here
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-zinc-500">
            <span className={keywordCount > 0 ? "text-zinc-300 font-medium" : ""}>
              {keywordCount}
            </span>{" "}
            keyword{keywordCount !== 1 ? "s" : ""}
            {input.length > 0 && (
              <span className="text-zinc-600 ml-2">
                &middot; {input.length.toLocaleString()} chars
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {input.length > 0 && (
              <button
                onClick={handleClear}
                className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleCluster}
              disabled={loading || keywordCount < 2}
              className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-lg hover:from-violet-500 hover:to-violet-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium text-sm shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin-slow h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Clustering...
                </span>
              ) : (
                "Cluster Keywords"
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="glass rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-6 w-40 rounded-lg animate-shimmer" />
            <div className="h-6 w-24 rounded-lg animate-shimmer" />
          </div>
          <div className="h-2 rounded-full animate-shimmer mb-8" />
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-zinc-800 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-5 w-32 rounded-lg animate-shimmer" />
                  <div className="h-6 w-20 rounded-full animate-shimmer" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-7 rounded-md animate-shimmer" style={{ width: `${60 + j * 20}px` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Section */}
      {clusters.length > 0 && !loading && (
        <div className="glass rounded-2xl p-6 md:p-8 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-zinc-100">
                {clusters.length} Cluster{clusters.length !== 1 ? "s" : ""} Found
              </h2>
              <p className="text-sm text-zinc-500 mt-1">
                {totalKeywordsInClusters} keyword{totalKeywordsInClusters !== 1 ? "s" : ""} organized into topic groups
                {processingTime !== null && (
                  <span className="text-zinc-600 ml-1">&middot; {processingTime}ms</span>
                )}
              </p>
            </div>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-200 rounded-lg hover:bg-zinc-700 border border-zinc-700 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-6 mb-6 px-4 py-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-400" />
              <span className="text-xs text-zinc-400">
                <span className="text-zinc-200 font-semibold">{totalKeywordsInClusters}</span> keywords
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-zinc-400">
                <span className="text-zinc-200 font-semibold">{clusters.length}</span> clusters
              </span>
            </div>
            {processingTime !== null && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-xs text-zinc-400">
                  <span className="text-zinc-200 font-semibold">{processingTime}</span>ms
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-sky-400" />
              <span className="text-xs text-zinc-400">
                avg <span className="text-zinc-200 font-semibold">{Math.round(totalKeywordsInClusters / clusters.length)}</span> per cluster
              </span>
            </div>
          </div>

          {/* Cluster summary bar */}
          <div className="flex gap-1 h-2 rounded-full overflow-hidden mb-8">
            {clusters.map((cluster) => {
              const style = CLUSTER_STYLES[(cluster.id - 1) % CLUSTER_STYLES.length];
              const widthPercent = (cluster.keywords.length / totalKeywordsInClusters) * 100;
              return (
                <div
                  key={cluster.id}
                  className={`bg-gradient-to-r ${style.bg} transition-all rounded-full`}
                  style={{ width: `${widthPercent}%` }}
                  title={`${cluster.label}: ${cluster.keywords.length} keywords`}
                />
              );
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {clusters.map((cluster, index) => {
              const style = CLUSTER_STYLES[(cluster.id - 1) % CLUSTER_STYLES.length];
              return (
                <div
                  key={cluster.id}
                  className={`bg-gradient-to-br ${cluster.color} border ${style.border} rounded-xl p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-black/20 animate-fade-in-up`}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-bold ${cluster.textColor}`}>
                      {cluster.label}
                    </h3>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${style.badge}`}>
                      {cluster.keywords.length} keyword{cluster.keywords.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cluster.keywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className={`px-2.5 py-1 rounded-md text-sm border backdrop-blur-sm transition-colors hover:bg-white/5 ${style.pill}`}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {clusters.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-zinc-500 text-sm">
            Enter keywords above and click <span className="font-medium text-zinc-300">Cluster Keywords</span> to get started
          </p>
          <p className="text-zinc-600 text-xs mt-2">
            Or try the <button onClick={handleLoadDemo} className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors">demo keywords</button> to see it in action
          </p>
        </div>
      )}
    </div>
  );
}
