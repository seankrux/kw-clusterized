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
  { bg: "bg-blue-50 border-blue-200", text: "text-blue-800", badge: "bg-blue-100 text-blue-700" },
  { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800", badge: "bg-emerald-100 text-emerald-700" },
  { bg: "bg-violet-50 border-violet-200", text: "text-violet-800", badge: "bg-violet-100 text-violet-700" },
  { bg: "bg-amber-50 border-amber-200", text: "text-amber-800", badge: "bg-amber-100 text-amber-700" },
  { bg: "bg-rose-50 border-rose-200", text: "text-rose-800", badge: "bg-rose-100 text-rose-700" },
  { bg: "bg-teal-50 border-teal-200", text: "text-teal-800", badge: "bg-teal-100 text-teal-700" },
  { bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-800", badge: "bg-indigo-100 text-indigo-700" },
  { bg: "bg-orange-50 border-orange-200", text: "text-orange-800", badge: "bg-orange-100 text-orange-700" },
  { bg: "bg-cyan-50 border-cyan-200", text: "text-cyan-800", badge: "bg-cyan-100 text-cyan-700" },
  { bg: "bg-fuchsia-50 border-fuchsia-200", text: "text-fuchsia-800", badge: "bg-fuchsia-100 text-fuchsia-700" },
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

export default function KeywordClusterer() {
  const [input, setInput] = useState("");
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const keywordCount = input.split(/[\n,]/).filter((k) => k.trim().length > 0).length;

  const handleCluster = useCallback(() => {
    setError("");
    setLoading(true);

    // Use requestAnimationFrame to let the loading state render before blocking
    requestAnimationFrame(() => {
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

      if (file.name.endsWith(".csv")) {
        // Parse CSV: take the first column of each row
        const lines = text.split(/\r?\n/).filter((l) => l.trim());
        const keywords = lines.map((line) => {
          // Handle quoted CSV fields
          const match = line.match(/^"([^"]*)"/) || line.match(/^([^,]*)/);
          return match ? match[1].trim() : line.trim();
        }).filter((k) => k.length > 0 && k.toLowerCase() !== "keyword" && k.toLowerCase() !== "keywords");
        setInput(keywords.join("\n"));
      } else {
        // Plain text: one keyword per line
        setInput(text.trim());
      }
    };
    reader.readAsText(file);

    // Reset file input so the same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
  }, []);

  const handleLoadDemo = useCallback(() => {
    setInput(DEMO_KEYWORDS.trim());
    setClusters([]);
    setError("");
  }, []);

  const totalKeywordsInClusters = clusters.reduce((sum, c) => sum + c.keywords.length, 0);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 md:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <label className="block text-sm font-semibold text-slate-700">
            Enter your keywords
            <span className="font-normal text-slate-400 ml-1">(one per line or comma-separated)</span>
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLoadDemo}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Load demo keywords
            </button>
            <label className="text-xs text-slate-500 hover:text-slate-700 font-medium cursor-pointer transition-colors flex items-center gap-1">
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

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={"best seo tools\nseo software\nfree seo tools\nkeyword research tool\nkeyword planner free\ncontent marketing strategy\n..."}
          className="w-full h-48 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm text-slate-800 placeholder:text-slate-300 transition-shadow"
        />

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-slate-500">
            <span className={keywordCount > 0 ? "text-slate-700 font-medium" : ""}>
              {keywordCount}
            </span>{" "}
            keyword{keywordCount !== 1 ? "s" : ""}
          </div>
          <div className="flex items-center gap-3">
            {input.length > 0 && (
              <button
                onClick={handleClear}
                className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleCluster}
              disabled={loading || keywordCount < 2}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium text-sm shadow-sm hover:shadow-md"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      {clusters.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {clusters.length} Cluster{clusters.length !== 1 ? "s" : ""} Found
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {totalKeywordsInClusters} keyword{totalKeywordsInClusters !== 1 ? "s" : ""} organized into topic groups
              </p>
            </div>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
          </div>

          {/* Cluster summary bar */}
          <div className="flex gap-1 h-2 rounded-full overflow-hidden mb-8">
            {clusters.map((cluster) => {
              const style = CLUSTER_STYLES[(cluster.id - 1) % CLUSTER_STYLES.length];
              const widthPercent = (cluster.keywords.length / totalKeywordsInClusters) * 100;
              return (
                <div
                  key={cluster.id}
                  className={`${style.bg.split(" ")[0]} transition-all`}
                  style={{ width: `${widthPercent}%` }}
                  title={`${cluster.label}: ${cluster.keywords.length} keywords`}
                />
              );
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {clusters.map((cluster) => {
              const style = CLUSTER_STYLES[(cluster.id - 1) % CLUSTER_STYLES.length];
              return (
                <div
                  key={cluster.id}
                  className={`${cluster.color} border rounded-xl p-5 transition-shadow hover:shadow-md`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-bold ${cluster.textColor}`}>
                      {cluster.label}
                    </h3>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${style.badge}`}>
                      {cluster.keywords.length} keyword{cluster.keywords.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cluster.keywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-md text-sm text-slate-700 border border-white/50"
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
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-slate-500 text-sm">
            Enter keywords above and click <span className="font-medium text-slate-700">Cluster Keywords</span> to get started
          </p>
          <p className="text-slate-400 text-xs mt-2">
            Or try the <button onClick={handleLoadDemo} className="text-blue-500 hover:text-blue-700 underline underline-offset-2">demo keywords</button> to see it in action
          </p>
        </div>
      )}
    </div>
  );
}
