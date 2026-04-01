import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { word, sourceLanguage, targetLanguage } = await req.json();

    if (!word || !sourceLanguage || !targetLanguage) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured in .env' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

    const prompt = `
    You are a dictionary assistant for language learners.
    Provide information for the word "${word}" in ${sourceLanguage}. 
    The user is translating this text into ${targetLanguage}.

    Return ONLY a valid JSON object matching this exact schema, with no markdown formatting or backticks:
    {
      "originalWord": "The infinitive, lemma, or dictionary form of the word",
      "ipa": "IPA pronunciation string",
      "partOfSpeech": "noun, verb, adjective, etc.",
      "meaning": "Clear, concise definition of the word",
      "translations": ["Direct translation 1 in ${targetLanguage}", "Direct translation 2 in ${targetLanguage}"]
    }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();

    return NextResponse.json(JSON.parse(cleanedText));

  } catch (error) {
    console.error("Dictionary API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch definition' }, { status: 500 });
  }
}
