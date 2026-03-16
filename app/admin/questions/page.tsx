'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useInfiniteQuery } from '@tanstack/react-query';

type QuestionItem = {
  id: string;
  title: string;
  createdAt: string;
};

type QuestionsPage = {
  questions: QuestionItem[];
  nextCursor: string | null;
  total: number;
};

async function fetchQuestions(cursor: string | null): Promise<QuestionsPage> {
  const params = cursor ? `?cursor=${cursor}` : '';
  const res = await fetch(`/api/questions${params}`);
  const data = await res.json();
  return data.data;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
}

function QuestionCard({ question }: { question: QuestionItem }) {
  return (
    <li className="rounded-xl border border-neutral-200 bg-white p-4 hover:border-primary-200 hover:shadow-sm transition-all duration-150">
      <p className="text-sm font-semibold text-neutral-900 leading-snug line-clamp-2">
        {question.title}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-neutral-400">{formatDate(question.createdAt)}</span>
      </div>
    </li>
  );
}

function QuestionCardSkeleton() {
  return (
    <li className="rounded-xl border border-neutral-200 bg-white p-4 animate-pulse">
      <div className="h-4 flex-1 rounded bg-neutral-100" />
      <div className="mt-3 flex items-center gap-2">
        <div className="h-4 w-16 rounded-full bg-neutral-100" />
      </div>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 py-14 text-center">
      <p className="text-sm font-medium text-neutral-700">아직 출제된 문제가 없어요</p>
      <p className="text-xs text-neutral-400">문제를 추가하면 여기에 표시됩니다.</p>
    </div>
  );
}

export default function AdminQuestionsPage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['admin', 'questions'],
    queryFn: ({ pageParam }) => fetchQuestions(pageParam as string | null),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '120px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allQuestions = data?.pages.flatMap((p) => p.questions) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  return (
    <div className="px-6 py-10">
      <header className="mb-8 rounded-2xl bg-primary-600 px-6 py-5">
        <span className="mb-2 inline-block rounded-full bg-secondary-500 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-widest text-white">
          관리자
        </span>
        <h1 className="text-2xl font-bold text-white">문제 목록</h1>
        <p className="mt-1.5 text-sm text-primary-200">
          다나가 출제한 문제를 확인하고 관리하세요.
          {total > 0 && <span className="ml-2 font-semibold text-white">총 {total}개</span>}
        </p>
      </header>

      <div className="mb-4 flex justify-end">
        <Link
          href="/admin/questions/create"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500 transition-colors"
        >
          + 문제 만들기
        </Link>
      </div>

      {isError ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-error-100 bg-error-50 py-10 text-center">
          <p className="text-sm font-medium text-error-600">문제 목록을 불러오지 못했어요</p>
          <button
            onClick={() => refetch()}
            className="rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-500 transition-colors"
          >
            다시 시도
          </button>
        </div>
      ) : isLoading ? (
        <ul className="flex flex-col gap-3">
          {Array.from({ length: 7 }, (_, i) => <QuestionCardSkeleton key={i} />)}
        </ul>
      ) : allQuestions.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {allQuestions.map((q) => <QuestionCard key={q.id} question={q} />)}
          </ul>
          <div ref={sentinelRef}>
            {isFetchingNextPage && (
              <div className="flex justify-center py-6">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-primary-600" />
              </div>
            )}
            {!hasNextPage && allQuestions.length > 0 && (
              <p className="py-6 text-center text-sm text-neutral-400">모든 문제를 불러왔어요</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
