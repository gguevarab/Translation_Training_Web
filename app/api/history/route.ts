import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const sessions = await prisma.translationSession.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Failed to fetch history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      sourceText, 
      translatedText, 
      aiInsights, 
      selectedWords, 
      translationType,
      timeSpentSeconds,
      sourceLanguage,
      targetLanguage,
      languageProficiency
    } = body;

    if (!sourceText || !translatedText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const session = await prisma.translationSession.create({
      data: {
        sourceText,
        translatedText,
        aiInsights,
        selectedWords,
        translationType,
        timeSpentSeconds,
        sourceLanguage,
        targetLanguage,
        languageProficiency,
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Failed to run translation session:', error);
    return NextResponse.json({ error: 'Failed to save translation session' }, { status: 500 });
  }
}
