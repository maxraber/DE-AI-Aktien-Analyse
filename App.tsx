import React, { useState } from 'react';
import { analyzeStock } from './services/geminiService';
import { AnalysisResult } from './types';
import { ScoreCard } from './components/ScoreCard';
import { Search, Loader2, TrendingUp, DollarSign, Trophy, ArrowRight, BarChart3 } from 'lucide-react';

// Static configuration for Top Picks (simulated high-performers)
const TOP_PICKS = [
  {
    name: "Rheinmetall",
    ticker: "RHM",
    scorePreview: 46,
    trend: "+12.4%",
    reason: "Starker Auftragsbestand & Sektor-Boom"
  },
  {
    name: "SAP SE",
    ticker: "SAP",
    scorePreview: 44,
    trend: "+5.8%",
    reason: "Cloud-Wachstum übertrifft Erwartungen"
  },
  {
    name: "Münchener Rück",
    ticker: "MUV2",
    scorePreview: 42,
    trend: "+3.2%",
    reason: "Solide Dividende & KGV Bewertung"
  }
];

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refactored analysis logic to be reusable
  const performAnalysis = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    // Update input field to reflect selection if clicked from cards
    setQuery(searchTerm);

    try {
      const data = await analyzeStock(searchTerm);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performAnalysis(query);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200 font-inter">
      {/* Navbar / Header */}
      <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 text-emerald-500 cursor-pointer" 
            onClick={() => { setResult(null); setQuery(''); }}
          >
            <div className="bg-emerald-500/10 p-2 rounded-lg">
                <DollarSign size={20} />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">DE-FinanzAnalyst <span className="text-emerald-500 font-light">AI</span></span>
          </div>
          <div className="hidden sm:block text-xs text-slate-500 font-mono">
            POWERED BY GEMINI 2.5
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-4 md:px-6 pb-20 max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
        
        {/* Search & Hero Section */}
        <div className={`transition-all duration-700 ease-in-out flex flex-col items-center ${result || loading ? 'mb-10' : 'min-h-[70vh] justify-center'}`}>
          
          {!result && !loading && !error && (
            <div className="text-center mb-10 space-y-6 max-w-3xl animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-xs font-medium text-emerald-400 mb-2">
                <BarChart3 size={12} />
                <span>DAX / MDAX / TecDAX Analyse</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
                Smarte Aktienanalyse <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
                  in Sekunden.
                </span>
              </h1>
              <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                KI-gestützte Bewertung nach dem 50-Punkte Scoreboard System. <br className="hidden md:block"/>
                Fundamentaldaten, Trends und Risikoeinschätzung auf einen Blick.
              </p>
            </div>
          )}

          <form onSubmit={handleSearch} className={`w-full max-w-lg relative group z-20 ${result ? '' : 'scale-105 mb-12'}`}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className={`h-5 w-5 transition-colors ${loading ? 'text-emerald-500' : 'text-slate-500 group-focus-within:text-emerald-500'}`} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Unternehmen suchen (z.B. Siemens)..."
              className="block w-full pl-11 pr-4 py-4 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-xl hover:border-slate-600"
              disabled={loading}
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
              </button>
            </div>
          </form>

          {/* Top Picks Section - Only visible on start screen */}
          {!result && !loading && (
             <div className="w-full max-w-4xl animate-fade-in delay-100">
                <div className="flex items-center gap-2 mb-6 text-slate-300">
                  <Trophy size={18} className="text-yellow-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Top Picks des Monats</h3>
                  <div className="h-px bg-slate-800 flex-grow ml-4"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {TOP_PICKS.map((pick) => (
                    <button
                      key={pick.ticker}
                      onClick={() => performAnalysis(pick.name)}
                      className="group relative bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden"
                    >
                      {/* Gradient Hover Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="flex justify-between items-start mb-3 relative z-10">
                        <div>
                          <h4 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">{pick.name}</h4>
                          <span className="text-xs font-mono text-slate-500">{pick.ticker}</span>
                        </div>
                        <div className="flex flex-col items-end">
                           <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded text-emerald-400 border border-emerald-500/20">
                             <TrendingUp size={12} />
                             <span className="text-xs font-bold">{pick.scorePreview}/50</span>
                           </div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-slate-400 mb-4 line-clamp-2 relative z-10 h-8">
                        {pick.reason}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-800 relative z-10">
                        <span className="text-xs text-emerald-500 font-medium">{pick.trend} 30T</span>
                        <span className="text-xs text-slate-500 group-hover:text-slate-300 flex items-center gap-1 transition-colors">
                          Analysieren <ArrowRight size={10} />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-center text-xs text-slate-600 mt-8 italic">
                  *Scores sind indikativ basierend auf Vortagesdaten. Klicke für Live-Analyse.
                </p>
             </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="w-full max-w-lg mx-auto p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-center animate-fade-in mb-8">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Loading State - Skeleton */}
        {loading && (
          <div className="w-full max-w-5xl mx-auto space-y-6 animate-pulse mt-8">
             <div className="bg-slate-800/50 h-32 rounded-2xl w-full border border-slate-700/50"></div>
             <div className="bg-slate-800/50 h-16 rounded-b-xl mx-8 -mt-8 mb-6 border-x border-b border-slate-700/50"></div>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-slate-800/50 h-[350px] rounded-2xl border border-slate-700/50"></div>
                <div className="space-y-6 lg:col-span-2">
                    <div className="bg-slate-800/50 h-[150px] rounded-2xl border border-slate-700/50"></div>
                    <div className="bg-slate-800/50 h-[180px] rounded-2xl border border-slate-700/50"></div>
                </div>
             </div>
             <div className="bg-slate-800/50 h-40 rounded-2xl w-full border border-slate-700/50"></div>
             <div className="flex justify-center text-emerald-500 text-sm font-mono mt-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Analysiere Live-Marktdaten...
             </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && <ScoreCard data={result} />}

      </main>
    </div>
  );
};

export default App;