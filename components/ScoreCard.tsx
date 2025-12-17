import React from 'react';
import { AnalysisResult } from '../types';
import { AnalysisChart } from './AnalysisChart';
import { TrendingUp, TrendingDown, Minus, ExternalLink, ShieldAlert, AlertTriangle, Table, Newspaper, Calendar, Activity, Scale, Gem, BarChart2 } from 'lucide-react';

interface ScoreCardProps {
  data: AnalysisResult;
}

const FactCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/50">
    <div className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">{label}</div>
    <div className="text-slate-100 font-semibold truncate" title={value}>{value}</div>
  </div>
);

export const ScoreCard: React.FC<ScoreCardProps> = ({ data }) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-emerald-500";
    if (score >= 5) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getRecColor = (type: string) => {
     switch(type) {
         case 'KAUFEN': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
         case 'VERKAUFEN': return 'text-red-400 bg-red-500/10 border-red-500/30';
         default: return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
     }
  };
  
  const getRiskColor = (level: string) => {
      switch(level) {
          case 'Hoch': return 'text-red-400 border-red-500/30';
          case 'Mittel': return 'text-yellow-400 border-yellow-500/30';
          default: return 'text-emerald-400 border-emerald-500/30';
      }
  };

  const isTrendPositive = (trend: string) => {
    return trend.includes('+') || (!trend.includes('-') && trend !== '0%');
  };

  // Helper for scale position
  const getScalePercentage = (score: number) => {
    return Math.min(Math.max((score / 150) * 100, 2), 98);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header Section */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-xl relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
            <h1 className="text-3xl font-bold text-white mb-1">{data.companyName}</h1>
            <div className="flex items-center gap-3 text-slate-400">
                <span className="font-mono bg-slate-700/50 px-2 py-1 rounded text-xs border border-slate-600">{data.ticker}</span>
                <span className="text-2xl font-semibold text-slate-200">{data.currentPrice} {data.currency}</span>
            </div>
        </div>
        
        {data.priceTrend30d && (
            <div className="flex flex-col items-end">
                 <div className="text-xs uppercase tracking-widest font-semibold text-slate-500 mb-1">Trend (30T)</div>
                 <div className={`text-3xl font-bold flex items-center gap-2 ${isTrendPositive(data.priceTrend30d) ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isTrendPositive(data.priceTrend30d) ? <TrendingUp size={28}/> : <TrendingDown size={28}/>}
                    {data.priceTrend30d}
                 </div>
            </div>
        )}
      </div>

      {/* Company Profile */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 text-center backdrop-blur-sm mt-4">
         <p className="text-slate-300 text-sm italic leading-relaxed max-w-3xl mx-auto">
           {data.companyProfile}
         </p>
      </div>

      {/* INVESTMENT SCALE SECTION (1-150) */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        
        <div className="flex justify-between items-end mb-6">
           <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Investment Score</div>
              <div className="flex items-baseline gap-2">
                 <span className={`text-5xl font-black tracking-tight ${data.totalRecommendationScore >= 100 ? 'text-emerald-400' : data.totalRecommendationScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {data.totalRecommendationScore}
                 </span>
                 <span className="text-lg text-slate-500 font-bold">/ 150</span>
              </div>
           </div>
           <div className={`px-4 py-2 rounded-lg border font-bold text-lg flex items-center gap-2 ${getRecColor(data.recommendation)}`}>
              {data.recommendation === 'KAUFEN' && <TrendingUp size={20} />}
              {data.recommendation === 'VERKAUFEN' && <TrendingDown size={20} />}
              {data.recommendation === 'HALTEN' && <Minus size={20} />}
              {data.recommendation}
           </div>
        </div>

        {/* The Bar */}
        <div className="relative h-6 w-full bg-slate-900 rounded-full mb-4 shadow-inner border border-slate-800">
           {/* Gradient Background Segments */}
           <div className="absolute inset-0 rounded-full flex opacity-30">
              <div className="w-1/3 h-full bg-red-500 rounded-l-full"></div>
              <div className="w-1/3 h-full bg-yellow-500"></div>
              <div className="w-1/3 h-full bg-emerald-500 rounded-r-full"></div>
           </div>
           
           {/* The Marker */}
           <div 
             className="absolute top-0 bottom-0 w-2 bg-white rounded shadow-[0_0_15px_rgba(255,255,255,1)] transform -translate-x-1/2 transition-all duration-1000 ease-out z-10 scale-y-125"
             style={{ left: `${getScalePercentage(data.totalRecommendationScore)}%` }}
           ></div>
        </div>

        {/* Scale Labels */}
        <div className="flex justify-between text-xs font-mono text-slate-500 mb-8 px-1">
           <span>0 (SELL)</span>
           <span>75 (HOLD)</span>
           <span>150 (BUY)</span>
        </div>

        {/* Score Breakdown (Grid) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-700/50">
           
           <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800 flex flex-col items-center text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-wide font-bold mb-1">AI Base Score</div>
              <div className="text-emerald-400 font-bold text-xl">{data.totalScore}<span className="text-sm text-slate-600 font-normal">/50</span></div>
              <div className="text-[10px] text-slate-600 mt-1">5 Kategorien</div>
           </div>

           <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800 flex flex-col items-center text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-wide font-bold mb-1">News Sentiment</div>
              <div className="text-blue-400 font-bold text-xl">{data.newsScore}<span className="text-sm text-slate-600 font-normal">/50</span></div>
              <div className="text-[10px] text-slate-600 mt-1">Aktuelle Lage</div>
           </div>

           <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800 flex flex-col items-center text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-wide font-bold mb-1">Piotroski (S)</div>
              <div className="text-purple-400 font-bold text-xl">{Math.round((Math.min((data.advancedAnalysis.piotroski.score || 0), 9) / 9) * 25)}<span className="text-sm text-slate-600 font-normal">/25</span></div>
              <div className="text-[10px] text-slate-600 mt-1">Finanzstärke</div>
           </div>

           <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800 flex flex-col items-center text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-wide font-bold mb-1">Altman Z (S)</div>
              <div className="text-orange-400 font-bold text-xl">
                 {/* Re-calculate visualization value for consistency with Service logic */}
                 {(() => {
                    const z = data.advancedAnalysis.altmanZ.score;
                    let val = 0;
                    if(z >= 3) val = 25;
                    else if(z <= 1.8) val = 0;
                    else val = ((z - 1.8) / 1.2) * 25;
                    return Math.round(val);
                 })()}
                 <span className="text-sm text-slate-600 font-normal">/25</span>
              </div>
              <div className="text-[10px] text-slate-600 mt-1">Insolvenzrisiko</div>
           </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Radar Chart */}
        <div className="lg:col-span-1 bg-slate-800/40 border border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center relative shadow-lg">
          <h3 className="text-lg font-semibold text-slate-300 w-full mb-4">AI Base Analyse</h3>
          <div className="absolute top-6 right-6 flex flex-col items-end">
            <span className="text-4xl font-bold text-white">{data.totalScore}</span>
            <span className="text-xs text-slate-500 uppercase tracking-wide">Basis / 50</span>
          </div>
          <AnalysisChart scores={data.scores} />
        </div>

        {/* Right Column: Detailed Scores & Hardfacts */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
            
            {/* Detailed Scores List (Now Top) */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 shadow-lg order-1">
                <h3 className="text-lg font-semibold text-slate-300 mb-6">Detailbewertung (Basis für AI Score)</h3>
                <div className="space-y-6">
                    {data.scores.map((item, index) => (
                    <div key={index} className="group">
                        <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-slate-200">{item.category}</span>
                        <span className="font-mono text-slate-400">{item.score}/10</span>
                        </div>
                        <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden mb-2">
                        <div 
                            className={`h-full rounded-full ${getScoreColor(item.score)} transition-all duration-1000 ease-out`}
                            style={{ width: `${item.score * 10}%` }}
                        />
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">{item.reasoning}</p>
                    </div>
                    ))}
                </div>
            </div>

            {/* Hardfacts Table (Now Bottom) */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 shadow-lg order-2">
                <h3 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
                    <Table size={18} className="text-emerald-500" /> Key Hardfacts
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <FactCard label="Umsatz" value={data.hardfacts.revenue} />
                    <FactCard label="Gewinn (Netto)" value={data.hardfacts.profit} />
                    <FactCard label="KGV" value={data.hardfacts.peRatio} />
                    <FactCard label="Dividende" value={data.hardfacts.dividend} />
                    <FactCard label="Div. Rendite" value={data.hardfacts.dividendYield} />
                    <FactCard label="EK-Quote" value={data.hardfacts.equityRatio} />
                </div>
            </div>
        </div>
      </div>

      {/* ADVANCED ANALYSIS SECTION (Piotroski, Altman Z) */}
      {data.advancedAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Piotroski F-Score */}
            <div className="rounded-2xl p-5 border border-slate-700 bg-slate-800/40 flex flex-col justify-between">
               <div className="flex items-center gap-2 mb-3 text-blue-400">
                   <Activity size={20} />
                   <h3 className="font-bold text-sm uppercase tracking-wide text-slate-300">Piotroski F-Score</h3>
               </div>
               <div className="flex items-center justify-center gap-2 mb-2">
                   <span className="text-4xl font-black text-white">{data.advancedAnalysis.piotroski.score}</span>
                   <span className="text-lg text-slate-500 font-light">/ 9</span>
               </div>
               <div className="flex gap-1 h-2 mb-3">
                   {[...Array(9)].map((_, i) => (
                       <div key={i} className={`flex-1 rounded-sm ${i < data.advancedAnalysis.piotroski.score ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
                   ))}
               </div>
               <p className="text-center text-xs text-slate-400">{data.advancedAnalysis.piotroski.interpretation}</p>
            </div>

            {/* Altman Z-Score */}
            <div className="rounded-2xl p-5 border border-slate-700 bg-slate-800/40 flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-3 text-purple-400">
                   <Scale size={20} />
                   <h3 className="font-bold text-sm uppercase tracking-wide text-slate-300">Altman Z-Score</h3>
               </div>
               <div className="text-center mb-2">
                   <span className={`text-4xl font-black ${
                       data.advancedAnalysis.altmanZ.zone === 'Safe' ? 'text-emerald-400' : 
                       data.advancedAnalysis.altmanZ.zone === 'Grey' ? 'text-yellow-400' : 'text-red-400'
                   }`}>
                       {data.advancedAnalysis.altmanZ.score}
                   </span>
               </div>
               {/* Gauge Visual */}
               <div className="relative h-2 w-full bg-slate-700 rounded-full mb-3 overflow-hidden flex">
                   <div className="w-[36%] bg-red-500/80"></div> {/* Distress < 1.8 */}
                   <div className="w-[24%] bg-yellow-500/80"></div> {/* Grey 1.8 - 3.0 */}
                   <div className="w-[40%] bg-emerald-500/80"></div> {/* Safe > 3.0 */}
                   
                   {/* Marker logic roughly simplified for visuals */}
                   <div 
                     className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                     style={{ 
                         left: `${Math.min(Math.max((data.advancedAnalysis.altmanZ.score / 5) * 100, 5), 95)}%` 
                     }}
                   ></div>
               </div>
               <p className="text-center text-xs text-slate-400">{data.advancedAnalysis.altmanZ.interpretation}</p>
            </div>
        </div>
      )}

      {/* Business Model Analysis - Investor View */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
         <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <Gem size={20} className="text-blue-400" />
            Geschäftsmodell & Burggraben
         </h3>
         <p className="text-slate-300 leading-relaxed">
            {data.businessModelRisk}
         </p>
      </div>

      {/* News Section */}
      <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Newspaper className="text-emerald-500" size={20} />
            Aktuelle Nachrichten
          </h3>
          <div className="grid gap-4">
             {data.news && data.news.length > 0 ? (
                 data.news.map((item, i) => (
                    <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-slate-600 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{item.source}</span>
                            <span className="text-xs text-slate-500 flex items-center gap-1"><Calendar size={10}/> {item.date}</span>
                        </div>
                        <h4 className="text-slate-200 font-medium mb-1 line-clamp-2">{item.title}</h4>
                        {item.url && (
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1 mt-2">
                                Zum Artikel <ExternalLink size={10} />
                            </a>
                        )}
                    </div>
                 ))
             ) : (
                 <p className="text-slate-500 italic">Keine aktuellen Nachrichten gefunden.</p>
             )}
          </div>
      </div>

      {/* Summary Section */}
      <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-emerald-500 rounded-full block"></span>
          Fazit & Zusammenfassung
        </h3>
        <p className="text-slate-300 leading-7 text-lg">
          {data.summary}
        </p>
      </div>

      {/* Footer / Meta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sources */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quellen (Google Search Grounding)</h4>
          <div className="flex flex-wrap gap-2">
            {data.sources && data.sources.length > 0 ? (
              data.sources.map((source, i) => (
                <a 
                  key={i} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 text-xs rounded transition-colors truncate max-w-full"
                >
                  <ExternalLink size={10} />
                  <span className="truncate max-w-[150px]">{source.title}</span>
                </a>
              ))
            ) : (
               <span className="text-slate-600 text-xs italic">Keine expliziten Quellenlinks verfügbar.</span>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
          <ShieldAlert className="text-slate-600 min-w-[20px]" size={20} />
          <p className="text-xs text-slate-500 leading-relaxed">
            {data.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
};