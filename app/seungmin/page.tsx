"use client";

import { useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// 편지 내용 — 이 상수만 수정하면 됩니다
// ---------------------------------------------------------------------------
const LETTER_CONTENT = {
  title: "나의 공쥬 단하💕",
  paragraphs: [
    "공쥬 안녕! 뭔가 자기한테 내가 할 수 있는 일로 서비스를 만들어주는게 처음이라 사실은 조금 부끄럽기도 하고 뭔가 어색하기도 하네 ㅋㅋㅋ",
    "그래도 뭔가 내가 가진 능력으로 자기한테 도움이 될 수 있는 일을 한다는 것은 참 기쁜 일이구나... 하면서 시간 가는 줄도 모르고 개발했던 것 같아.",
    "자기는 대충 해도 된다고는 했지만 자기가 멘토링에 직접 사용할 서비스라고 하니 절대 대충 만들 수가 없었던 것 같아. (물론 AI가 거의 다 하긴 했지만)",
    " ",
    "늘 나 덕분에 기가 살았다고, 나랑 만나서 행복하다고, 내가 귀엽다고 말해줄 때마다 내색은 부끄러워서 잘 못하긴 하는데... 사실은 기분이 너무 좋아",
    "나 역시 자기 덕분에 기가 살고, 자기랑 만나서 다행이라고, 내 삶이 행복하다고 생각해. 그리고 아무래도 나보다 자기가 더 귀엽고 예쁘고 사랑스럽긴 해 🥰",
    " ",
    "늘 로스쿨 공부하랴, 멘토링 준비하랴, 그러면서 또 달마다 호르몬이랑 싸우랴... 자기한테는 정말 힘든 시기일텐데도, 나한테는 그저 밝은 모습만 보여주려고 하는 모습이 ",
    "마음이 아프기도 하고, 한편으로는 그런 자기 모습이 너무 대단하기도 해. 자기 정말 멋진 사람인 것 같아.",
    " ",
    "오늘도 힘내느라 고생 많았어! 내가 정말 많이 사랑해 🫶🏻",
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
