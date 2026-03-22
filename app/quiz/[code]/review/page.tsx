'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

const OPTION_LABELS = ['①', '②', '③', '④', '⑤'];

type ReviewOption = { id: string; text: string; isCorrect: boolean; order: number };
type ReviewQuestion = {
  id: string;
  title: string;
  explanation: string | null;
  options: ReviewOption[];
  correctOptionId: string | null;
};
type ReviewData = { status: string; questions: ReviewQuestion[] };

export default function QuizReviewPage() {
  const { code } = useParams<{ code: string }>();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['quiz-review', code],
    queryFn: async () => {
      const res = await fetch(`/api/quiz/${code}/review`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      return json.data as ReviewData;
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
          <p className="text-sm font-medium text-error-600">
            {(error as Error)?.message ?? '해설을 불러오지 못했어요.'}
          </p>
        </div>
      </div>
    );
  }

  const isFailed = data.status === 'FAILED';

  return (
    <div className="px-6 py-10">
      <header className={`mb-8 rounded-2xl px-6 py-5 ${isFailed ? 'bg-error-500' : 'bg-success-600'}`}>
        <h1 className="text-2xl font-bold text-white">정답 및 해설</h1>
        <p className="mt-1.5 text-sm text-white/80">{isFailed ? '오답 확인' : '전체 정답 달성'}</p>
      </header>

      <div className="flex flex-col gap-6">
        {data.questions.map((question, idx) => (
          <div key={question.id} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="mb-4 text-sm font-semibold text-neutral-900 leading-relaxed">
              <span className="mr-2 text-primary-600">Q{idx + 1}.</span>
              {question.title}
            </p>
            <ul className="flex flex-col gap-2 mb-4">
              {question.options.map((option) => (
                <li
                  key={option.id}
                  className={`flex items-start gap-3 rounded-xl border p-3 ${
                    option.isCorrect ? 'border-success-300 bg-success-50' : 'border-neutral-100 bg-neutral-50'
                  }`}
                >
                  <span className={`mt-0.5 shrink-0 text-sm font-bold ${option.isCorrect ? 'text-success-600' : 'text-neutral-400'}`}>
                    {OPTION_LABELS[option.order]}
                  </span>
                  <span className={`text-sm ${option.isCorrect ? 'font-semibold text-success-700' : 'text-neutral-600'}`}>
                    {option.text || OPTION_LABELS[option.order]}
                  </span>
                </li>
              ))}
            </ul>
            {question.explanation && (
              <div className="rounded-xl border border-primary-100 bg-primary-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary-500 mb-1">해설</p>
                <p className="text-sm text-primary-800 leading-relaxed">{question.explanation}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
