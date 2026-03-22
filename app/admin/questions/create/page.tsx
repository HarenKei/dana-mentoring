'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';

type OptionField = {
  text: string;
  isCorrect: boolean;
};

type QuestionFormData = {
  question: string;
  explanation: string;
  options: OptionField[];
};

type Mentee = { id: string; name: string; inviteCode: string };

const OPTION_LABELS = ['①', '②', '③', '④', '⑤'];

const DEFAULT_VALUES: QuestionFormData = {
  question: '',
  explanation: '',
  options: Array.from({ length: 5 }, () => ({ text: '', isCorrect: false })),
};

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-neutral-700">
      {children}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-error-500" role="alert">{message}</p>;
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-neutral-200 rounded-2xl bg-white p-6 shadow-sm">
      {children}
    </div>
  );
}

function MenteeCombobox({
  mentees,
  value,
  onChange,
  hasError,
}: {
  mentees: Mentee[];
  value: string;
  onChange: (id: string) => void;
  hasError: boolean;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = mentees.find((m) => m.id === value) ?? null;
  const displayName = (m: Mentee) => `${m.name} (${m.inviteCode})`;

  const filtered = query.trim()
    ? mentees.filter((m) => m.name.includes(query.trim()) || m.inviteCode.includes(query.trim()))
    : mentees;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const borderClass = hasError
    ? 'border-error-500 focus:ring-1 focus:ring-error-500'
    : 'border-neutral-200 focus:border-primary-600 focus:ring-1 focus:ring-primary-600';

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        placeholder="멘티 이름으로 검색"
        value={selected && !open ? displayName(selected) : query}
        onChange={(e) => { setQuery(e.target.value); onChange(''); if (!open) setOpen(true); }}
        onFocus={() => setOpen(true)}
        className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-neutral-900 bg-neutral-50 placeholder:text-neutral-400 outline-none transition-colors ${borderClass}`}
      />
      {open && (
        <ul className="absolute z-10 mt-1 w-full rounded-xl border border-neutral-200 bg-white shadow-md overflow-hidden">
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-neutral-400">검색 결과가 없어요</li>
          ) : (
            filtered.map((mentee) => (
              <li
                key={mentee.id}
                onMouseDown={() => { onChange(mentee.id); setQuery(''); setOpen(false); }}
                className="cursor-pointer px-4 py-2.5 text-sm text-neutral-900 hover:bg-primary-50 hover:text-primary-700"
              >
                {displayName(mentee)}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default function AdminQuestionCreatePage() {
  const router = useRouter();

  const { data: menteesData } = useQuery({
    queryKey: ['mentees'],
    queryFn: async () => {
      const res = await fetch('/api/mentees');
      const data = await res.json();
      return data.data as Mentee[];
    },
  });
  const mentees = menteesData ?? [];

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<QuestionFormData>({ defaultValues: DEFAULT_VALUES });

  const { fields } = useFieldArray({ control, name: 'options' });
  const watchedOptions = watch('options');

  const handleCorrectChange = (selectedIndex: number) => {
    fields.forEach((_, index) => {
      setValue(`options.${index}.isCorrect`, index === selectedIndex);
    });
    clearErrors('options');
  };

  const mutation = useMutation({
    mutationFn: async (data: QuestionFormData) => {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.question,
          explanation: data.explanation || undefined,
          options: data.options.map((o, i) => ({ text: o.text, isCorrect: o.isCorrect, order: i })),
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      router.push('/admin/questions');
    },
    onError: (err: Error) => {
      setError('root', { message: err.message });
    },
  });

  const onSubmit = (data: QuestionFormData) => {
    const hasCorrectAnswer = data.options.some((o) => o.isCorrect);
    if (!hasCorrectAnswer) {
      setError('options', { type: 'manual', message: '정답을 1개 선택해주세요.' });
      return;
    }
    mutation.mutate(data);
  };

  return (
    <div className="px-6 py-10">
      <header className="mb-8 rounded-2xl bg-primary-600 px-6 py-5">
        <span className="mb-2 inline-block rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-widest text-white">
          관리자
        </span>
        <h1 className="text-2xl font-bold text-white">문제 등록</h1>
        <p className="mt-1.5 text-sm text-primary-200">출제할 문제와 보기를 입력하세요.</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col gap-6">

          {/* 문제 본문 */}
          <SectionCard>
            <FieldLabel htmlFor="question">문제 본문</FieldLabel>
            <textarea
              id="question"
              rows={4}
              placeholder="문제를 입력하세요"
              {...register('question', { required: '문제 본문을 입력해주세요.' })}
              className={`w-full resize-none rounded-lg border px-3.5 py-2.5 text-sm text-neutral-900 bg-neutral-50 placeholder:text-neutral-400 outline-none transition-colors ${
                errors.question
                  ? 'border-error-500 focus:ring-1 focus:ring-error-500'
                  : 'border-neutral-200 focus:border-primary-600 focus:ring-1 focus:ring-primary-600'
              }`}
            />
            <FieldError message={errors.question?.message} />
          </SectionCard>

          {/* 해설 */}
          <SectionCard>
            <FieldLabel htmlFor="explanation">해설 (선택)</FieldLabel>
            <textarea
              id="explanation"
              rows={3}
              placeholder="정답 해설을 입력하세요 (선택사항)"
              {...register('explanation')}
              className="w-full resize-none rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-900 bg-neutral-50 placeholder:text-neutral-400 outline-none transition-colors focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
            />
          </SectionCard>

          {/* 보기 5개 */}
          <SectionCard>
            <p className="mb-4 text-sm font-medium text-neutral-700">
              보기 입력
              <span className="ml-1.5 text-xs font-normal text-neutral-400">(정답 radio 버튼을 선택하세요)</span>
            </p>
            <div className="flex flex-col gap-3">
              {fields.map((field, index) => (
                <div key={field.id}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      id={`option-correct-${index}`}
                      name="correctAnswer"
                      checked={watchedOptions[index]?.isCorrect ?? false}
                      onChange={() => handleCorrectChange(index)}
                      className="h-4 w-4 shrink-0 accent-primary-600 cursor-pointer"
                      aria-label={`${OPTION_LABELS[index]} 정답으로 선택`}
                    />
                    <span className="shrink-0 w-5 text-center text-base font-semibold text-neutral-500 select-none">
                      {OPTION_LABELS[index]}
                    </span>
                    <input
                      type="text"
                      placeholder={`보기 ${index + 1} (선택)`}
                      {...register(`options.${index}.text`)}
                      className="flex-1 rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-900 bg-neutral-50 placeholder:text-neutral-400 outline-none transition-colors focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                    />
                  </div>
                </div>
              ))}
            </div>
            {errors.options?.message && <FieldError message={errors.options.message} />}
          </SectionCard>

        </div>

        {errors.root?.message && (
          <p className="mt-4 text-sm text-error-500 text-center">{errors.root.message}</p>
        )}

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-50 active:bg-neutral-100"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-500 active:bg-primary-700 disabled:opacity-50"
          >
            {mutation.isPending ? '등록 중...' : '문제 등록'}
          </button>
        </div>
      </form>
    </div>
  );
}
