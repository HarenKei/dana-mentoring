'use client';

import { useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MenteeInvite = {
  id: string;
  menteeName: string;
  code: string;
  issuedAt: Date;
};

// ---------------------------------------------------------------------------
// Mock data & helpers
// ---------------------------------------------------------------------------

const MOCK_INITIAL_INVITES: MenteeInvite[] = [
  {
    id: '1',
    menteeName: '김지원',
    code: 'AB3K9Z',
    issuedAt: new Date('2026-03-10T10:23:00'),
  },
  {
    id: '2',
    menteeName: '이서연',
    code: 'XP72WQ',
    issuedAt: new Date('2026-03-12T15:41:00'),
  },
];

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

function formatIssuedAt(date: Date): string {
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

type CopyButtonProps = {
  code: string;
};

function CopyButton({ code }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={[
        'shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150',
        copied
          ? 'bg-[--color-accent-500] text-white'
          : 'bg-[--color-surface-sunken] text-[--color-text-secondary] hover:bg-[--color-primary-100] hover:text-[--color-primary-600]',
      ].join(' ')}
      aria-label={`코드 ${code} 복사`}
    >
      {copied ? '복사됨!' : '복사'}
    </button>
  );
}

// ---------------------------------------------------------------------------

type IssuedCodeDisplayProps = {
  code: string;
};

function IssuedCodeDisplay({ code }: IssuedCodeDisplayProps) {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl bg-[--color-surface-sunken] px-4 py-3 border border-[--color-border]">
      <span className="font-mono text-2xl font-bold tracking-[0.2em] text-[--color-primary-500] select-all flex-1">
        {code}
      </span>
      <CopyButton code={code} />
    </div>
  );
}

// ---------------------------------------------------------------------------

type IssueFormProps = {
  onIssue: (menteeName: string, code: string) => void;
};

function IssueForm({ onIssue }: IssueFormProps) {
  const [menteeName, setMenteeName] = useState('');
  const [issuedCode, setIssuedCode] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = menteeName.trim();
    if (!trimmed) {
      setError('멘티 이름을 입력해주세요.');
      return;
    }

    const code = generateCode();
    setIssuedCode(code);
    setError('');
    onIssue(trimmed, code);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMenteeName(e.target.value);
    if (error) setError('');
    // Reset issued code when name changes
    setIssuedCode(null);
  };

  return (
    <section className="rounded-2xl bg-[--color-surface-raised] border border-[--color-border] p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-semibold text-[--color-text-primary]">
        코드 발급
      </h2>
      <p className="mb-5 text-sm text-[--color-text-muted]">
        멘티 이름을 입력하고 접속 코드를 발급하세요.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <label
          htmlFor="mentee-name"
          className="mb-1.5 block text-sm font-medium text-[--color-text-secondary]"
        >
          멘티 이름
        </label>
        <div className="flex gap-2">
          <input
            id="mentee-name"
            type="text"
            value={menteeName}
            onChange={handleNameChange}
            placeholder="예: 김지원"
            className={[
              'flex-1 rounded-lg border px-3.5 py-2.5 text-sm text-[--color-text-primary] bg-[--color-surface-sunken] placeholder:text-[--color-text-muted] outline-none transition-colors',
              error
                ? 'border-[--color-error-500] focus:ring-1 focus:ring-[--color-error-500]'
                : 'border-[--color-border] focus:border-[--color-border-focus] focus:ring-1 focus:ring-[--color-border-focus]',
            ].join(' ')}
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-[--color-primary-600] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[--color-primary-500] active:bg-[--color-primary-700]"
          >
            코드 발급
          </button>
        </div>

        {error && (
          <p className="mt-2 text-xs text-[--color-error-500]" role="alert">
            {error}
          </p>
        )}
      </form>

      {issuedCode && <IssuedCodeDisplay code={issuedCode} />}
    </section>
  );
}

// ---------------------------------------------------------------------------

type MenteeCardProps = {
  invite: MenteeInvite;
};

function MenteeCard({ invite }: MenteeCardProps) {
  return (
    <li className="flex flex-col gap-3 rounded-xl bg-[--color-surface-raised] border border-[--color-border] p-4 sm:flex-row sm:items-center">
      {/* Name & date */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[--color-text-primary]">
          {invite.menteeName}
        </p>
        <p className="mt-0.5 text-xs text-[--color-text-muted]">
          {formatIssuedAt(invite.issuedAt)}
        </p>
      </div>

      {/* Code chip */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-base font-bold tracking-[0.15em] text-[--color-primary-500] bg-[--color-surface-sunken] rounded-lg px-3 py-1.5 border border-[--color-border]">
          {invite.code}
        </span>
        <CopyButton code={invite.code} />
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------------

type InviteListProps = {
  invites: MenteeInvite[];
};

function InviteList({ invites }: InviteListProps) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-[--color-text-primary]">
        발급된 멘티 목록
        <span className="ml-2 rounded-full bg-[--color-primary-100] px-2.5 py-0.5 text-xs font-semibold text-[--color-primary-600]">
          {invites.length}
        </span>
      </h2>

      {invites.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[--color-border-strong] py-14 text-center">
          <span className="text-3xl">🌱</span>
          <p className="text-sm font-medium text-[--color-text-secondary]">
            아직 발급된 코드가 없어요
          </p>
          <p className="text-xs text-[--color-text-muted]">
            위 폼에서 멘티에게 접속 코드를 발급해 보세요.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {invites.map((invite) => (
            <MenteeCard key={invite.id} invite={invite} />
          ))}
        </ul>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminInvitePage() {
  const [invites, setInvites] = useState<MenteeInvite[]>(MOCK_INITIAL_INVITES);

  const handleIssue = (menteeName: string, code: string) => {
    const newInvite: MenteeInvite = {
      id: crypto.randomUUID(),
      menteeName,
      code,
      issuedAt: new Date(),
    };
    setInvites((prev) => [newInvite, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[--color-background] px-4 py-10">
      <div className="mx-auto w-full max-w-lg">
        {/* Page header */}
        <header className="mb-8">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[--color-secondary-500]">
            관리자
          </p>
          <h1 className="text-2xl font-bold text-[--color-text-primary]">
            멘티 초대 코드
          </h1>
          <p className="mt-1.5 text-sm text-[--color-text-muted]">
            멘티가 서비스에 접속할 수 있도록 코드를 발급하고 전달하세요.
          </p>
        </header>

        {/* Content */}
        <div className="flex flex-col gap-8">
          <IssueForm onIssue={handleIssue} />
          <InviteList invites={invites} />
        </div>
      </div>
    </div>
  );
}
