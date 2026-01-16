
const { GoogleGenerativeAI } = require("@google/generative-ai");

require('dotenv').config();
const apiKey = process.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const modelsToTest = [
    "gemini-1.5-pro",
    "gemini-1.5-pro-latest",
    "gemini-1.5-pro-001",
    "gemini-1.5-pro-exp",
    "gemini-pro",
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash-001",
    "gemini-2.0-flash",
    "gemini-2.0-flash-exp"
];

async function testModel(modelName) {
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        const response = await result.response;
        console.log(`[SUCCESS] ${modelName}: ${response.text()}`);
        return true;
    } catch (error) {
        console.log(`[FAILED] ${modelName}: ${error.message.split(']')[1] || error.message}`);
        return false;
    }
}

async function runTests() {
    console.log("Starting Model Availability Tests...");
    for (const model of modelsToTest) {
        await testModel(model);
    }
}

runTests();
