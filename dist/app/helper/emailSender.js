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
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config"));
const emailSender = (to, subject, html) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        host: config_1.default.emailSender.smtp_host,
        port: Number(config_1.default.emailSender.smtp_port),
        secure: true, // Use `true` for port 465, `false` for all other ports like as used 587
        auth: {
            user: config_1.default.emailSender.smtp_user,
            pass: config_1.default.emailSender.smtp_pass, // app password
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const info = yield transporter.sendMail({
        from: `"From" ${config_1.default.emailSender.smtp_from}`, // sender address
        to,
        subject,
        html,
    });
});
exports.default = emailSender;
