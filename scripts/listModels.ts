import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

// Load env vars
dotenv.config({ path: '.env.local' });

async function listModels() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.error("Error: API_KEY not found in .env.local");
        return;
    }

    console.log(`Checking models for API Key: ${apiKey.substring(0, 5)}...`);

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // There isn't a direct listModels method on the main class in the Node SDK easily exposed 
        // in the same way as the REST API, but we can try to get a model and see if it works,
        // OR use the model manager if available. 
        // Actually, looking at the SDK source, there isn't a public listModels method on GoogleGenerativeAI.
        // We have to use the REST API directly to list models to be sure.

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (!response.ok) {
            console.error(`Failed to list models. Status: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error("Response:", text);
            return;
        }

        const data = await response.json();
        console.log("--- Available Models ---");
        if (data.models) {
            data.models.forEach((m: any) => {
                console.log(`- ${m.name} (Supported methods: ${m.supportedGenerationMethods?.join(', ')})`);
            });
        } else {
            console.log("No models found in response.");
            console.log(JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
