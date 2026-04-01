import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { sourceText, translationText, sourceLanguage, targetLanguage } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing Gemini API key" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

    const prompt = `
You are an expert ${targetLanguage} linguist and translator evaluating a student's translation from ${sourceLanguage}.

Source Text (${sourceLanguage}):
"""
${sourceText}
"""

Student's Translation (${targetLanguage}):
"""
${translationText}
"""

Evaluate this translation. Be constructive, academic, and highly precise.
Do NOT use plain text blocks. You must format your entire response in GitHub Flavored Markdown using structural elements to make the reading experience beautiful.

Follow this exact structure:

## Overall Assessment
(1 paragraph summarizing their performance. If they missed the tone, explain why.)

## Key Corrections
Use a Markdown Table to compare their mistakes against the correct approach.
| Original Translation Snippet | Corrected Snippet | Linguistic Explanation |
|---|---|---|
| ... | ... | ... |

> **Note:** (Add a markdown blockquote here with a general rule of thumb for this specific text genre or language pair)

## Native Fluency Tips
Provide 2-3 bullet points on how a native speaker would make this text sound significantly more natural. Use **bolding** to highlight the specific idioms or grammatical structures.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ evaluation: text });
  } catch (error) {
    console.error("Evaluate API Error:", error);
    return NextResponse.json({ error: "Failed to fetch evaluation" }, { status: 500 });
  }
}
