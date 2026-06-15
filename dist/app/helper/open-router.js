"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openai = void 0;
exports.getFreeFallbackModels = getFreeFallbackModels;
const openai_1 = __importDefault(require("openai"));
const config_1 = __importDefault(require("../config"));
let cachedModels = [];
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
exports.openai = new openai_1.default({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: config_1.default.openRouterApiKey
});
function getFreeFallbackModels() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, e_1, _b, _c;
        const now = Date.now();
        if (cachedModels.length > 0 && now < cacheExpiry) {
            // console.log(`📋 Using cached model list (${cachedModels.length} models)`);
            return cachedModels;
        }
        try {
            const response = yield exports.openai.models.list();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const allModels = [];
            try {
                for (var _d = true, response_1 = __asyncValues(response), response_1_1; response_1_1 = yield response_1.next(), _a = response_1_1.done, !_a; _d = true) {
                    _c = response_1_1.value;
                    _d = false;
                    const model = _c;
                    allModels.push(model);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = response_1.return)) yield _b.call(response_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // console.log(`📋 OpenRouter total models: ${allModels.length}`);
            const freeIds = new Set(allModels
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .filter((m) => {
                const p = m === null || m === void 0 ? void 0 : m.pricing;
                return (p === null || p === void 0 ? void 0 : p.prompt) === "0" && (p === null || p === void 0 ? void 0 : p.completion) === "0";
            })
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((m) => m.id));
            // console.log(`✅ Free models found: ${freeIds.size}`);
            if (freeIds.size === 0) {
                throw new Error("No free models found in OpenRouter response");
            }
            const ordered = [];
            for (const preferred of PREFERRED) {
                if (freeIds.has(preferred)) {
                    ordered.push(`${preferred}:free`);
                }
            }
            if (ordered.length < 8) {
                for (const id of freeIds) {
                    if (ordered.length >= 8)
                        break;
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
        }
        catch (err) {
            // console.error("⚠️  Could not fetch OpenRouter model list:", err);
            // console.warn("⚠️  Falling back to hard-coded model list");
            return HARDCODED_FALLBACK;
        }
    });
}
