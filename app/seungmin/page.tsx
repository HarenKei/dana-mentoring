"use client";

import { useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// 편지 내용 — 이 상수만 수정하면 됩니다
// ---------------------------------------------------------------------------
const LETTER_CONTENT = {
  title: "나의 공쥬 단하💕",
  paragraphs: [
    "이 페이지를 발견했다면 ",
    "이걸 만들면서 계속 네 생각이 났어. 별거 아닌 것도 같이 있으면 재밌고, 혼자 있을 때도 네가 떠오르는 게 참 신기하더라고.",
    "매일 옆에 있어줘서 고마워. 잘 표현 못 할 때도 많은데, 그래도 알아주면 좋겠어.",
    "앞으로도 이것저것 많이 같이 해보자. 맛있는 것도 먹고, 어디도 가고, 별거 없어도 그냥 같이.",
    "오늘도 수고했어. 사랑해.",
  ],
  closing: "From. 승민",
  date: "2026년 3월",
};
// ---------------------------------------------------------------------------

type LetterContent = typeof LETTER_CONTENT;

function EnvelopeIcon() {
  return (
    <div className="flex justify-center mb-8">
      <div className="relative w-16 h-12">
        {/* 봉투 본체 */}
        <div className="absolute inset-0 bg-primary-100 border-2 border-primary-200 rounded-sm" />
        {/* 봉투 뚜껑 삼각형 */}
        <div
          className="absolute top-0 left-0 w-0 h-0"
          style={{
            borderLeft: "32px solid transparent",
            borderRight: "32px solid transparent",
            borderTop: "22px solid #8fcbb0",
          }}
        />
        {/* 봉투 중앙 접힘선 */}
        <div
          className="absolute bottom-0 left-0 w-0 h-0"
          style={{
            borderLeft: "32px solid transparent",
            borderRight: "32px solid transparent",
            borderBottom: "18px solid #c2e3d2",
          }}
        />
      </div>
    </div>
  );
}

function LetterDate({ date }: { date: string }) {
  return (
    <p className="text-right text-sm text-neutral-400 mb-6 tracking-wide">
      {date}
    </p>
  );
}

function LetterTitle({ title }: { title: string }) {
  return (
    <h1 className="text-2xl font-semibold text-primary-600 leading-snug mb-6">
      {title}
    </h1>
  );
}

function LetterBody({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="space-y-5">
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          className="text-neutral-900 text-base leading-8 tracking-wide"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function LetterSignature({ closing }: { closing: string }) {
  return (
    <div className="mt-12 flex flex-col items-end gap-1">
      <div className="w-16 h-px bg-primary-200 mb-3" />
      <p className="text-lg font-medium text-primary-600 tracking-widest">
        {closing}
      </p>
    </div>
  );
}

function LetterCard({ content }: { content: LetterContent }) {
  return (
    <div
      className="
        relative
        rounded-2xl
        border border-secondary-300
        shadow-sm
        px-8 py-10
        sm:px-12 sm:py-14
      "
      style={{ backgroundColor: "#fdfaf4" }}
    >
      {/* 편지지 줄 느낌의 미묘한 수평 구분선 */}
      <div className="absolute inset-x-8 top-20 h-px bg-secondary-300 opacity-30 sm:inset-x-12" />

      <LetterDate date={content.date} />
      <LetterTitle title={content.title} />
      <LetterBody paragraphs={content.paragraphs} />
      <LetterSignature closing={content.closing} />
    </div>
  );
}

function PageBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-primary-50 px-4 py-16 sm:py-24">
      {children}
    </div>
  );
}

export default function SeungminPage() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  return (
    <PageBackground>
      <div
        className={`
          transition-all duration-700 ease-out
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
        `}
      >
        <EnvelopeIcon />
        <LetterCard content={LETTER_CONTENT} />
      </div>
    </PageBackground>
  );
}
