/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-empty */

export const extractJsonFromMessage = (raw: string): Record<string, unknown> => {
  try { return JSON.parse(raw.trim()); } catch (_) {}

  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) {
    try { return JSON.parse(fenced[1].trim()); } catch (_) {}
  }
 
  const firstBrace = raw.indexOf("{");
  const lastBrace  = raw.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try { return JSON.parse(raw.slice(firstBrace, lastBrace + 1)); } catch (_) {}
  }
 
  const firstBracket = raw.indexOf("[");
  const lastBracket  = raw.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    try {
      const arr = JSON.parse(raw.slice(firstBracket, lastBracket + 1));
      return { suggestedEvents: arr };
    } catch (_) {}
  }
 
  throw new Error("Could not extract valid JSON from AI response");
}