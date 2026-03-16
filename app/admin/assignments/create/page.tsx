'use client';

import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';

const OPTION_LABELS = ['①', '②', '③', '④', '⑤'];
const QUESTION_COUNT = 3;

type OptionField = { text: string; isCorrect: boolean };
type QuestionField = { title: string; explanation: string; options: OptionField[] };
type FormData = { questions: QuestionField[] };

function makeDefaultQuestion(): QuestionField {
  return {
    title: '',
    explanation: '',
    options: Array.from({ length: 5 }, () => ({ text: '', isCorrect: false })),
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-error-500" role="alert">{message}</p>;
}

function QuestionBlock({
  qIndex,
  control,
  register,
  watch,
  setValue,
  clearErrors,
  errors,
}: {
  qIndex: number;
  control: ReturnType<typeof useForm<FormData>>['control'];
  register: ReturnType<typeof useForm<FormData>>['register'];
  watch: ReturnType<typeof useForm<FormData>>['watch'];
  setValue: ReturnType<typeof useForm<FormData>>['setValue'];
  clearErrors: ReturnType<typeof useForm<FormData>>['clearErrors'];
  errors: ReturnType<typeof useForm<FormData>>['formState']['errors'];
}) {
  const { fields } = useFieldArray({ control, name: `questions.${qIndex}.options` });
  const watchedOptions = watch(`questions.${qIndex}.options`);

  const handleCorrectChange = (selectedIndex: number) => {
    fields.forEach((_, i) => {
      setValue(`questions.${qIndex}.options.${i}.isCorrect`, i === selectedIndex);
    });
    clearErrors(`questions.${qIndex}.options`);
  };

  const qErrors = errors.questions?.[qIndex];

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="border-b border-primary-100 border-l-4 border-l-primary-600 bg-primary-50 px-6 py-4">
        <h2 className="text-base font-semibold text-primary-700">문제 {qIndex + 1}</h2>
      </div>

      <div className="p-6 flex flex-col gap-5">
        {/* 문제 본문 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            문제 본문 <span className="text-error-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="문제를 입력하세요"
            {...register(`questions.${qIndex}.title`, { required: '문제 본문을 입력해주세요.' })}
            className={`w-full resize-none rounded-lg border px-3.5 py-2.5 text-sm text-neutral-900 bg-neutral-50 placeholder:text-neutral-400 outline-none transition-colors ${
              qErrors?.title
                ? 'border-error-500 focus:ring-1 focus:ring-error-500'
                : 'border-neutral-200 focus:border-primary-600 focus:ring-1 focus:ring-primary-600'
            }`}
          />
          <FieldError message={qErrors?.title?.message} />
        </div>

        {/* 보기 5개 */}
        <div>
          <p className="mb-3 text-sm font-medium text-neutral-700">
            보기 <span className="ml-1 text-xs font-normal text-neutral-400">(정답 라디오 버튼 선택)</span>
          </p>
          <div className="flex flex-col gap-2">
            {fields.map((field, i) => (
              <div key={field.id}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name={`correct-${qIndex}`}
                    checked={watchedOptions[i]?.isCorrect ?? false}
                    onChange={() => handleCorrectChange(i)}
                    className="h-4 w-4 shrink-0 accent-primary-600 cursor-pointer"
                    aria-label={`${OPTION_LABELS[i]} 정답`}
                  />
                  <span className="w-5 shrink-0 text-center text-base font-semibold text-neutral-500 select-none">
                    {OPTION_LABELS[i]}
                  </span>
                  <input
                    type="text"
                    placeholder={`보기 ${i + 1}`}
                    {...register(`questions.${qIndex}.options.${i}.text`, {
                      required: `보기 ${i + 1}을 입력해주세요.`,
                    })}
                    className={`flex-1 rounded-lg border px-3.5 py-2 text-sm text-neutral-900 bg-neutral-50 placeholder:text-neutral-400 outline-none transition-colors ${
                      qErrors?.options?.[i]?.text
                        ? 'border-error-500 focus:ring-1 focus:ring-error-500'
                        : 'border-neutral-200 focus:border-primary-600 focus:ring-1 focus:ring-primary-600'
                    }`}
                  />
                </div>
                <FieldError message={qErrors?.options?.[i]?.text?.message} />
              </div>
            ))}
          </div>
          {/* 정답 미선택 에러 */}
          <Controller
            control={control}
            name={`questions.${qIndex}.options`}
            rules={{
              validate: (opts) =>
                opts.some((o) => o.isCorrect) || '정답을 1개 선택해주세요.',
            }}
            render={() => <></>}
          />
          <FieldError message={qErrors?.options?.root?.message ?? (qErrors?.options as { message?: string } | undefined)?.message} />
        </div>

        {/* 해설 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            해설 <span className="text-xs font-normal text-neutral-400">(선택)</span>
          </label>
          <textarea
            rows={2}
            placeholder="정답 해설을 입력하세요"
            {...register(`questions.${qIndex}.explanation`)}
            className="w-full resize-none rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-900 bg-neutral-50 placeholder:text-neutral-400 outline-none transition-colors focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>
      </div>
    </div>
  );
}

export default function AssignmentCreatePage() {
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      questions: Array.from({ length: QUESTION_COUNT }, makeDefaultQuestion),
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: data.questions.map((q) => ({
            title: q.title,
            explanation: q.explanation || undefined,
            options: q.options.map((o, i) => ({ text: o.text, isCorrect: o.isCorrect, order: i })),
          })),
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      router.push('/admin/assignments');
    },
    onError: (err: Error) => {
      setError('root', { message: err.message });
    },
  });

  const onSubmit = (data: FormData) => {
    // 각 문제에 정답이 선택됐는지 검증
    let hasError = false;
    data.questions.forEach((q, i) => {
      if (!q.options.some((o) => o.isCorrect)) {
        setError(`questions.${i}.options`, { type: 'manual', message: '정답을 1개 선택해주세요.' });
        hasError = true;
      }
    });
    if (hasError) return;
    mutation.mutate(data);
  };

  return (
    <div className="px-6 py-10">
      <header className="mb-8 rounded-2xl bg-primary-600 px-6 py-5">
        <span className="mb-2 inline-block rounded-full bg-secondary-500 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-widest text-white">
          관리자
        </span>
        <h1 className="text-2xl font-bold text-white">문제 출제</h1>
        <p className="mt-1.5 text-sm text-primary-200">
          3문제를 입력하면 퀴즈 코드가 발급됩니다.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col gap-6">
          {Array.from({ length: QUESTION_COUNT }, (_, i) => (
            <QuestionBlock
              key={i}
              qIndex={i}
              control={control}
              register={register}
              watch={watch}
              setValue={setValue}
              clearErrors={clearErrors}
              errors={errors}
            />
          ))}
        </div>

        {errors.root?.message && (
          <p className="mt-4 text-sm text-error-500 text-center">{errors.root.message}</p>
        )}

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-500 disabled:opacity-50"
          >
            {mutation.isPending ? '출제 중...' : '코드 발급 및 출제'}
          </button>
        </div>
      </form>
    </div>
  );
}
