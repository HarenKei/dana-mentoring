'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';

type Option = { id: string; text: string; order: number };
type Question = { id: string; title: string; order: number; options: Option[] };
type RetryData = { questions: Question[] };

export default function QuizRetryPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['quiz-retry', code],
    queryFn: async () => {
      const res = await fetch(`/api/quiz/${code}/retry`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      return json.data as RetryData;
    },
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const answerList = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId,
      }));
      const res = await fetch(`/api/quiz/${code}/retry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answerList }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      router.push(`/quiz/${code}/result`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    if (data.questions.find((q) => !answers[q.id])) {
      alert('모든 문제에 답을 선택해주세요.');
      return;
    }
    submitMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-primary-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-2xl border border-error-100 bg-error-50 p-8 text-center">
          <p className="text-sm font-medium text-error-600">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="px-6 py-10">
      <header className="mb-8 rounded-2xl bg-warning-500 px-6 py-5">
        <h1 className="text-2xl font-bold text-white">오답노트</h1>
        <p className="mt-1.5 text-sm text-white/80">틀린 문제 {data.questions.length}문항</p>
      </header>

      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-8">
          {data.questions.map((question, qIdx) => (
            <div key={question.id} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="mb-4 text-sm font-semibold text-neutral-900 leading-relaxed">
                <span className="mr-2 text-warning-600">Q{qIdx + 1}.</span>
                {question.title}
              </p>
              <ul className="flex flex-col gap-2">
                {question.options.map((option) => (
                  <li key={option.id}>
                    <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                      answers[question.id] === option.id
                        ? 'border-warning-400 bg-warning-50'
                        : 'border-neutral-200 hover:border-warning-200 hover:bg-neutral-50'
                    }`}>
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option.id}
                        checked={answers[question.id] === option.id}
                        onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: option.id }))}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-warning-500"
                      />
                      <span className="text-sm text-neutral-900">{option.text}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="text-sm text-neutral-500">{answeredCount} / {data.questions.length} 문항 답변 완료</p>
          {submitMutation.isError && (
            <p className="text-sm text-error-500">{(submitMutation.error as Error).message}</p>
          )}
          <button
            type="submit"
            disabled={submitMutation.isPending || answeredCount < data.questions.length}
            className="w-full rounded-xl bg-warning-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-warning-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitMutation.isPending ? '제출 중...' : '최종 제출'}
          </button>
        </div>
      </form>
    </div>
  );
}
