import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, GroundingSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeStock = async (query: string): Promise<AnalysisResult> => {
  const modelId = "gemini-2.5-flash"; // Best for fast, grounded queries

  const prompt = `
    Du bist ein Expertenteam aus Finanzanalysten für den deutschen Aktienmarkt (DAX, MDAX, SDAX, TecDAX).
    Analysiere das Unternehmen "${query}".

    Führe folgende Schritte durch:
    1. Recherchiere aktuelle Finanzdaten (Umsatz, Gewinn, KGV, Dividende, Bilanzdaten), den Aktienkurs von heute und die Kursentwicklung der letzten 30 Tage.
    2. Suche nach den 3 aktuellsten, seriösesten und marktrelevanten Nachrichten/News.
    
    3. BEWERTUNG SCHRITT 1: Standard-Scoreboard (0-50 Punkte)
    Vergib 0-10 Punkte in 5 Kategorien (Bewertung, Wachstum, Dividende, Trend, Sentiment).

    4. BEWERTUNG SCHRITT 2: News-Sentiment-Score (0-50 Punkte)
    Analysiere die aktuelle Nachrichtenlage separat. 
    - 50 Punkte: Extrem positive Nachrichten (Übernahme, Rekordgewinne, Prognoseanhebung).
    - 25 Punkte: Neutral / Gemischt.
    - 0 Punkte: Extrem negative Nachrichten (Skandale, Gewinnwarnung, Klagen).
    Gib hierfür einen konkreten Punktwert ("newsScore").
    
    5. FÜHRE ZUSÄTZLICH FOLGENDE 2 SPEZIAL-ANALYSEN DURCH (Nutze geschätzte aktuelle Werte):

    --- ANALYSE A: Piotroski F-Score ---
    Gehe die 9 Punkte durch (Profitabilität: ROA>0, CFO>0, ROA steigt, CFO>NetIncome; Leverage: Debt sinkt, Current Ratio steigt, Keine neuen Aktien; Effizienz: Gross Margin steigt, Asset Turnover steigt).
    Summiere die Punkte (0-9).

    --- ANALYSE B: Altman Z-Score ---
    Berechne den Z-Score für Non-Financials (Formel: 1.2*A + 1.4*B + 3.3*C + 0.6*D + 1.0*E). Falls Bank/Versicherung, gib "N/A" an oder nutze ein angepasstes Modell, aber markiere es.
    Zonen: > 3.0 Safe, 1.8-3.0 Grey Zone, < 1.8 Distress.

    Gib das Ergebnis AUSSCHLIESSLICH als valides JSON zurück. Das JSON muss exakt dieser Struktur folgen:
    {
      "companyName": "Name",
      "ticker": "Symbol",
      "currentPrice": "Preis",
      "currency": "EUR",
      "priceTrend30d": "Veränderung letzte 30 Tage (z.B. +5.2% oder -1.5%)",
      "scores": [
        { "category": "Bewertung (KGV/KBV)", "score": 0, "reasoning": "..." },
        { "category": "Wachstum & Profitabilität", "score": 0, "reasoning": "..." },
        { "category": "Dividende & Sicherheit", "score": 0, "reasoning": "..." },
        { "category": "Technische Analyse (Trend)", "score": 0, "reasoning": "..." },
        { "category": "Sentiment & News", "score": 0, "reasoning": "..." }
      ],
      "newsScore": 0, 
      "recommendation": "KAUFEN" | "HALTEN" | "VERKAUFEN",
      "riskLevel": "Niedrig" | "Mittel" | "Hoch",
      "companyProfile": "Profil...",
      "hardfacts": {
        "revenue": "Umsatz",
        "peRatio": "KGV",
        "profit": "Gewinn",
        "dividend": "Dividende",
        "dividendYield": "%",
        "equityRatio": "%"
      },
      "businessModelRisk": "Bewerte das Geschäftsmodell...",
      "advancedAnalysis": {
        "piotroski": {
           "score": 7,
           "interpretation": "Acceptable / Investable"
        },
        "altmanZ": {
           "score": 2.8,
           "interpretation": "Grey Zone",
           "zone": "Safe" | "Grey" | "Distress"
        }
      },
      "news": [
        { "title": "...", "source": "...", "date": "...", "url": "..." }
      ],
      "summary": "Zusammenfassung...",
      "disclaimer": "Ich bin eine KI. Dies ist keine Finanzberatung."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    const jsonString = text.replace(/```json\n?|\n?```/g, "").trim();
    
    let parsedData: AnalysisResult;
    try {
        parsedData = JSON.parse(jsonString);
        
        // --- CALCULATION LOGIC FOR 0-150 SCORE ---
        
        // 1. Base AI Score (Sum of 5 Categories, Max 50)
        let aiScore = 0;
        if (parsedData.scores && Array.isArray(parsedData.scores)) {
            aiScore = parsedData.scores.reduce((sum, item) => sum + (item.score || 0), 0);
        }
        parsedData.totalScore = aiScore;

        // 2. Piotroski Scaled (0-9 -> 0-25)
        // Formula: (Score / 9) * 25
        const pRaw = parsedData.advancedAnalysis.piotroski.score || 0;
        const pScaled = (Math.min(pRaw, 9) / 9) * 25;

        // 3. Altman Z Scaled (Z-Score -> 0-25)
        // Logic: > 3.0 = 25pts (Safe), < 1.8 = 0pts (Distress), 1.8-3.0 = Linear Interpolation
        const zRaw = parsedData.advancedAnalysis.altmanZ.score || 0;
        let zScaled = 0;
        if (zRaw >= 3.0) {
            zScaled = 25;
        } else if (zRaw <= 1.8) {
            zScaled = 0;
        } else {
            // Linear interpolation between 1.8 (0pts) and 3.0 (25pts)
            // Range is 1.2. 
            zScaled = ((zRaw - 1.8) / 1.2) * 25;
        }

        // 4. News Score (Max 50)
        const nScore = parsedData.newsScore || 25; // Default to neutral if missing

        // Total Sum
        parsedData.totalRecommendationScore = Math.round(aiScore + pScaled + zScaled + nScore);

        // Adjust Recommendation Text if there is a massive mismatch (Optional, but keeps consistency)
        // Leaving the AI's semantic recommendation as "truth", but the score provides the nuance.

    } catch (e) {
        console.error("Failed to parse JSON from model output:", text);
        throw new Error("Die Analyse konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.");
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri && web.title)
      .map((web: any) => ({ title: web.title, uri: web.uri }));

    const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

    return {
      ...parsedData,
      sources: uniqueSources
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};