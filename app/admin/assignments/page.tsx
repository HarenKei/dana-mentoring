'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

type Assignment = {
  id: string;
  code: string;
  status: 'ACTIVE' | 'RETRY' | 'COMPLETED' | 'FAILED';
  expiresAt: string | null;
  createdAt: string;
  questions: { id: string }[];
};

const STATUS_LABEL: Record<Assignment['status'], string> = {
  ACTIVE: '진행 중',
  RETRY: '재시도',
  COMPLETED: '완료',
  FAILED: '오답확인',
};

const STATUS_CLASS: Record<Assignment['status'] | 'EXPIRED', string> = {
  ACTIVE: 'bg-primary-100 text-primary-700',
  RETRY: 'bg-warning-100 text-warning-700',
  COMPLETED: 'bg-success-100 text-success-700',
  FAILED: 'bg-error-100 text-error-600',
  EXPIRED: 'bg-neutral-100 text-neutral-500',
};

function getDisplayStatus(assignment: Assignment) {
  if (
    assignment.expiresAt &&
    new Date(assignment.expiresAt) < new Date() &&
    (assignment.status === 'ACTIVE' || assignment.status === 'RETRY')
  ) {
    return { label: '만료', className: STATUS_CLASS.EXPIRED };
  }
  return { label: STATUS_LABEL[assignment.status], className: STATUS_CLASS[assignment.status] };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
}

function CopyLinkButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    const url = `${window.location.origin}/quiz/${code}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
        copied ? 'bg-accent-500 text-white' : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
      }`}
    >
      {copied ? '복사됨!' : '링크 복사'}
    </button>
  );
}

function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const { label, className } = getDisplayStatus(assignment);
  return (
    <li className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-base font-bold tracking-[0.15em] text-primary-600">
              {assignment.code}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}>
              {label}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-neutral-400">
            {assignment.questions.length}문항 · {formatDate(assignment.createdAt)}
            {assignment.expiresAt && (
              <span className="ml-2">만료: {new Date(assignment.expiresAt).toLocaleString('ko-KR')}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <CopyLinkButton code={assignment.code} />
          <Link
            href={`/admin/records?code=${assignment.code}`}
            className="rounded-md px-3 py-1.5 text-xs font-medium bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors"
          >
            결과 보기
          </Link>
        </div>
      </div>
    </li>
  );
}

export default function AssignmentsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const res = await fetch('/api/assignments');
      const data = await res.json();
      return data.data as Assignment[];
    },
  });

  const assignments = data ?? [];

  return (
    <div className="px-6 py-10">
      <header className="mb-8 rounded-2xl bg-primary-600 px-6 py-5">
        <span className="mb-2 inline-block rounded-full bg-secondary-500 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-widest text-white">
          관리자
        </span>
        <h1 className="text-2xl font-bold text-white">출제 목록</h1>
        <p className="mt-1.5 text-sm text-primary-200">출제한 퀴즈의 현황을 확인하고 관리하세요.</p>
      </header>

      <div className="mb-4 flex justify-end">
        <Link
          href="/admin/assignments/create"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500 transition-colors"
        >
          + 문제 출제
        </Link>
      </div>

      {isError ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-error-100 bg-error-50 py-10 text-center">
          <p className="text-sm font-medium text-error-600">목록을 불러오지 못했어요</p>
          <button onClick={() => refetch()} className="rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white">다시 시도</button>
        </div>
      ) : isLoading ? (
        <ul className="flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i} className="h-20 rounded-xl border border-neutral-200 bg-white animate-pulse" />
          ))}
        </ul>
      ) : assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 py-14 text-center">
          <p className="text-sm font-medium text-neutral-700">아직 출제된 퀴즈가 없어요</p>
          <p className="text-xs text-neutral-400">오른쪽 상단 버튼으로 문제를 출제해보세요.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {assignments.map((a) => <AssignmentCard key={a.id} assignment={a} />)}
        </ul>
      )}
    </div>
  );
}
