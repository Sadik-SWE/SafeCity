import { GoogleGenAI, Type } from '@google/genai';
import { IncidentCategory, RiskLevel, UrgencyLevel, AIAnalysis } from '../../src/types';

export async function analyzeIncidentWithGemini(
  title: string,
  description: string,
  userSelectedCategory?: string
): Promise<AIAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 5) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are SafeCity AI, an expert public safety & emergency assessment system.
Analyze the following community incident report and classify it accurately:

Title: ${title}
Description: ${description}
${userSelectedCategory ? `User Selected Category Hint: ${userSelectedCategory}` : ''}

Provide a structured assessment JSON containing:
1. "incidentType": One of ["Crime", "Accident", "Fire", "Medical Emergency", "Natural Disaster", "Suspicious Activity", "Road Hazard", "Infrastructure Problem", "Theft", "Violence", "Other"]
2. "riskLevel": One of ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
3. "urgencyLevel": One of ["LOW", "MEDIUM", "HIGH", "IMMEDIATE"]
4. "confidenceScore": A number between 0.0 and 1.0 (e.g. 0.92)
5. "shortSummary": A concise 1-2 sentence executive summary of the incident.
6. "recommendedAction": Specific, actionable advice for law enforcement or emergency responders.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              incidentType: {
                type: Type.STRING,
                enum: [
                  'Crime',
                  'Accident',
                  'Fire',
                  'Medical Emergency',
                  'Natural Disaster',
                  'Suspicious Activity',
                  'Road Hazard',
                  'Infrastructure Problem',
                  'Theft',
                  'Violence',
                  'Other',
                ],
              },
              riskLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
              urgencyLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'IMMEDIATE'] },
              confidenceScore: { type: Type.NUMBER },
              shortSummary: { type: Type.STRING },
              recommendedAction: { type: Type.STRING },
            },
            required: [
              'incidentType',
              'riskLevel',
              'urgencyLevel',
              'confidenceScore',
              'shortSummary',
              'recommendedAction',
            ],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return {
          incidentType: (parsed.incidentType || userSelectedCategory || 'Other') as IncidentCategory,
          riskLevel: (parsed.riskLevel || 'MEDIUM') as RiskLevel,
          urgencyLevel: (parsed.urgencyLevel || 'MEDIUM') as UrgencyLevel,
          confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 0.88,
          shortSummary: parsed.shortSummary || `${title}: ${description.slice(0, 100)}...`,
          recommendedAction: parsed.recommendedAction || 'Notify area authorities for review.',
          analyzedAt: new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn('Gemini API call encountered an error, falling back to smart heuristic classifier:', err);
    }
  }

  return fallbackRuleBasedAnalysis(title, description, userSelectedCategory);
}

function fallbackRuleBasedAnalysis(title: string, description: string, userCat?: string): AIAnalysis {
  const text = (title + ' ' + description).toLowerCase();

  let riskLevel: RiskLevel = 'MEDIUM';
  let urgencyLevel: UrgencyLevel = 'MEDIUM';
  let incidentType: IncidentCategory = (userCat as IncidentCategory) || 'Other';
  let confidenceScore = 0.85;

  if (/fire|explosion|smoke|blaze|flames/i.test(text)) {
    incidentType = 'Fire';
    riskLevel = 'HIGH';
    urgencyLevel = 'IMMEDIATE';
  } else if (/gun|shooting|weapon|armed|stab|violence|assault|hostage|kill/i.test(text)) {
    incidentType = 'Violence';
    riskLevel = 'CRITICAL';
    urgencyLevel = 'IMMEDIATE';
  } else if (/accident|crash|collision|hit and run|vehicle/i.test(text)) {
    incidentType = 'Accident';
    riskLevel = 'HIGH';
    urgencyLevel = 'HIGH';
  } else if (/unconscious|heart attack|stroke|seizure|bleeding|injury|faint|cardiac/i.test(text)) {
    incidentType = 'Medical Emergency';
    riskLevel = 'HIGH';
    urgencyLevel = 'IMMEDIATE';
  } else if (/stolen|robbery|theft|burglary|thief|mugged|break-in/i.test(text)) {
    incidentType = 'Theft';
    riskLevel = 'MEDIUM';
    urgencyLevel = 'HIGH';
  } else if (/pothole|sinkhole|water leak|pipe burst|power outage|bridge|cable/i.test(text)) {
    incidentType = 'Infrastructure Problem';
    riskLevel = 'LOW';
    urgencyLevel = 'LOW';
  } else if (/flood|earthquake|storm|cyclone|landslide/i.test(text)) {
    incidentType = 'Natural Disaster';
    riskLevel = 'CRITICAL';
    urgencyLevel = 'IMMEDIATE';
  } else if (/suspicious|stranger|loitering|unattended package/i.test(text)) {
    incidentType = 'Suspicious Activity';
    riskLevel = 'MEDIUM';
    urgencyLevel = 'MEDIUM';
  }

  const shortSummary = `AI Assessment: Incident categorized as ${incidentType} with ${riskLevel} risk based on text analysis.`;
  const recommendedAction =
    riskLevel === 'CRITICAL' || urgencyLevel === 'IMMEDIATE'
      ? 'CRITICAL ALERT: Alert local emergency response dispatch immediately.'
      : 'Flagged for verification by district administrative team.';

  return {
    incidentType,
    riskLevel,
    urgencyLevel,
    confidenceScore,
    shortSummary,
    recommendedAction,
    analyzedAt: new Date().toISOString(),
  };
}
