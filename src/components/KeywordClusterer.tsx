"use client";

import { useState, useCallback } from "react";
import { clusterKeywords } from "@/lib/clustering";

interface Cluster {
  id: number;
  keywords: string[];
  color: string;
}

const COLORS = [
  "bg-blue-100 border-blue-300",
  "bg-green-100 border-green-300",
  "bg-purple-100 border-purple-300",
  "bg-orange-100 border-orange-300",
  "bg-pink-100 border-pink-300",
  "bg-teal-100 border-teal-300",
  "bg-indigo-100 border-indigo-300",
  "bg-red-100 border-red-300",
];

export default function KeywordClusterer() {
  const [input, setInput] = useState("");
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCluster = useCallback(async () => {
    setError("");
    setLoading(true);

    try {
      const keywords = input
        .split(/[\n,]/)
        .map((k) => k.trim().toLowerCase())
        .filter((k) => k.length > 0);

      if (keywords.length === 0) {
        setError("Please enter some keywords");
        setLoading(false);
        return;
      }

      if (keywords.length > 100) {
        setError("Free version limited to 100 keywords. Upgrade to Pro for unlimited.");
        setLoading(false);
        return;
      }

      const grouped = clusterKeywords(keywords);
      
      const clustersWithColors: Cluster[] = grouped.map((keywords, index) => ({
        id: index + 1,
        keywords,
        color: COLORS[index % COLORS.length],
      }));

      setClusters(clustersWithColors);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [input]);

  const handleExport = useCallback(() => {
    if (clusters.length === 0) return;

    const csvContent = [
      ["Cluster", "Keyword"],
      ...clusters.flatMap((cluster) =>
        cluster.keywords.map((keyword) => [cluster.id.toString(), keyword])
      ),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Enter your keywords (one per line or comma-separated)
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="best seo tools&#10;seo software&#10;free seo tools&#10;..."
          className="w-full h-48 p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
        />
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-slate-500">
            {input.split(/[\n,]/).filter((k) => k.trim().length > 0).length} keywords
            {input.split(/[\n,]/).filter((k) => k.trim().length > 0).length > 100 && (
              <span className="text-red-500 ml-2">(100 max for free)</span>
            )}
          </div>
          <div className="space-x-3">
            <button
              onClick={handleClear}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleCluster}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? "Clustering..." : "Cluster Keywords"}
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      {clusters.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Results: {clusters.length} clusters found
            </h2>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
            >
              Export CSV
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {clusters.map((cluster) => (
              <div
                key={cluster.id}
                className={`${cluster.color} border rounded-lg p-4`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">
                    Cluster {cluster.id}
                  </h3>
                  <span className="text-xs bg-white/50 px-2 py-1 rounded">
                    {cluster.keywords.length} keywords
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cluster.keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="bg-white/70 px-2 py-1 rounded text-sm text-slate-700"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
