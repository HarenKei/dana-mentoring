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
          answers: {
            where: { isCorrect: false },
            select: { questionId: true },
          },
        },
      },
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

  if (assignment.status !== 'RETRY') {
    return NextResponse.json({ ok: false, error: '오답노트를 풀 수 없는 상태입니다.' }, { status: 400 });
  }

  const wrongQuestionIds = new Set(
    assignment.submissions[0]?.answers.map((a) => a.questionId) ?? []
  );

  const wrongQuestions = assignment.questions
    .filter((aq) => wrongQuestionIds.has(aq.question.id))
    .map((aq) => ({
      id: aq.question.id,
      title: aq.question.title,
      order: aq.order,
      options: aq.question.options,
    }));

  return NextResponse.json({ ok: true, data: { questions: wrongQuestions } });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const body = await req.json();
  const answers: { questionId: string; selectedOptionId: string }[] = body.answers;

  const assignment = await prisma.quizAssignment.findUnique({
    where: { code },
    select: {
      id: true,
      status: true,
      questions: {
        select: {
          question: {
            select: {
              id: true,
              options: { select: { id: true, isCorrect: true } },
            },
          },
        },
      },
    },
  });

  if (!assignment) {
    return NextResponse.json({ ok: false, error: '존재하지 않는 코드입니다.' }, { status: 404 });
  }

  if (assignment.status !== 'RETRY') {
    return NextResponse.json({ ok: false, error: '제출할 수 없는 상태입니다.' }, { status: 400 });
  }

  const gradedAnswers = answers.map(({ questionId, selectedOptionId }) => {
    const question = assignment.questions.find((aq) => aq.question.id === questionId);
    const selectedOption = question?.question.options.find((o) => o.id === selectedOptionId);
    return { questionId, selectedOptionId, isCorrect: selectedOption?.isCorrect ?? false };
  });

  const isAllCorrect = gradedAnswers.every((a) => a.isCorrect);
  const attemptCount = await prisma.submission.count({ where: { assignmentId: assignment.id } });
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.submission.create({
      data: {
        assignmentId: assignment.id,
        attemptNumber: attemptCount + 1,
        isAllCorrect,
        answers: { create: gradedAnswers },
      },
    }),
    prisma.quizAssignment.update({
      where: { id: assignment.id },
      data: { status: isAllCorrect ? 'COMPLETED' : 'FAILED', expiresAt },
    }),
  ]);

  return NextResponse.json({ ok: true, data: { isAllCorrect, newStatus: isAllCorrect ? 'COMPLETED' : 'FAILED' } });
}
