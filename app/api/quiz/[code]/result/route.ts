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
      submissions: {
        orderBy: { attemptNumber: 'desc' },
        take: 1,
        select: {
          id: true,
          isAllCorrect: true,
          answers: {
            select: {
              questionId: true,
              selectedOptionId: true,
              isCorrect: true,
              selectedOption: { select: { text: true } },
            },
          },
        },
      },
      questions: {
        orderBy: { order: 'asc' },
        select: {
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

  const latestSubmission = assignment.submissions[0];
  if (!latestSubmission) {
    return NextResponse.json({ ok: false, error: '제출 기록이 없습니다.' }, { status: 404 });
  }

  const questionsWithResults = assignment.questions.map((aq) => {
    const answer = latestSubmission.answers.find((a) => a.questionId === aq.question.id);
    return {
      id: aq.question.id,
      title: aq.question.title,
      options: aq.question.options,
      selectedOptionId: answer?.selectedOptionId ?? null,
      selectedOptionText: answer?.selectedOption?.text ?? null,
      isCorrect: answer?.isCorrect ?? false,
    };
  });

  return NextResponse.json({
    ok: true,
    data: {
      status: assignment.status,
      isAllCorrect: latestSubmission.isAllCorrect,
      questions: questionsWithResults,
    },
  });
}
