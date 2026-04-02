import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { text, nativeLanguage, targetLanguage, translationDirection } = await req.json();

    if (!text || !targetLanguage || !nativeLanguage || !translationDirection) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key missing' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

    const prompt = `
    Analyze the following source text. A language learner is using an application to practice translation.
    The learner's native language is ${nativeLanguage} and their target language to learn is ${targetLanguage}.
    The user has chosen to translate: ${translationDirection === 'native-to-target' ? `from their native language (${nativeLanguage}) to their target learning language (${targetLanguage})` : `from their target learning language (${targetLanguage}) to their native language (${nativeLanguage})`}.

    Source text to analyze:
    "${text}"

    Detect the original language of the source text.
    Also, identify the type of translation (e.g., literary, technical, casual, academic, medical, business) and define the language proficiency required (e.g., A1, A2, B1, B2, C1, C2 or Native) to do the translation according to the type of translation and the text complexity.

    Return ONLY a valid JSON object matching exactly:
    {
      "detectedLanguage": "The full name of the language (e.g. 'French', 'Spanish', 'English')",
      "translationType": "The type of translation (e.g. 'literary', 'technical', 'academic')",
      "languageProficiencyRequired": "The required language proficiency level (e.g. 'B2', 'C1')"
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
