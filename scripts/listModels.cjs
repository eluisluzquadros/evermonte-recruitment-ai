const fs = require("fs");
const path = require("path");

// Load env vars manually
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} else {
    console.log("No .env.local found at", envPath);
}

async function listModels() {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("Error: API_KEY or GEMINI_API_KEY not found in .env.local");
        console.log("Keys found:", Object.keys(process.env).filter(k => k.includes('KEY')));
        return;
    }

    console.log(`Checking models for API Key: ${apiKey.substring(0, 5)}...`);

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (!response.ok) {
            console.error(`Failed to list models. Status: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error("Response:", text);
            return;
        }

        const data = await response.json();

        // Write to file
        fs.writeFileSync(path.resolve(__dirname, '../models.json'), JSON.stringify(data, null, 2));
        console.log("Models written to models.json");

        console.log("--- Available Models ---");
        if (data.models) {
            data.models.forEach((m) => {
                console.log(`- ${m.name} (Supported methods: ${m.supportedGenerationMethods?.join(', ')})`);
            });
        } else {
            console.log("No models found in response.");
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
