'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Suspense } from 'react';

type RecordOption = { id: string; text: string; isCorrect: boolean; order: number };
type RecordQuestion = { id: string; title: string; explanation: string | null; options: RecordOption[] };
type SubmissionAnswer = { questionId: string; isCorrect: boolean; selectedOption: { text: string } };
type Submission = { id: string; attemptNumber: number; isAllCorrect: boolean; submittedAt: string; answers: SubmissionAnswer[] };
type RecordData = {
  code: string;
  status: string;
  expiresAt: string | null;
  createdAt: string;
  questions: { question: RecordQuestion }[];
  submissions: Submission[];
};

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: '진행 중', className: 'bg-primary-100 text-primary-700' },
  RETRY: { label: '재시도', className: 'bg-warning-100 text-warning-700' },
  COMPLETED: { label: '완료', className: 'bg-success-100 text-success-700' },
  FAILED: { label: '오답확인', className: 'bg-error-100 text-error-600' },
};

function RecordsContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') ?? '';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['records', code],
    queryFn: async () => {
      const res = await fetch(`/api/records/${code}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      return json.data as RecordData;
    },
    enabled: !!code,
    retry: false,
  });

  if (!code) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 py-14 text-center">
        <p className="text-sm font-medium text-neutral-700">코드를 입력해주세요</p>
        <p className="text-xs text-neutral-400">URL에 ?code=퀴즈코드를 추가하면 결과를 확인할 수 있어요.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex justify-center py-10"><div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-primary-600" /></div>;
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-error-100 bg-error-50 p-6 text-center">
        <p className="text-sm text-error-600">기록을 불러오지 못했어요. 코드를 확인해주세요.</p>
      </div>
    );
  }

  const statusInfo = STATUS_MAP[data.status] ?? { label: data.status, className: 'bg-neutral-100 text-neutral-500' };

  return (
    <div className="flex flex-col gap-6">
      {/* 요약 */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-mono text-lg font-bold tracking-[0.15em] text-primary-600">{data.code}</p>
            <p className="text-sm text-neutral-500">{new Date(data.createdAt).toLocaleDateString('ko-KR')} · {data.questions.length}문항 · {data.submissions.length}회 제출</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
        </div>
        {data.expiresAt && (
          <p className="mt-2 text-xs text-neutral-400">만료: {new Date(data.expiresAt).toLocaleString('ko-KR')}</p>
        )}
      </div>

      {/* 제출 기록 */}
      {data.submissions.map((sub) => {
        const correctCount = sub.answers.filter((a) => a.isCorrect).length;
        return (
          <div key={sub.id} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-neutral-900">
                {sub.attemptNumber}차 제출
                <span className={`ml-2 text-xs font-medium ${sub.isAllCorrect ? 'text-success-600' : 'text-error-600'}`}>
                  {sub.isAllCorrect ? '전부 정답' : `${correctCount}/${data.questions.length} 정답`}
                </span>
              </p>
              <p className="text-xs text-neutral-400">{new Date(sub.submittedAt).toLocaleString('ko-KR')}</p>
            </div>
            <ul className="flex flex-col gap-3">
              {data.questions.map((aq, idx) => {
                const answer = sub.answers.find((a) => a.questionId === aq.question.id);
                return (
                  <li key={aq.question.id} className={`rounded-xl border p-4 ${answer?.isCorrect ? 'border-success-200 bg-success-50' : 'border-error-200 bg-error-50'}`}>
                    <div className="flex items-start gap-2">
                      <span className={`shrink-0 text-sm ${answer?.isCorrect ? 'text-success-500' : 'text-error-500'}`}>{answer?.isCorrect ? '⭕' : '❌'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-neutral-700 leading-relaxed line-clamp-2">Q{idx + 1}. {aq.question.title}</p>
                        {answer && <p className="mt-1 text-xs text-neutral-500">선택: {answer.selectedOption.text}</p>}
                        {!answer?.isCorrect && <p className="mt-0.5 text-xs text-success-700">정답: {aq.question.options.find((o) => o.isCorrect)?.text}</p>}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      {/* 정답/해설 참조 */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="mb-4 font-semibold text-neutral-900">문제 정답 및 해설</p>
        <div className="flex flex-col gap-4">
          {data.questions.map((aq, idx) => (
            <div key={aq.question.id} className="border-b border-neutral-100 pb-4 last:border-b-0 last:pb-0">
              <p className="text-sm font-semibold text-neutral-900 mb-2">Q{idx + 1}. {aq.question.title}</p>
              <ul className="flex flex-col gap-1">
                {aq.question.options.map((opt) => (
                  <li key={opt.id} className={`text-xs flex items-start gap-1.5 ${opt.isCorrect ? 'text-success-700 font-semibold' : 'text-neutral-500'}`}>
                    <span>{opt.isCorrect ? '✓' : '·'}</span><span>{opt.text}</span>
                  </li>
                ))}
              </ul>
              {aq.question.explanation && (
                <div className="mt-2 rounded-lg bg-primary-50 border border-primary-100 px-3 py-2">
                  <p className="text-xs text-primary-800">{aq.question.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminRecordsPage() {
  return (
    <div className="px-6 py-10">
      <header className="mb-8 rounded-2xl bg-primary-600 px-6 py-5">
        <span className="mb-2 inline-block rounded-full bg-secondary-500 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-widest text-white">
          관리자
        </span>
        <h1 className="text-2xl font-bold text-white">채점 결과 열람</h1>
        <p className="mt-1.5 text-sm text-primary-200">퀴즈 코드로 제출 결과를 확인하세요.</p>
      </header>
      <Suspense fallback={<div className="flex justify-center py-10"><div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-primary-600" /></div>}>
        <RecordsContent />
      </Suspense>
    </div>
  );
}
