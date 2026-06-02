"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { clusterKeywords } from "@/lib/clustering";

interface KeywordRow {
  keyword: string;
  volume?: number;
  difficulty?: number;
}

interface Cluster {
  id: number;
  label: string;
  keywords: KeywordRow[];
}

const CLUSTER_COLORS = [
  {
    bg: "from-violet-500/20 to-violet-500/5",
    border: "border-violet-500/30",
    text: "text-violet-300",
    pill: "bg-violet-500/10 text-violet-200 border border-violet-500/20",
  },
  {
    bg: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/30",
    text: "text-emerald-300",
    pill: "bg-emerald-500/10 text-emerald-200 border border-emerald-500/20",
  },
  {
    bg: "from-sky-500/20 to-sky-500/5",
    border: "border-sky-500/30",
    text: "text-sky-300",
    pill: "bg-sky-500/10 text-sky-200 border border-sky-500/20",
  },
  {
    bg: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/30",
    text: "text-amber-300",
    pill: "bg-amber-500/10 text-amber-200 border border-amber-500/20",
  },
  {
    bg: "from-rose-500/20 to-rose-500/5",
    border: "border-rose-500/30",
    text: "text-rose-300",
    pill: "bg-rose-500/10 text-rose-200 border border-rose-500/20",
  },
  {
    bg: "from-teal-500/20 to-teal-500/5",
    border: "border-teal-500/30",
    text: "text-teal-300",
    pill: "bg-teal-500/10 text-teal-200 border border-teal-500/20",
  },
  {
    bg: "from-indigo-500/20 to-indigo-500/5",
    border: "border-indigo-500/30",
    text: "text-indigo-300",
    pill: "bg-indigo-500/10 text-indigo-200 border border-indigo-500/20",
  },
  {
    bg: "from-orange-500/20 to-orange-500/5",
    border: "border-orange-500/30",
    text: "text-orange-300",
    pill: "bg-orange-500/10 text-orange-200 border border-orange-500/20",
  },
  {
    bg: "from-cyan-500/20 to-cyan-500/5",
    border: "border-cyan-500/30",
    text: "text-cyan-300",
    pill: "bg-cyan-500/10 text-cyan-200 border border-cyan-500/20",
  },
  {
    bg: "from-fuchsia-500/20 to-fuchsia-500/5",
    border: "border-fuchsia-500/30",
    text: "text-fuchsia-300",
    pill: "bg-fuchsia-500/10 text-fuchsia-200 border border-fuchsia-500/20",
  },
];

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "he",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "that",
  "the",
  "to",
  "was",
  "will",
  "with",
  "how",
  "what",
  "when",
  "where",
  "who",
  "why",
  "best",
  "top",
  "vs",
  "versus",
  "or",
  "new",
  "old",
  "free",
  "online",
  "tool",
  "tools",
  "tips",
  "guide",
  "2024",
  "2025",
  "2026",
]);

function deriveLabel(rows: KeywordRow[]): string {
  const keywords = rows.map((r) => r.keyword);
  if (keywords.length === 1) {
    const words = keywords[0]
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
    if (words.length >= 2)
      return (words[0] + " " + words[1]).replace(/^\w/, (c) => c.toUpperCase());
    if (words.length === 1)
      return words[0].replace(/^\w/, (c) => c.toUpperCase());
    return keywords[0].replace(/^\w/, (c) => c.toUpperCase());
  }
  const bigramFreq: Record<string, number> = {};
  for (const kw of keywords) {
    const words = kw
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
    for (let i = 0; i < words.length - 1; i++) {
      const b = words[i] + " " + words[i + 1];
      bigramFreq[b] = (bigramFreq[b] || 0) + 1;
    }
  }
  const topBigram = Object.entries(bigramFreq).sort((a, b) => b[1] - a[1])[0];
  if (topBigram && topBigram[1] >= 2)
    return topBigram[0].replace(/^\w/, (c) => c.toUpperCase());
  const freq: Record<string, number> = {};
  for (const kw of keywords) {
    kw.toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
      .forEach((w) => {
        freq[w] = (freq[w] || 0) + 1;
      });
  }
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  if (top.length >= 2)
    return (top[0][0] + " " + top[1][0]).replace(/^\w/, (c) => c.toUpperCase());
  if (top.length === 1) return top[0][0].replace(/^\w/, (c) => c.toUpperCase());
  return "General";
}

function parseFileContent(text: string, fileName: string): KeywordRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (fileName.endsWith(".csv")) {
    const header = lines[0]?.toLowerCase() || "";
    const hasHeader = header.includes("keyword");
    const startIdx = hasHeader ? 1 : 0;
    const volIdx = header
      .split(",")
      .findIndex((h) => h.includes("volume") || h.includes("vol"));
    const diffIdx = header
      .split(",")
      .findIndex((h) => h.includes("difficult") || h.includes("kd"));
    return lines
      .slice(startIdx)
      .map((line) => {
        const cols = line.split(",").map((c) => c.replace(/^"|"$/g, "").trim());
        const keyword = cols[0];
        if (!keyword || keyword.toLowerCase() === "keyword") return null;
        return {
          keyword,
          volume:
            volIdx >= 0 && cols[volIdx]
              ? Number(cols[volIdx].replace(/[^0-9]/g, "")) || undefined
              : undefined,
          difficulty:
            diffIdx >= 0 && cols[diffIdx]
              ? Number(cols[diffIdx].replace(/[^0-9]/g, "")) || undefined
              : undefined,
        };
      })
      .filter((r): r is KeywordRow => r !== null && r.keyword.length > 0);
  }
  return lines
    .map((l) => ({ keyword: l.trim() }))
    .filter((r) => r.keyword.length > 0);
}

function parseTextInput(text: string): KeywordRow[] {
  return text
    .split(/[\n,]/)
    .map((k) => k.trim().toLowerCase())
    .filter((k) => k.length > 0)
    .map((k) => ({ keyword: k }));
}

const DEMO = `best seo tools 2024
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
site speed optimization`;

export default function KeywordClusterer() {
  const [input, setInput] = useState("");
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [threshold, setThreshold] = useState(0.2);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [mergeMode, setMergeMode] = useState(false);
  const [mergeSelected, setMergeSelected] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const kwCount = input
    .split(/[\n,]/)
    .filter((k) => k.trim().length > 0).length;

  const handleCluster = useCallback(() => {
    setError("");
    setLoading(true);
    setProcessingTime(null);
    setSearch("");
    setMergeMode(false);
    setMergeSelected(new Set());

    requestAnimationFrame(() => {
      const start = performance.now();
      try {
        const rows = parseTextInput(input);
        const unique = Array.from(
          new Map(rows.map((r) => [r.keyword, r])).values(),
        );

        if (unique.length === 0) {
          setError("Please enter some keywords.");
          setLoading(false);
          return;
        }
        if (unique.length < 2) {
          setError("Please enter at least 2 keywords.");
          setLoading(false);
          return;
        }

        const grouped = clusterKeywords(
          unique.map((r) => r.keyword),
          threshold,
        );
        const kwMap = new Map(unique.map((r) => [r.keyword, r]));

        const built: Cluster[] = grouped.map((kws, i) => {
          const kwRows = kws.map((k) => kwMap.get(k) || { keyword: k });
          return { id: i + 1, label: deriveLabel(kwRows), keywords: kwRows };
        });

        setClusters(built);
        setProcessingTime(Math.round(performance.now() - start));
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    });
  }, [input, threshold]);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseFileContent(text, file.name);
      if (rows.length === 0) {
        setError("No keywords found in file.");
        return;
      }
      setInput(rows.map((r) => r.keyword).join("\n"));
      setError("");
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleExportCSV = useCallback(() => {
    if (clusters.length === 0) return;
    const rows = [["Cluster", "Keyword", "Volume", "Difficulty"]];
    clusters.forEach((c) =>
      c.keywords.forEach((r) =>
        rows.push([
          c.label,
          r.keyword,
          r.volume != null ? String(r.volume) : "",
          r.difficulty != null ? String(r.difficulty) : "",
        ]),
      ),
    );
    const csv = rows
      .map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(
        new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }),
      ),
      download: "keyword-clusters.csv",
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [clusters]);

  const handleExportJSON = useCallback(() => {
    if (clusters.length === 0) return;
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(
        new Blob([JSON.stringify(clusters, null, 2)], {
          type: "application/json",
        }),
      ),
      download: "keyword-clusters.json",
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [clusters]);

  const handleRenameCommit = useCallback(
    (id: number) => {
      if (!editLabel.trim()) {
        setEditingId(null);
        return;
      }
      setClusters((prev) =>
        prev.map((c) => (c.id === id ? { ...c, label: editLabel.trim() } : c)),
      );
      setEditingId(null);
    },
    [editLabel],
  );

  const handleMerge = useCallback(() => {
    if (mergeSelected.size < 2) return;
    setClusters((prev) => {
      const toMerge = prev.filter((c) => mergeSelected.has(c.id));
      const rest = prev.filter((c) => !mergeSelected.has(c.id));
      const merged: Cluster = {
        id: toMerge[0].id,
        label: toMerge[0].label,
        keywords: toMerge.flatMap((c) => c.keywords),
      };
      return [merged, ...rest].map((c, i) => ({ ...c, id: i + 1 }));
    });
    setMergeMode(false);
    setMergeSelected(new Set());
  }, [mergeSelected]);

  const handleSplitSingles = useCallback(() => {
    // no-op: singles are already individual clusters; this re-clusters with tighter threshold
    setThreshold((t) => Math.min(0.5, t + 0.05));
    setTimeout(() => handleCluster(), 50);
  }, [handleCluster]);

  const filteredClusters = useMemo(() => {
    if (!search) return clusters;
    const q = search.toLowerCase();
    return clusters
      .map((c) => ({
        ...c,
        keywords: c.keywords.filter((r) => r.keyword.includes(q)),
      }))
      .filter(
        (c) => c.keywords.length > 0 || c.label.toLowerCase().includes(q),
      );
  }, [clusters, search]);

  const stats = useMemo(
    () => ({
      total: clusters.reduce((s, c) => s + c.keywords.length, 0),
      clusterCount: clusters.length,
      avgSize: clusters.length
        ? (
            clusters.reduce((s, c) => s + c.keywords.length, 0) /
            clusters.length
          ).toFixed(1)
        : "0",
      largest: clusters.length
        ? Math.max(...clusters.map((c) => c.keywords.length))
        : 0,
    }),
    [clusters],
  );

  return (
    <div className="max-w-5xl mx-auto">
      {/* Input card */}
      <div className="bg-zinc-900/80 backdrop-blur-sm rounded-2xl ring-1 ring-white/10 p-6 mb-6">
        <div
          className={`relative rounded-xl transition-all ${isDragging ? "ring-2 ring-violet-500 bg-violet-500/5" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              "Paste keywords here — one per line, or comma-separated.\nOr drag & drop a .csv / .txt file.\n\nCSV columns supported: keyword, volume, difficulty"
            }
            rows={8}
            className="w-full p-4 bg-zinc-800/60 ring-1 ring-zinc-700 rounded-xl text-zinc-200 placeholder:text-zinc-600 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none resize-none font-mono transition-all"
          />
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-violet-500/10 ring-2 ring-violet-500 pointer-events-none">
              <p className="text-violet-300 font-semibold">
                Drop file to import
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span>
              {kwCount} keyword{kwCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <label className="text-xs text-zinc-500 flex items-center gap-1.5">
              Threshold
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-20 accent-violet-500"
              />
              <span className="text-violet-400 font-mono w-8">
                {threshold.toFixed(2)}
              </span>
            </label>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-zinc-800 ring-1 ring-zinc-700 rounded-lg text-zinc-400 hover:text-zinc-200 text-sm transition-all"
            >
              Import file
            </button>
            <button
              onClick={() => {
                setInput(DEMO);
                setError("");
              }}
              className="px-3 py-2 bg-zinc-800 ring-1 ring-zinc-700 rounded-lg text-zinc-400 hover:text-zinc-200 text-sm transition-all"
            >
              Load demo
            </button>
            <button
              onClick={handleCluster}
              disabled={loading || kwCount < 2}
              className="px-5 py-2 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-lg hover:from-violet-500 hover:to-violet-400 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm transition-all shadow-lg shadow-violet-500/20 flex items-center gap-2"
            >
              {loading && (
                <svg
                  className="w-3.5 h-3.5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              {loading ? "Clustering..." : "Cluster Keywords"}
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-3 p-3 bg-red-500/10 ring-1 ring-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </div>

      {/* Results */}
      {clusters.length > 0 && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              {
                label: "Total Keywords",
                value: stats.total,
                color: "text-violet-400",
              },
              {
                label: "Clusters",
                value: stats.clusterCount,
                color: "text-emerald-400",
              },
              {
                label: "Avg Cluster Size",
                value: stats.avgSize,
                color: "text-sky-400",
              },
              {
                label: "Largest Cluster",
                value: stats.largest,
                color: "text-amber-400",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-zinc-900/80 ring-1 ring-white/10 rounded-xl p-4 text-center"
              >
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-zinc-500 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {processingTime !== null && (
            <p className="text-zinc-600 text-xs mb-4 text-center">
              Clustered in {processingTime}ms using TF-IDF cosine similarity
            </p>
          )}

          {/* Toolbar */}
          <div className="flex flex-wrap gap-3 mb-5 items-center">
            <input
              type="search"
              placeholder="Search clusters..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[180px] px-3 py-2 bg-zinc-900/80 ring-1 ring-zinc-700 rounded-lg text-zinc-200 placeholder:text-zinc-600 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
            />
            <button
              onClick={() => {
                setMergeMode((m) => !m);
                setMergeSelected(new Set());
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ring-1 ${mergeMode ? "bg-violet-600 text-white ring-violet-500" : "bg-zinc-900/80 text-zinc-400 ring-zinc-700 hover:text-zinc-200"}`}
            >
              {mergeMode ? "Cancel Merge" : "Merge Clusters"}
            </button>
            {mergeMode && mergeSelected.size >= 2 && (
              <button
                onClick={handleMerge}
                className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition-all"
              >
                Merge {mergeSelected.size} →
              </button>
            )}
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-zinc-900/80 ring-1 ring-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3 py-2 bg-zinc-900/80 ring-1 ring-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              JSON
            </button>
          </div>

          {/* Clusters */}
          <div className="space-y-4">
            {filteredClusters.map((cluster, ci) => {
              const style = CLUSTER_COLORS[ci % CLUSTER_COLORS.length];
              const isSelected = mergeSelected.has(cluster.id);
              const totalVol = cluster.keywords.reduce(
                (s, r) => s + (r.volume || 0),
                0,
              );
              const avgDiff = cluster.keywords.filter(
                (r) => r.difficulty != null,
              ).length
                ? Math.round(
                    cluster.keywords.reduce(
                      (s, r) => s + (r.difficulty || 0),
                      0,
                    ) /
                      cluster.keywords.filter((r) => r.difficulty != null)
                        .length,
                  )
                : null;

              return (
                <div
                  key={cluster.id}
                  className={`bg-gradient-to-br ${style.bg} rounded-2xl border ${style.border} p-5 transition-all ${mergeMode ? "cursor-pointer " + (isSelected ? "ring-2 ring-violet-400" : "hover:ring-1 hover:ring-violet-500/50") : ""}`}
                  onClick={() => {
                    if (!mergeMode) return;
                    setMergeSelected((prev) => {
                      const next = new Set(prev);
                      if (next.has(cluster.id)) next.delete(cluster.id);
                      else next.add(cluster.id);
                      return next;
                    });
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {mergeMode && (
                        <div
                          className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${isSelected ? "bg-violet-500 border-violet-500" : "border-zinc-500"}`}
                        >
                          {isSelected && (
                            <svg
                              className="w-2.5 h-2.5 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      )}
                      {editingId === cluster.id ? (
                        <input
                          autoFocus
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          onBlur={() => handleRenameCommit(cluster.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              handleRenameCommit(cluster.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          className="bg-zinc-800 text-zinc-100 text-sm font-semibold px-2 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-violet-500 min-w-0"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <h3
                          className={`font-semibold text-sm truncate ${style.text}`}
                        >
                          {cluster.label}
                        </h3>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(cluster.id);
                          setEditLabel(cluster.label);
                        }}
                        className="text-zinc-600 hover:text-zinc-400 transition-colors flex-shrink-0"
                        title="Rename cluster"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 text-xs text-zinc-500">
                      {totalVol > 0 && (
                        <span title="Total search volume">
                          📊 {totalVol.toLocaleString()} vol
                        </span>
                      )}
                      {avgDiff != null && (
                        <span title="Avg keyword difficulty">
                          🎯 {avgDiff} KD
                        </span>
                      )}
                      <span
                        className={`font-semibold px-2 py-0.5 rounded-full ${style.pill}`}
                      >
                        {cluster.keywords.length} kw
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cluster.keywords.map((row) => (
                      <span
                        key={row.keyword}
                        className={`text-xs px-2.5 py-1 rounded-full ${style.pill} flex items-center gap-1`}
                      >
                        {row.keyword}
                        {row.volume != null && (
                          <span className="text-zinc-500 text-[10px]">
                            · {row.volume.toLocaleString()}
                          </span>
                        )}
                        {row.difficulty != null && (
                          <span className="text-zinc-500 text-[10px]">
                            · {row.difficulty}kd
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Empty state */}
      {clusters.length === 0 && !loading && (
        <div className="bg-zinc-900/50 rounded-2xl ring-1 ring-white/5 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-500/10 ring-1 ring-violet-500/20 rounded-2xl mb-4">
            <svg
              className="w-8 h-8 text-violet-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-zinc-50 mb-1">
            Ready to cluster
          </h3>
          <p className="text-zinc-500 text-sm max-w-sm mx-auto">
            Paste keywords above or load the demo, then click Cluster Keywords.
          </p>
          <button
            onClick={() => {
              setInput(DEMO);
              setError("");
            }}
            className="mt-4 px-4 py-2 bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20 rounded-lg text-sm hover:bg-violet-500/20 transition-all"
          >
            Load demo keywords →
          </button>
        </div>
      )}
    </div>
  );
}
