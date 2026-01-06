import { GoogleGenerativeAI } from '@google/generative-ai';
import { JobPost } from '@/types';

// Initialize Gemini
// Ensure NEXT_PUBLIC_... isn't used for server-side secrets, but usually standard env vars work in Next.js API routes.
const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey || '');

const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
        responseMimeType: "application/json",
    }
});

export async function draftJobFromText(rawText: string, sourceUrl: string): Promise<JobPost> {
    if (!apiKey) {
        throw new Error('Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable');
    }

    const prompt = `
    You are an expert Data Extractor for a Government Job Portal.
    Extract the following details from the chaotic text provided below and format it into a strictly valid JSON object.
    
    Target JSON Structure:
    {
      "title": "Job Title (e.g. UPSC IAS Recruitment 2024)",
      "organization": "Organization Name (e.g. Union Public Service Commission)",
      "postDate": "YYYY-MM-DD",
      "totalVacancy": "Number or 'Not Specified'",
      "description": "A concise 2-3 sentence summary of the job.",
      "applicationFee": "Details about fees (e.g. Gen: 100, SC/ST: Nil)",
      "ageLimit": "Age eligibility details",
      "qualification": "Education requirements",
      "importantDates": ["Start Date: ...", "End Date: ..."],
      "importantLinks": [ { "label": "Apply Online", "url": "..." }, { "label": "Notification", "url": "..." } ]
    }

    Rules:
    1. If a field is missing, use "Not Specified" or empty array.
    2. Format dates as YYYY-MM-DD if possible, otherwise keep original text.
    3. Be precise with numbers (Vacancies, Fees).
    4. Do not halllucinate. Use only the provided text.

    RAW TEXT INPUT:
    ${rawText.slice(0, 20000)}
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const parsed = JSON.parse(text);

        // Return with default status 'draft'
        return {
            ...parsed,
            status: 'draft',
            sourceUrl,
            aiConfidence: 0.9 // Placeholder, Gemini doesn't always give confidence scores easily in this mode
        };
    } catch (error: any) {
        console.error('AI Drafting Error:', error);
        if (error.response) {
            console.error('AI Response Error:', error.response);
        }
        throw new Error(`Failed to generate draft from AI: ${error.message}`);
    }
}
