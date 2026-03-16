'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

type ResultQuestion = {
  id: string;
  title: string;
  options: { id: string; text: string; order: number }[];
  selectedOptionId: string | null;
  selectedOptionText: string | null;
  isCorrect: boolean;
};

type ResultData = {
  status: string;
  isAllCorrect: boolean;
  questions: ResultQuestion[];
};

export default function QuizResultPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['quiz-result', code],
    queryFn: async () => {
      const res = await fetch(`/api/quiz/${code}/result`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      return json.data as ResultData;
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-primary-600" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-2xl border border-error-100 bg-error-50 p-8 text-center">
          <p className="text-sm font-medium text-error-600">결과를 불러오지 못했어요.</p>
        </div>
      </div>
    );
  }

  const correctCount = data.questions.filter((q) => q.isCorrect).length;

  return (
    <div className="px-6 py-10">
      <header className={`mb-8 rounded-2xl px-6 py-5 ${data.isAllCorrect ? 'bg-success-600' : 'bg-warning-500'}`}>
        <h1 className="text-2xl font-bold text-white">
          {data.isAllCorrect ? '전부 맞혔어요! 🎉' : '채점 결과'}
        </h1>
        <p className="mt-1.5 text-sm text-white/80">
          {correctCount} / {data.questions.length} 정답
        </p>
      </header>

      <div className="flex flex-col gap-4 mb-8">
        {data.questions.map((question, idx) => (
          <div
            key={question.id}
            className={`rounded-2xl border p-5 ${
              question.isCorrect ? 'border-success-200 bg-success-50' : 'border-error-200 bg-error-50'
            }`}
          >
            <div className="flex items-start gap-2">
              <span className={`mt-0.5 shrink-0 text-lg ${question.isCorrect ? 'text-success-500' : 'text-error-500'}`}>
                {question.isCorrect ? '⭕' : '❌'}
              </span>
              <p className="text-sm font-semibold text-neutral-900 leading-relaxed">
                <span className="mr-1 text-neutral-500">Q{idx + 1}.</span>
                {question.title}
              </p>
            </div>
            {!question.isCorrect && question.selectedOptionText && (
              <p className="mt-2 ml-7 text-xs text-error-600">내 답: {question.selectedOptionText}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {!data.isAllCorrect && (
          <button
            onClick={() => router.push(`/quiz/${code}/retry`)}
            className="w-full rounded-xl bg-warning-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-warning-400"
          >
            오답노트 풀기
          </button>
        )}
        {data.isAllCorrect && (
          <button
            onClick={() => router.push(`/quiz/${code}/review`)}
            className="w-full rounded-xl bg-success-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-success-500"
          >
            정답 및 해설 보기
          </button>
        )}
      </div>
    </div>
  );
}
