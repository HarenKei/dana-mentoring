import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateCode } from '@/lib/utils';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const assignments = await prisma.quizAssignment.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      code: true,
      status: true,
      expiresAt: true,
      createdAt: true,
      questions: { select: { id: true } },
    },
  });

  return NextResponse.json({ ok: true, data: assignments });
}

type OptionInput = { text: string; isCorrect: boolean; order: number };
type QuestionInput = { title: string; explanation?: string; options: OptionInput[] };

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: '인증이 필요합니다.' }, { status: 401 });
  }

  const body = await req.json();
  const { questions } = body as { questions: QuestionInput[] };

  if (!questions || questions.length === 0) {
    return NextResponse.json({ ok: false, error: '문제를 입력해주세요.' }, { status: 400 });
  }

  let code: string;
  do {
    code = generateCode();
  } while (await prisma.quizAssignment.findUnique({ where: { code } }));

  // 문제 생성 + 출제 묶음을 하나의 트랜잭션으로
  const assignment = await prisma.$transaction(async (tx) => {
    const createdQuestions = await Promise.all(
      questions.map((q) =>
        tx.question.create({
          data: {
            title: q.title,
            explanation: q.explanation ?? null,
            options: {
              create: q.options.map((o) => ({
                text: o.text,
                isCorrect: o.isCorrect,
                order: o.order,
              })),
            },
          },
          select: { id: true },
        })
      )
    );

    return tx.quizAssignment.create({
      data: {
        code,
        questions: {
          create: createdQuestions.map((q, index) => ({
            questionId: q.id,
            order: index,
          })),
        },
      },
      select: { id: true, code: true, status: true, createdAt: true },
    });
  });

  return NextResponse.json({ ok: true, data: assignment }, { status: 201 });
}
