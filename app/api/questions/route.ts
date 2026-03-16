import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor');
  const limit = 7;

  const questions = await prisma.question.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      explanation: true,
      createdAt: true,
      options: {
        select: { id: true, text: true, isCorrect: true, order: true },
        orderBy: { order: 'asc' },
      },
    },
  });

  const hasNext = questions.length > limit;
  const items = hasNext ? questions.slice(0, limit) : questions;
  const nextCursor = hasNext ? items[items.length - 1].id : null;

  const total = await prisma.question.count();

  return NextResponse.json({ ok: true, data: { questions: items, nextCursor, total } });
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: '인증이 필요합니다.' }, { status: 401 });
  }

  const body = await req.json();
  const { title, explanation, options } = body as {
    title: string;
    explanation?: string;
    options: { text: string; isCorrect: boolean; order: number }[];
  };

  if (!title || !options || options.length < 2) {
    return NextResponse.json({ ok: false, error: '필수 항목을 입력해주세요.' }, { status: 400 });
  }

  const question = await prisma.question.create({
    data: {
      title,
      explanation: explanation ?? null,
      options: {
        create: options.map((o) => ({
          text: o.text,
          isCorrect: o.isCorrect,
          order: o.order,
        })),
      },
    },
    include: { options: { orderBy: { order: 'asc' } } },
  });

  return NextResponse.json({ ok: true, data: question }, { status: 201 });
}
