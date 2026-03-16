import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
      expiresAt: true,
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

  if (assignment.status !== 'ACTIVE') {
    return NextResponse.json({ ok: false, error: '제출할 수 없는 상태입니다.' }, { status: 400 });
  }

  if (assignment.expiresAt && new Date(assignment.expiresAt) < new Date()) {
    return NextResponse.json({ ok: false, error: '만료된 퀴즈입니다.' }, { status: 410 });
  }

  // Grade each answer
  const gradedAnswers = answers.map(({ questionId, selectedOptionId }) => {
    const question = assignment.questions.find((aq) => aq.question.id === questionId);
    const selectedOption = question?.question.options.find((o) => o.id === selectedOptionId);
    return {
      questionId,
      selectedOptionId,
      isCorrect: selectedOption?.isCorrect ?? false,
    };
  });

  const isAllCorrect = gradedAnswers.every((a) => a.isCorrect);
  const attemptCount = await prisma.submission.count({ where: { assignmentId: assignment.id } });

  const newStatus = isAllCorrect ? 'COMPLETED' : 'RETRY';
  const expiresAt = isAllCorrect ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined;

  const [submission] = await prisma.$transaction([
    prisma.submission.create({
      data: {
        assignmentId: assignment.id,
        attemptNumber: attemptCount + 1,
        isAllCorrect,
        answers: {
          create: gradedAnswers,
        },
      },
      select: { id: true },
    }),
    prisma.quizAssignment.update({
      where: { id: assignment.id },
      data: {
        status: newStatus,
        ...(expiresAt ? { expiresAt } : {}),
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    data: {
      submissionId: submission.id,
      isAllCorrect,
      newStatus,
    },
  });
}
