import { Metadata } from "next";
import KeywordClusterer from "@/components/KeywordClusterer";

export const metadata: Metadata = {
  title: "Keyword Clustering Tool - Group Keywords into Topic Clusters",
  description:
    "Automatically group your keywords into topic clusters using semantic similarity. Free, private, and runs entirely in your browser. Perfect for SEO content planning.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium mb-6 border border-blue-100">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            100% client-side &middot; No data sent to any server
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-5 tracking-tight">
            Keyword
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              {" "}Clustering{" "}
            </span>
            Tool
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-3 text-balance">
            Group your keywords into topic clusters automatically using semantic similarity
          </p>
          <p className="text-slate-400 text-sm">
            Perfect for SEO content planning and avoiding keyword cannibalization
          </p>
        </div>

        {/* Tool */}
        <KeywordClusterer />

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-20">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-1.5">Smart Clustering</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Groups keywords by semantic similarity using Jaccard analysis, not just exact string matches.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-1.5">CSV Import &amp; Export</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Upload keywords via CSV or TXT files and download organized clusters as a spreadsheet.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-11 h-11 bg-violet-50 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-1.5">Privacy First</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              All processing happens locally in your browser. Your keyword data never leaves your device.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-20 pb-8">
          <p className="text-slate-400 text-sm">
            Made with{" "}
            <span role="img" aria-label="yellow heart">
              &#x1F49B;
            </span>{" "}
            by Sean G
          </p>
        </footer>
      </div>
    </main>
  );
}
