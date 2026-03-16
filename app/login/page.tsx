'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? '로그인에 실패했습니다.');
        return;
      }
      router.push('/admin/assignments');
      router.refresh();
    } catch {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-primary-700">다나 멘토링</h1>
          <p className="mt-1.5 text-sm text-neutral-500">관리자 로그인</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-neutral-700">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            placeholder="비밀번호를 입력하세요"
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-neutral-900 bg-neutral-50 placeholder:text-neutral-400 outline-none transition-colors ${
              error
                ? 'border-error-500 focus:ring-1 focus:ring-error-500'
                : 'border-neutral-200 focus:border-primary-600 focus:ring-1 focus:ring-primary-600'
            }`}
          />
          {error && <p className="mt-2 text-xs text-error-500" role="alert">{error}</p>}

          <button
            type="submit"
            disabled={loading || !password}
            className="mt-4 w-full rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-500 active:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
