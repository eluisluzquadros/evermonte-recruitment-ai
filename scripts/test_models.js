
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Simulating __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper to manually parse .env
function loadEnv() {
    try {
        const envPath = resolve(__dirname, '../.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf-8');
            envContent.split('\n').forEach(line => {
                const parts = line.split('=');
                if (parts.length >= 2 && !line.trim().startsWith('#')) {
                    const key = parts[0].trim();
                    const value = parts.slice(1).join('=').trim();
                    process.env[key] = value;
                }
            });
        }
    } catch (e) {
        console.error("Error loading .env", e);
    }
}

loadEnv();

const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ No API Key found in .env");
    process.exit(1);
}

console.log(`🔑 Using API Key: ${apiKey.substring(0, 10)}...`);

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    console.log("\n🧪 Testing Model Availability with API Versions:");

    // Test scenarios
    const scenarios = [
        { model: "gemini-pro", apiVersion: "v1" },
        { model: "gemini-1.0-pro", apiVersion: "v1" },
        { model: "gemini-1.5-flash", apiVersion: "v1beta" },
        { model: "gemini-1.5-flash-001", apiVersion: "v1beta" },
        { model: "gemini-1.5-flash-latest", apiVersion: "v1beta" },
        { model: "gemini-1.5-pro", apiVersion: "v1beta" },
        { model: "gemini-1.5-pro-001", apiVersion: "v1beta" },
        { model: "gemini-2.0-flash", apiVersion: "v1beta" },
        { model: "gemini-2.0-flash-exp", apiVersion: "v1beta" }
    ];

    for (const scenario of scenarios) {
        process.stdout.write(`Testing ${scenario.model} (${scenario.apiVersion})... `);
        try {
            const model = genAI.getGenerativeModel({
                model: scenario.model,
                apiVersion: scenario.apiVersion
            });
            const result = await model.generateContent("Hello");
            console.log(`✅ SUCCESS`);
        } catch (error) {
            if (error.message.includes("404") || error.message.includes("not found")) {
                console.log(`❌ NOT FOUND (404)`);
            } else if (error.message.includes("429") || error.message.includes("quota")) {
                console.log(`⚠️ QUOTA EXCEEDED (429)`);
            } else {
                console.log(`❌ ERROR: ${error.message.split('\n')[0]}`);
            }
        }
    }
}

listModels();
