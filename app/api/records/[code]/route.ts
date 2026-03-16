import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { code } = await params;

  const assignment = await prisma.quizAssignment.findUnique({
    where: { code },
    select: {
      id: true,
      code: true,
      status: true,
      expiresAt: true,
      createdAt: true,
      questions: {
        orderBy: { order: 'asc' },
        select: {
          question: {
            select: {
              id: true,
              title: true,
              explanation: true,
              options: {
                select: { id: true, text: true, isCorrect: true, order: true },
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      },
      submissions: {
        orderBy: { attemptNumber: 'asc' },
        select: {
          id: true,
          attemptNumber: true,
          isAllCorrect: true,
          submittedAt: true,
          answers: {
            select: {
              questionId: true,
              isCorrect: true,
              selectedOption: { select: { text: true } },
            },
          },
        },
      },
    },
  });

  if (!assignment) {
    return NextResponse.json({ ok: false, error: '존재하지 않는 코드입니다.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data: assignment });
}
