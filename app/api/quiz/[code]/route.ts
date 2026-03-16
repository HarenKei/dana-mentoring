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
      code: true,
      status: true,
      expiresAt: true,
      questions: {
        orderBy: { order: 'asc' },
        select: {
          order: true,
          question: {
            select: {
              id: true,
              title: true,
              options: {
                select: { id: true, text: true, order: true },
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

  if (
    assignment.expiresAt &&
    new Date(assignment.expiresAt) < new Date() &&
    (assignment.status === 'ACTIVE' || assignment.status === 'RETRY')
  ) {
    return NextResponse.json({ ok: false, error: '만료된 퀴즈입니다.' }, { status: 410 });
  }

  if (assignment.status === 'COMPLETED' || assignment.status === 'FAILED') {
    return NextResponse.json({ ok: false, error: '이미 완료된 퀴즈입니다.', status: assignment.status }, { status: 200 });
  }

  if (assignment.status !== 'ACTIVE') {
    return NextResponse.json({ ok: false, error: '현재 접근할 수 없는 퀴즈입니다.' }, { status: 403 });
  }

  return NextResponse.json({
    ok: true,
    data: {
      code: assignment.code,
      questions: assignment.questions.map((aq) => ({
        id: aq.question.id,
        title: aq.question.title,
        order: aq.order,
        options: aq.question.options,
      })),
    },
  });
}
