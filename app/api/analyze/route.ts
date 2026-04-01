import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { text, targetLanguage } = await req.json();

    if (!text || !targetLanguage) {
      return NextResponse.json({ error: 'Missing text or targetLanguage' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key missing' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

    const prompt = `
    Analyze the following source text. A language learner is trying to translate it into ${targetLanguage}:
    "${text}"

    Detect the original language of the text.

    Return ONLY a valid JSON object matching exactly:
    {
      "detectedLanguage": "The full name of the language (e.g. 'French', 'Spanish', 'Latin')"
    }
    `;

    const result = await model.generateContent(prompt);
    const cleanedText = result.response.text().replace(/```json\n?|\n?```/g, '').trim();

    return NextResponse.json(JSON.parse(cleanedText));
  } catch (error) {
    console.error("Analyze API Error:", error);
    return NextResponse.json({ error: 'Failed to analyze text' }, { status: 500 });
  }
}
