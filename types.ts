export interface ScoreItem {
  category: string;
  score: number;
  reasoning: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Hardfacts {
  revenue: string;      // Umsatz
  peRatio: string;      // KGV
  profit: string;       // Gewinn
  dividend: string;     // Dividende
  dividendYield: string; // Dividendenrendite
  equityRatio: string;  // Eigenkapitalquote
}

export interface NewsItem {
  title: string;
  source: string;
  date: string;
  url?: string;
}

export interface AdvancedAnalysis {
  piotroski: {
    score: number; // 0-9
    interpretation: string; // "Excellent Financial Quality", etc.
  };
  altmanZ: {
    score: number;
    interpretation: string; // "Low Bankruptcy Risk", etc.
    zone: 'Safe' | 'Grey' | 'Distress';
  };
}

export interface AnalysisResult {
  companyName: string;
  ticker: string;
  currentPrice: string;
  currency: string;
  priceTrend30d: string;
  scores: ScoreItem[];
  totalScore: number; // The "AI Score" (0-50)
  newsScore: number; // New: 0-50 based on sentiment
  totalRecommendationScore: number; // New: 0-150 Aggregate
  recommendation: 'KAUFEN' | 'HALTEN' | 'VERKAUFEN';
  riskLevel: 'Niedrig' | 'Mittel' | 'Hoch';
  summary: string;
  companyProfile: string;
  hardfacts: Hardfacts;
  businessModelRisk: string;
  news: NewsItem[];
  advancedAnalysis: AdvancedAnalysis;
  disclaimer: string;
  sources?: GroundingSource[];
}

export interface StockQuery {
  query: string;
}