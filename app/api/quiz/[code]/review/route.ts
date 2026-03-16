import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const assignment = await prisma.quizAssignment.findUnique({
    where: { code },
    select: {
      id: true,
      status: true,
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
    },
  });

  if (!assignment) {
    return NextResponse.json({ ok: false, error: '존재하지 않는 코드입니다.' }, { status: 404 });
  }

  if (assignment.status !== 'COMPLETED' && assignment.status !== 'FAILED') {
    return NextResponse.json({ ok: false, error: '아직 해설을 볼 수 없습니다.' }, { status: 403 });
  }

  return NextResponse.json({
    ok: true,
    data: {
      status: assignment.status,
      questions: assignment.questions.map((aq) => ({
        id: aq.question.id,
        title: aq.question.title,
        explanation: aq.question.explanation,
        options: aq.question.options,
        correctOptionId: aq.question.options.find((o) => o.isCorrect)?.id ?? null,
      })),
    },
  });
}
