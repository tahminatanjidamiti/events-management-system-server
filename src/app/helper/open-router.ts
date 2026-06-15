import OpenAI from 'openai';
import config from '../config';

let cachedModels: string[] = [];
let cacheExpiry = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

//Need to Update this list occasionally as OpenRouter's catalogue changes.
const PREFERRED = [
  "deepseek/deepseek-r1-0528",
  "deepseek/deepseek-chat-v3-0324",
  "google/gemma-3-12b-it",
  "meta-llama/llama-3.3-70b-instruct",
  "nvidia/llama-3.1-nemotron-70b-instruct",
  "mistralai/mistral-7b-instruct",
  "microsoft/phi-3-mini-128k-instruct",
  "google/gemma-2-9b-it",
];

const HARDCODED_FALLBACK = [
  "deepseek/deepseek-r1-0528:free",
  "deepseek/deepseek-chat-v3-0324:free",
  "google/gemma-3-12b-it:free",
  "meta-llama/llama-3.3-70b-instruct:free",
];
 

export const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: config.openRouterApiKey
});

export async function getFreeFallbackModels(): Promise<string[]> {
  const now = Date.now();
 
  if (cachedModels.length > 0 && now < cacheExpiry) {
    // console.log(`📋 Using cached model list (${cachedModels.length} models)`);
    return cachedModels;
  }
 
  try {
    const response = await openai.models.list();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allModels: any[] = [];
    for await (const model of response) {
      allModels.push(model);
    }
 
    // console.log(`📋 OpenRouter total models: ${allModels.length}`);

    const freeIds = new Set<string>(
      allModels
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((m: any) => {
          const p = m?.pricing;
          return p?.prompt === "0" && p?.completion === "0";
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((m: any) => m.id as string)
    );
 
    // console.log(`✅ Free models found: ${freeIds.size}`);
 
    if (freeIds.size === 0) {
      throw new Error("No free models found in OpenRouter response");
    }
 
    const ordered: string[] = [];
 
    for (const preferred of PREFERRED) {
      if (freeIds.has(preferred)) {
        ordered.push(`${preferred}:free`);
      }
    }
 
    if (ordered.length < 8) {
      for (const id of freeIds) {
        if (ordered.length >= 8) break;
        const withSuffix = `${id}:free`;
        if (!ordered.includes(withSuffix)) {
          ordered.push(withSuffix);
        }
      }
    }
 
    // console.log(`🤖 Model queue: ${ordered.slice(0, 3).join(", ")} (+${Math.max(0, ordered.length - 3)} more)`);
 
    cachedModels = ordered;
    cacheExpiry = now + CACHE_TTL_MS;
    return ordered;
 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    // console.error("⚠️  Could not fetch OpenRouter model list:", err);
    // console.warn("⚠️  Falling back to hard-coded model list");
    return HARDCODED_FALLBACK;
  }
}