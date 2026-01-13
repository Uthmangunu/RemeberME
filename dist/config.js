"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    SUPABASE_URL: zod_1.z.string().url(),
    SUPABASE_KEY: zod_1.z.string().min(1),
    OPENAI_API_KEY: zod_1.z.string().min(1),
});
exports.config = envSchema.parse(process.env);
