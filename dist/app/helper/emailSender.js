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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../config"));
const emailSender = (to, subject, html) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'api-key': config_1.default.brevo.apiKey,
            'Content-Type': 'application/json',
            'accept': 'application/json',
        },
        body: JSON.stringify({
            sender: {
                name: 'EventsVibe',
                email: config_1.default.brevo.fromEmail,
            },
            to: [{ email: to }],
            subject,
            htmlContent: html,
        }),
    });
    if (!response.ok) {
        const errorBody = yield response.text();
        throw new Error(`Brevo email failed: ${response.status} - ${errorBody}`);
    }
});
exports.default = emailSender;
