import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }

    await prisma.translationSession.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete history item:', error);
    return NextResponse.json({ error: 'Failed to delete history item' }, { status: 500 });
  }
}
