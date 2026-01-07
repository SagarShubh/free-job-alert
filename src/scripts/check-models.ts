import './setup-env';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function listModels() {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        console.error('No API Key found');
        return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // We can't list models directly via the SDK easily in all versions, 
        // but let's try a direct fetch or just try a standard 'gemini-pro' generation to see if it works.
        console.log("Testing gemini-pro...");
        const proModel = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await proModel.generateContent("Hello");
        console.log("gemini-pro Success:", result.response.text());

        console.log("Testing gemini-1.5-flash...");
        const flashModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result2 = await flashModel.generateContent("Hello");
        console.log("gemini-1.5-flash Success:", result2.response.text());

    } catch (e) {
        console.error("Error:", e);
    }
}

listModels();
