'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useInfiniteQuery } from '@tanstack/react-query';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Option = {
  text: string;
  isCorrect: boolean;
};

type Question = {
  id: string;
  question: string;
  options: Option[];
  createdAt: Date;
  menteeName: string;
};

type QuestionsPage = {
  questions: Question[];
  nextPage: number | null;
};

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_QUESTIONS: Question[] = [
  // ── 민사법 ──────────────────────────────────────────────────────────────
  {
    id: '1', createdAt: new Date('2026-01-05'), menteeName: '승민',
    question: '甲은 자신의 토지를 乙에게 매도하는 계약을 체결하고 계약금을 수령하였으나, 아직 소유권이전등기를 마치지 않은 상태이다. 다음 중 옳은 것은?',
    options: [
      { text: '乙은 등기 없이도 소유권을 취득한다.', isCorrect: false },
      { text: '甲은 소유권이전등기를 마치기 전까지 제3자에게 해당 토지를 처분할 수 없다.', isCorrect: false },
      { text: '乙은 소유권이전등기를 마쳐야 비로소 甲에 대해 소유권이전을 청구할 수 있다.', isCorrect: false },
      { text: '乙은 소유권이전등기를 마쳐야 비로소 토지의 소유권을 취득한다.', isCorrect: true },
      { text: '甲이 제3자에게 이중으로 소유권이전등기를 마친 경우, 乙은 제3자에게 소유권을 주장할 수 있다.', isCorrect: false },
    ],
  },
  {
    id: '2', createdAt: new Date('2026-01-10'), menteeName: '승민',
    question: '불법행위로 인한 손해배상청구권의 소멸시효에 관한 설명으로 옳은 것은?',
    options: [
      { text: '손해 및 가해자를 안 날로부터 10년이다.', isCorrect: false },
      { text: '불법행위를 한 날로부터 3년이다.', isCorrect: false },
      { text: '손해 및 가해자를 안 날로부터 3년, 불법행위일로부터 10년이다.', isCorrect: true },
      { text: '손해 및 가해자를 안 날로부터 5년이다.', isCorrect: false },
      { text: '불법행위를 한 날로부터 20년이다.', isCorrect: false },
    ],
  },
  {
    id: '3', createdAt: new Date('2026-01-20'), menteeName: '승민',
    question: '甲은 乙 소유의 X 부동산에 대해 유치권을 주장하고 있다. 다음 중 유치권의 성립 요건으로 틀린 것은?',
    options: [
      { text: '채권이 목적물에 관하여 생긴 것이어야 한다.', isCorrect: false },
      { text: '채권이 변제기에 있어야 한다.', isCorrect: false },
      { text: '목적물을 점유하고 있어야 한다.', isCorrect: false },
      { text: '유치권 배제 특약이 없어야 한다.', isCorrect: false },
      { text: '채권이 서면으로 작성되어야 한다.', isCorrect: true },
    ],
  },
  {
    id: '4', createdAt: new Date('2026-02-03'), menteeName: '승민',
    question: '계약의 해제에 관한 설명으로 옳지 않은 것은?',
    options: [
      { text: '해제권은 형성권이다.', isCorrect: false },
      { text: '계약이 해제되면 원상회복 의무가 발생한다.', isCorrect: false },
      { text: '해제의 의사표시는 상대방에게 도달하여야 효력이 생긴다.', isCorrect: false },
      { text: '계약 해제 후에도 손해배상을 청구할 수 없다.', isCorrect: true },
      { text: '당사자 일방이 수인인 경우 해제는 전원으로부터 또는 전원에 대하여 하여야 한다.', isCorrect: false },
    ],
  },
  {
    id: '5', createdAt: new Date('2026-02-15'), menteeName: '승민',
    question: '성년후견제도에 관한 설명으로 옳은 것은?',
    options: [
      { text: '피성년후견인은 모든 법률행위를 할 수 없다.', isCorrect: false },
      { text: '성년후견은 가정법원의 심판으로 개시된다.', isCorrect: true },
      { text: '피성년후견인의 일용품 구입도 취소할 수 있다.', isCorrect: false },
      { text: '성년후견인은 반드시 친족이어야 한다.', isCorrect: false },
      { text: '성년후견 개시의 원인이 소멸하여도 심판 취소 없이 종료된다.', isCorrect: false },
    ],
  },
  {
    id: '6', createdAt: new Date('2026-02-25'), menteeName: '승민',
    question: '근저당권에 관한 설명으로 옳지 않은 것은?',
    options: [
      { text: '근저당권은 피담보채권의 최고액을 정하여 등기하여야 한다.', isCorrect: false },
      { text: '근저당권의 피담보채권은 결산기에 확정된다.', isCorrect: false },
      { text: '근저당권 설정 후 피담보채권이 일시 소멸해도 근저당권은 소멸하지 않는다.', isCorrect: false },
      { text: '근저당권은 저당권의 일종으로 부종성이 엄격하게 적용된다.', isCorrect: true },
      { text: '채권최고액 범위 내라면 이자도 담보된다.', isCorrect: false },
    ],
  },
  {
    id: '7', createdAt: new Date('2026-03-05'), menteeName: '승민',
    question: '불법원인급여에 관한 설명으로 옳은 것은?',
    options: [
      { text: '불법원인급여는 언제나 반환청구가 가능하다.', isCorrect: false },
      { text: '수익자에게만 불법원인이 있어도 반환청구가 배제된다.', isCorrect: true },
      { text: '불법원인이 급여자에게만 있으면 반환청구가 배제된다.', isCorrect: false },
      { text: '반사회적 법률행위의 경우 항상 부당이득반환이 인정된다.', isCorrect: false },
      { text: '불법원인급여에서의 불법은 형사상 범죄만을 의미한다.', isCorrect: false },
    ],
  },
  {
    id: '8', createdAt: new Date('2026-03-10'), menteeName: '승민',
    question: '표현대리에 관한 설명으로 옳지 않은 것은?',
    options: [
      { text: '표현대리가 성립하면 본인은 그 법률효과를 받는다.', isCorrect: false },
      { text: '표현대리는 무권대리의 일종이다.', isCorrect: false },
      { text: '상대방이 선의·무과실이어야 표현대리가 성립한다.', isCorrect: false },
      { text: '표현대리가 성립하면 상대방은 본인에게만 책임을 물을 수 있다.', isCorrect: false },
      { text: '표현대리는 본인의 귀책사유가 없어도 성립한다.', isCorrect: true },
    ],
  },
  // ── 형사법 ──────────────────────────────────────────────────────────────
  {
    id: '9', createdAt: new Date('2026-01-08'), menteeName: '승민',
    question: '죄형법정주의의 파생원칙에 해당하지 않는 것은?',
    options: [
      { text: '관습형법 금지의 원칙', isCorrect: false },
      { text: '소급효 금지의 원칙', isCorrect: false },
      { text: '유추해석 금지의 원칙', isCorrect: false },
      { text: '명확성의 원칙', isCorrect: false },
      { text: '신의성실의 원칙', isCorrect: true },
    ],
  },
  {
    id: '10', createdAt: new Date('2026-01-18'), menteeName: '승민',
    question: '고의에 관한 설명으로 옳은 것은?',
    options: [
      { text: '미필적 고의는 인식 없는 과실과 같다.', isCorrect: false },
      { text: '결과의 발생을 의욕하는 경우만 고의이다.', isCorrect: false },
      { text: '미필적 고의는 결과발생의 가능성을 인식하면서도 감수한 경우이다.', isCorrect: true },
      { text: '고의는 객관적 구성요건요소이다.', isCorrect: false },
      { text: '불확정적 고의는 고의로 인정되지 않는다.', isCorrect: false },
    ],
  },
  {
    id: '11', createdAt: new Date('2026-02-01'), menteeName: '승민',
    question: '정당방위의 성립 요건에 관한 설명으로 옳지 않은 것은?',
    options: [
      { text: '현재의 부당한 침해가 있어야 한다.', isCorrect: false },
      { text: '방위행위는 상당한 이유가 있어야 한다.', isCorrect: false },
      { text: '자기 또는 타인의 법익을 방위하기 위한 것이어야 한다.', isCorrect: false },
      { text: '침해자에게 책임능력이 있어야 한다.', isCorrect: true },
      { text: '방위의사가 있어야 한다.', isCorrect: false },
    ],
  },
  {
    id: '12', createdAt: new Date('2026-02-12'), menteeName: '승민',
    question: '공동정범에 관한 설명으로 옳은 것은?',
    options: [
      { text: '공동정범은 공모만 있으면 성립한다.', isCorrect: false },
      { text: '공동정범은 각자가 전체 범행에 대해 책임을 지지 않는다.', isCorrect: false },
      { text: '공동정범은 기능적 행위지배를 요소로 한다.', isCorrect: true },
      { text: '과실범에 대한 공동정범은 인정되지 않는다.', isCorrect: false },
      { text: '공모공동정범은 판례상 인정되지 않는다.', isCorrect: false },
    ],
  },
  {
    id: '13', createdAt: new Date('2026-02-20'), menteeName: '승민',
    question: '형사소송법상 구속의 요건으로 옳지 않은 것은?',
    options: [
      { text: '피의자가 죄를 범하였다고 의심할 만한 상당한 이유가 있을 것', isCorrect: false },
      { text: '증거인멸의 염려가 있을 것', isCorrect: false },
      { text: '도망 또는 도망할 염려가 있을 것', isCorrect: false },
      { text: '일정한 주거가 없을 것', isCorrect: false },
      { text: '피의자가 외국인일 것', isCorrect: true },
    ],
  },
  {
    id: '14', createdAt: new Date('2026-03-02'), menteeName: '승민',
    question: '위법성조각사유의 전제사실에 관한 착오(허용구성요건착오)에 대한 설명으로 옳은 것은?',
    options: [
      { text: '고의범의 성립을 인정하고 임의적 감경을 한다.', isCorrect: false },
      { text: '엄격책임설에 의하면 고의가 조각된다.', isCorrect: false },
      { text: '제한책임설에 의하면 고의는 인정되나 과실범 처벌 규정이 있으면 처벌된다.', isCorrect: true },
      { text: '판례는 이를 사실의 착오로 보아 고의를 인정한다.', isCorrect: false },
      { text: '위법성의 착오와 동일하게 처리한다.', isCorrect: false },
    ],
  },
  {
    id: '15', createdAt: new Date('2026-03-08'), menteeName: '승민',
    question: '친고죄에 관한 설명으로 옳지 않은 것은?',
    options: [
      { text: '고소는 제1심 판결 선고 전까지 취소할 수 있다.', isCorrect: false },
      { text: '친고죄에서 고소는 소추조건이다.', isCorrect: false },
      { text: '고소권자가 여러 명인 경우 1인의 고소 취소는 다른 고소권자에게 효력이 없다.', isCorrect: false },
      { text: '공범 중 1인에 대한 고소 취소는 다른 공범에게도 효력이 미친다.', isCorrect: true },
      { text: '고소는 서면 또는 구술로 할 수 있다.', isCorrect: false },
    ],
  },
  {
    id: '16', createdAt: new Date('2026-03-12'), menteeName: '승민',
    question: '형법상 몰수에 관한 설명으로 옳은 것은?',
    options: [
      { text: '몰수는 주형이다.', isCorrect: false },
      { text: '몰수는 반드시 다른 형과 병과하여야 한다.', isCorrect: false },
      { text: '범죄수익은 항상 몰수할 수 있다.', isCorrect: false },
      { text: '몰수는 임의적 부가형이 원칙이다.', isCorrect: true },
      { text: '몰수의 대상은 유체물에 한한다.', isCorrect: false },
    ],
  },
  // ── 헌법 ────────────────────────────────────────────────────────────────
  {
    id: '17', createdAt: new Date('2026-01-12'), menteeName: '승민',
    question: '헌법재판소 결정의 효력에 관한 설명으로 옳지 않은 것은?',
    options: [
      { text: '위헌결정은 법원 및 국가기관을 기속한다.', isCorrect: false },
      { text: '헌법소원 인용결정은 모든 국가기관을 기속한다.', isCorrect: false },
      { text: '한정위헌결정의 기속력에 관하여 대법원과 헌법재판소의 견해가 대립한다.', isCorrect: false },
      { text: '위헌결정된 법률은 소급하여 효력을 상실한다.', isCorrect: true },
      { text: '헌법재판소 결정에 대해서는 재심이 허용되지 않는다.', isCorrect: false },
    ],
  },
  {
    id: '18', createdAt: new Date('2026-01-22'), menteeName: '승민',
    question: '기본권의 제한에 관한 헌법 제37조 제2항의 설명으로 옳은 것은?',
    options: [
      { text: '기본권은 국가안전보장을 위해 제한될 수 있다.', isCorrect: false },
      { text: '기본권을 제한하는 경우에도 본질적 내용은 침해할 수 없다.', isCorrect: false },
      { text: '기본권 제한은 반드시 법률로써 하여야 한다.', isCorrect: false },
      { text: '위 보기 모두 옳다.', isCorrect: true },
      { text: '기본권 제한은 법률의 위임에 의한 명령으로도 가능하다.', isCorrect: false },
    ],
  },
  {
    id: '19', createdAt: new Date('2026-02-05'), menteeName: '승민',
    question: '평등권에 관한 헌법재판소의 심사기준에 대한 설명으로 옳은 것은?',
    options: [
      { text: '합리적 차별은 평등권을 침해하지 않는다.', isCorrect: false },
      { text: '자의금지원칙은 모든 차별에 적용된다.', isCorrect: false },
      { text: '비례원칙은 헌법이 특별히 평등을 요구하거나 차별이 관련 기본권에 중대한 제한을 가하는 경우 적용된다.', isCorrect: true },
      { text: '평등권 심사에서는 비례원칙만 적용된다.', isCorrect: false },
      { text: '자의금지원칙은 엄격한 심사기준이다.', isCorrect: false },
    ],
  },
  {
    id: '20', createdAt: new Date('2026-02-18'), menteeName: '승민',
    question: '직업의 자유에 관한 설명으로 옳지 않은 것은?',
    options: [
      { text: '직업의 자유는 국민의 기본권으로 외국인에게는 원칙적으로 인정되지 않는다.', isCorrect: false },
      { text: '직업 선택의 자유와 직업 수행의 자유를 포함한다.', isCorrect: false },
      { text: '직업의 자유에 대한 제한은 단계이론에 따라 심사한다.', isCorrect: false },
      { text: '자격제도는 직업 수행의 자유를 제한하는 것이다.', isCorrect: true },
      { text: '직업의 자유는 절대적으로 보장된다.', isCorrect: false },
    ],
  },
  {
    id: '21', createdAt: new Date('2026-03-01'), menteeName: '승민',
    question: '헌법소원심판의 적법 요건에 관한 설명으로 옳지 않은 것은?',
    options: [
      { text: '공권력의 행사 또는 불행사로 인한 기본권 침해가 있어야 한다.', isCorrect: false },
      { text: '청구인 적격이 인정되어야 한다.', isCorrect: false },
      { text: '다른 법률에 구제절차가 있는 경우 이를 먼저 거쳐야 한다.', isCorrect: false },
      { text: '법원의 재판에 대해서도 헌법소원을 제기할 수 있다.', isCorrect: true },
      { text: '청구기간은 기본권 침해를 안 날로부터 90일, 있은 날로부터 1년이다.', isCorrect: false },
    ],
  },
  {
    id: '22', createdAt: new Date('2026-03-07'), menteeName: '승민',
    question: '국회의 의사원칙에 관한 설명으로 옳은 것은?',
    options: [
      { text: '회의는 원칙적으로 비공개이다.', isCorrect: false },
      { text: '국회의 의사정족수는 재적의원 과반수이다.', isCorrect: false },
      { text: '일사부재의 원칙이란 같은 회기 중 부결된 안건은 다시 발의할 수 없다는 원칙이다.', isCorrect: true },
      { text: '의결정족수는 재적의원 3분의 2 이상 찬성이다.', isCorrect: false },
      { text: '회기계속의 원칙상 한 회기에서 처리하지 못한 안건은 자동 폐기된다.', isCorrect: false },
    ],
  },
  {
    id: '23', createdAt: new Date('2026-03-13'), menteeName: '승민',
    question: '대통령의 권한에 관한 설명으로 옳지 않은 것은?',
    options: [
      { text: '대통령은 법률안 거부권을 가진다.', isCorrect: false },
      { text: '대통령의 긴급명령은 국회의 승인을 얻어야 효력이 유지된다.', isCorrect: false },
      { text: '대통령은 국가원수이자 행정부 수반이다.', isCorrect: false },
      { text: '대통령의 사면권 행사에는 국무회의 심의가 필요없다.', isCorrect: true },
      { text: '대통령의 조약 체결·비준에는 국회의 동의가 필요한 경우가 있다.', isCorrect: false },
    ],
  },
  {
    id: '24', createdAt: new Date('2026-03-16'), menteeName: '승민',
    question: '위헌법률심판에 관한 설명으로 옳은 것은?',
    options: [
      { text: '법원이 직권으로 헌법재판소에 위헌 여부 심판을 제청한다.', isCorrect: false },
      { text: '당사자의 신청이 있어야만 법원이 위헌 제청을 할 수 있다.', isCorrect: false },
      { text: '법원의 위헌법률심판 제청이 있으면 해당 소송은 정지된다.', isCorrect: true },
      { text: '명령·규칙도 위헌법률심판의 대상이 된다.', isCorrect: false },
      { text: '위헌결정에는 재판관 과반수의 찬성이 필요하다.', isCorrect: false },
    ],
  },
];

const PAGE_SIZE = 7;
const API_DELAY_MS = 300;

// ---------------------------------------------------------------------------
// Mock API — replace this function with a real API call later
// ---------------------------------------------------------------------------

async function fetchQuestions(page: number): Promise<QuestionsPage> {
  await new Promise((resolve) => setTimeout(resolve, API_DELAY_MS));

  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const questions = MOCK_QUESTIONS.slice(start, end);
  const nextPage = end < MOCK_QUESTIONS.length ? page + 1 : null;

  return { questions, nextPage };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}


// ---------------------------------------------------------------------------
// Question card
// ---------------------------------------------------------------------------

function QuestionCard({ question }: { question: Question }) {
  return (
    <li className="rounded-xl border border-neutral-200 bg-white p-4 hover:border-primary-200 hover:shadow-sm transition-all duration-150">
      <p className="text-sm font-semibold text-neutral-900 leading-snug line-clamp-2">
        {question.question}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-neutral-400">{formatDate(question.createdAt)}</span>
        <span className="ml-auto text-xs text-neutral-500">
          <span className="font-semibold text-primary-600">{question.menteeName}</span>
        </span>
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function QuestionCardSkeleton() {
  return (
    <li className="rounded-xl border border-neutral-200 bg-white p-4 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="h-4 flex-1 rounded bg-neutral-100" />
        <div className="h-5 w-14 rounded-full bg-neutral-100" />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-4 w-16 rounded-full bg-neutral-100" />
        <div className="h-4 w-20 rounded bg-neutral-100" />
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Page-level components
// ---------------------------------------------------------------------------

function PageHeader({ totalCount }: { totalCount: number }) {
  return (
    <header className="mb-8 rounded-2xl bg-primary-600 px-6 py-5">
      <span className="mb-2 inline-block rounded-full bg-secondary-500 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-widest text-white">
        관리자
      </span>
      <h1 className="text-2xl font-bold text-white">문제 목록</h1>
      <p className="mt-1.5 text-sm text-primary-200">
        다나가 출제한 문제를 확인하고 관리하세요.
        {totalCount > 0 && (
          <span className="ml-2 font-semibold text-white">총 {totalCount}개</span>
        )}
      </p>
    </header>
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

function AllLoadedMessage() {
  return (
    <p className="py-6 text-center text-sm text-neutral-400">
      모든 문제를 불러왔어요
    </p>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-6">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-primary-600" />
    </div>
  );
}

function ErrorMessage({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-error-100 bg-error-50 py-10 text-center">
      <p className="text-sm font-medium text-error-600">문제 목록을 불러오지 못했어요</p>
      <button
        onClick={onRetry}
        className="rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-500 transition-colors"
      >
        다시 시도
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

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
    queryFn: ({ pageParam }) => fetchQuestions(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '120px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allQuestions = data?.pages.flatMap((page) => page.questions) ?? [];

  return (
    <div className="px-6 py-10">
      <PageHeader totalCount={isLoading ? 0 : MOCK_QUESTIONS.length} />

      <div className="mb-4 flex justify-end">
        <Link
          href="/admin/questions/create"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500 transition-colors"
        >
          + 문제 만들기
        </Link>
      </div>

      {isError ? (
        <ErrorMessage onRetry={refetch} />
      ) : isLoading ? (
        <ul className="flex flex-col gap-3">
          {Array.from({ length: PAGE_SIZE }, (_, i) => (
            <QuestionCardSkeleton key={i} />
          ))}
        </ul>
      ) : allQuestions.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {allQuestions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </ul>

          <div ref={sentinelRef}>
            {isFetchingNextPage && <LoadingSpinner />}
            {!hasNextPage && <AllLoadedMessage />}
          </div>
        </>
      )}
    </div>
  );
}
