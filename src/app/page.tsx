import { Metadata } from "next";
import KeywordClusterer from "@/components/KeywordClusterer";

export const metadata: Metadata = {
  title: "Keyword Clustering Tool - Group Keywords into Topic Clusters",
  description: "Automatically group your keywords into topic clusters using semantic similarity. Free for up to 100 keywords. Perfect for SEO content planning.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Keyword Clustering Tool
          </h1>
          <p className="text-xl text-slate-600 mb-4">
            Group your keywords into topic clusters automatically using semantic similarity
          </p>
          <p className="text-slate-500">
            Perfect for SEO content planning and avoiding keyword cannibalization
          </p>
        </div>

        {/* Tool */}
        <KeywordClusterer />

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Smart Clustering</h3>
            <p className="text-slate-600 text-sm">Groups keywords by semantic similarity, not just exact matches</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Export Results</h3>
            <p className="text-slate-600 text-sm">Download your clusters as CSV for easy integration</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Privacy First</h3>
            <p className="text-slate-600 text-sm">All processing happens in your browser. Your data never leaves your device</p>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 pb-8 text-slate-500 text-sm">
          Made with 💛 by Sean G
        </footer>
      </div>
    </main>
  );
}
