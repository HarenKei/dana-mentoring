'use client';

import { useState } from 'react';

type MenteeInvite = {
  id: string;
  menteeName: string;
  code: string;
  issuedAt: Date;
};

const MOCK_INITIAL_INVITES: MenteeInvite[] = [
  { id: '1', menteeName: '김지원', code: 'AB3K9Z', issuedAt: new Date('2026-03-10T10:23:00') },
  { id: '2', menteeName: '이서연', code: 'XP72WQ', issuedAt: new Date('2026-03-12T15:41:00') },
];

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function formatIssuedAt(date: Date): string {
  return date.toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
        copied
          ? 'bg-accent-500 text-white'
          : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
      }`}
      aria-label={`코드 ${code} 복사`}
    >
      {copied ? '복사됨!' : '복사'}
    </button>
  );
}

function IssuedCodeDisplay({ code }: { code: string }) {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl bg-primary-50 border border-primary-200 px-4 py-3">
      <span className="flex-1 select-all font-mono text-2xl font-bold tracking-[0.2em] text-primary-600">
        {code}
      </span>
      <CopyButton code={code} />
    </div>
  );
}

function IssueForm({ onIssue }: { onIssue: (menteeName: string, code: string) => void }) {
  const [menteeName, setMenteeName] = useState('');
  const [issuedCode, setIssuedCode] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = menteeName.trim();
    if (!trimmed) { setError('멘티 이름을 입력해주세요.'); return; }
    const code = generateCode();
    setIssuedCode(code);
    setError('');
    onIssue(trimmed, code);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMenteeName(e.target.value);
    if (error) setError('');
    setIssuedCode(null);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-primary-100 border-l-4 border-l-primary-600 bg-primary-50 px-6 py-4">
        <h2 className="mb-0.5 text-lg font-semibold text-primary-700">코드 발급</h2>
        <p className="text-sm text-primary-500">멘티 이름을 입력하고 접속 코드를 발급하세요.</p>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="mentee-name" className="mb-1.5 block text-sm font-medium text-neutral-700">
            멘티 이름
          </label>
          <div className="flex gap-2">
            <input
              id="mentee-name"
              type="text"
              value={menteeName}
              onChange={handleNameChange}
              placeholder="예: 김지원"
              className={`flex-1 rounded-lg border px-3.5 py-2.5 text-sm text-neutral-900 bg-neutral-50 placeholder:text-neutral-400 outline-none transition-colors ${
                error
                  ? 'border-error-500 focus:ring-1 focus:ring-error-500'
                  : 'border-neutral-200 focus:border-primary-600 focus:ring-1 focus:ring-primary-600'
              }`}
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-500 active:bg-primary-700"
            >
              코드 발급
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-error-500" role="alert">{error}</p>}
        </form>
        {issuedCode && <IssuedCodeDisplay code={issuedCode} />}
      </div>
    </section>
  );
}

function MenteeCard({ invite }: { invite: MenteeInvite }) {
  return (
    <li className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-neutral-900">{invite.menteeName}</p>
        <p className="mt-0.5 text-xs text-neutral-400">{formatIssuedAt(invite.issuedAt)}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-lg border border-primary-200 bg-primary-100 px-3 py-1.5 font-mono text-base font-bold tracking-[0.15em] text-primary-700">
          {invite.code}
        </span>
        <CopyButton code={invite.code} />
      </div>
    </li>
  );
}

function InviteList({ invites }: { invites: MenteeInvite[] }) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-neutral-900">
        발급된 멘티 목록
        <span className="ml-2 rounded-full bg-primary-600 px-2.5 py-0.5 text-xs font-semibold text-white">
          {invites.length}
        </span>
      </h2>
      {invites.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 py-14 text-center">
          <span className="text-3xl">🌱</span>
          <p className="text-sm font-medium text-neutral-700">아직 발급된 코드가 없어요</p>
          <p className="text-xs text-neutral-400">위 폼에서 멘티에게 접속 코드를 발급해 보세요.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {invites.map((invite) => <MenteeCard key={invite.id} invite={invite} />)}
        </ul>
      )}
    </section>
  );
}

export default function AdminInvitePage() {
  const [invites, setInvites] = useState<MenteeInvite[]>(MOCK_INITIAL_INVITES);

  const handleIssue = (menteeName: string, code: string) => {
    setInvites((prev) => [
      { id: crypto.randomUUID(), menteeName, code, issuedAt: new Date() },
      ...prev,
    ]);
  };

  return (
    <div className="px-6 py-10">
        <header className="mb-8 rounded-2xl bg-primary-600 px-6 py-5">
          <span className="mb-2 inline-block rounded-full bg-secondary-500 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-widest text-white">
            관리자
          </span>
          <h1 className="text-2xl font-bold text-white">멘티 초대 코드</h1>
          <p className="mt-1.5 text-sm text-primary-200">
            멘티가 서비스에 접속할 수 있도록 코드를 발급하고 전달하세요.
          </p>
        </header>
        <div className="flex flex-col gap-8">
          <IssueForm onIssue={handleIssue} />
          <InviteList invites={invites} />
        </div>
      </div>
  );
}
