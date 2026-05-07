import { useState } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
} from 'recharts';
// v9 신규 아이콘: Users, Scale, MessageSquare, Gauge, Crown, Activity, Zap
//   → 3관점 평가(Multi-Perspective) + 품질 등급(Quality Levels) 시각화에 사용
import {
  CheckCircle2, XCircle, Sparkles, FileText, Target, Loader2, AlertTriangle,
  Lightbulb, BookOpen, Copy, GraduationCap, Microscope, Layers, ShieldCheck,
  ShieldAlert, ArrowRight, ArrowDown, Flame, Rocket, Map, Compass, TrendingUp,
  Info, BarChart3, Network, Briefcase, RotateCcw,
  Users, Scale, MessageSquare, Gauge, Crown, Activity, Zap,
} from 'lucide-react';

// ──────────────────────────────────────────────────────────
// 상수
// ──────────────────────────────────────────────────────────

const GRADES = ['1학년', '2학년', '3학년'];

const DNA_CRITERIA = [
  { id: 1, mark: '①', name: '질문으로 시작', short: '질문',  desc: '감상이 아닌 문제의식이 출발점' },
  { id: 2, mark: '②', name: '근거를 확보',   short: '근거',  desc: '책·논문·통계·실험·설문·사례 1개 이상' },
  { id: 3, mark: '③', name: '과정을 보여줌', short: '과정',  desc: '결과가 아닌 탐구 흐름의 서사화' },
  { id: 4, mark: '④', name: '활동을 확장',   short: '확장',  desc: '후속 탐구·발표·캠페인·제안으로 연결' },
  { id: 5, mark: '⑤', name: '공동체와 연결', short: '공동체', desc: '개인 성장이 공동체 기여로 의미화' },
  { id: 6, mark: '⑥', name: '평가는 마지막', short: '평가',  desc: '중간 칭찬 없이 끝에서 역량 정리' },
  { id: 7, mark: '⑦', name: '감정보다 신뢰', short: '신뢰',  desc: '과장 지양, 구체성·논리로 설득' },
];

const NARRATIVE_STAGES = [
  { id: 1, mark: '①', name: '계기', desc: '배경·접점',     hex: '#fb7185' },
  { id: 2, mark: '②', name: '탐구', desc: '질문·자료조사', hex: '#fb923c' },
  { id: 3, mark: '③', name: '분석', desc: '해석·원인추론', hex: '#f59e0b' },
  { id: 4, mark: '④', name: '실행', desc: '실험·설문·발표', hex: '#10b981' },
  { id: 5, mark: '⑤', name: '확산', desc: '공유·실천·후속', hex: '#0ea5e9' },
  { id: 6, mark: '⑥', name: '평가', desc: '역량 정리',     hex: '#6366f1' },
];

const ACTIVITY_TYPES = [
  { value: '자율',   label: '자율활동',           focus: '⑤ 확산' },
  { value: '동아리', label: '동아리활동',         focus: '② 탐구심화' },
  { value: '진로',   label: '진로활동',           focus: '② 탐구 · ⑥ 진로역량' },
  { value: '세특',   label: '세부능력 및 특기사항', focus: '② 탐구 · ⑥ 교과역량' },
  { value: '행특',   label: '행동특성 및 종합의견', focus: '⑥ 통합 평가' },
];

const DEPTH_BUCKETS = [
  { min: 1,  max: 1,  label: '고1 수준',     short: '고1' },
  { min: 2,  max: 3,  label: '고2 수준',     short: '고2' },
  { min: 4,  max: 5,  label: '고3 심화 수준', short: '고3' },
  { min: 6,  max: 7,  label: '대학 1-2학년 수준', short: '대1-2' },
  { min: 8,  max: 9,  label: '대학 3-4학년 수준', short: '대3-4' },
  { min: 10, max: 10, label: '대학원 수준',   short: '대학원' },
];

const depthBucketOf = (score) => {
  const s = Math.max(1, Math.min(10, score || 1));
  return DEPTH_BUCKETS.find((b) => s >= b.min && s <= b.max) || DEPTH_BUCKETS[0];
};

const TOP_TIER_CRITERIA = [
  { id: 1,  name: '문제 정의 능력',     short: '문제정의',  nameEn: 'Problem Framing' },
  { id: 2,  name: '자기만의 관점',      short: '자기관점',  nameEn: 'Original Perspective' },
  { id: 3,  name: '지식의 재구성 능력', short: '지식재구성', nameEn: 'Knowledge Reconstruction' },
  { id: 4,  name: '연결의 깊이',        short: '연결깊이',  nameEn: 'Deep Integration' },
  { id: 5,  name: '불확실성 다루기',    short: '불확실성',  nameEn: 'Handling Uncertainty' },
  { id: 6,  name: '탐구의 누적성',      short: '누적성',    nameEn: 'Continuity' },
  { id: 7,  name: '인지적 도전',        short: '도전수준',  nameEn: 'Cognitive Challenge' },
  { id: 8,  name: '사고 구조',          short: '사고구조',  nameEn: 'Thinking Structure' },
  { id: 9,  name: '평가 밀도',          short: '평가밀도',  nameEn: 'Evaluation Density' },
  { id: 10, name: '대체 불가능성',      short: '대체불가',  nameEn: 'Irreplaceability' },
];

// v9 신규: 품질 등급 — 0~100 점수를 5단계로 매핑
// 단순 충족/미충족(boolean)이 아닌 "얼마나 잘 드러났는가"를 단계화
const QUALITY_LEVELS = [
  { min: 0,  max: 15,  key: 'missing',   label: '누락',   short: '0',
    bg: 'bg-rose-50',    border: 'border-rose-300',    text: 'text-rose-700',
    radarFill: '#fb7185', radarStroke: '#e11d48',
    desc: '본문에서 식별되지 않거나 매우 형식적' },
  { min: 16, max: 40,  key: 'weak',      label: '약함',   short: '1',
    bg: 'bg-orange-50',  border: 'border-orange-300',  text: 'text-orange-700',
    radarFill: '#fb923c', radarStroke: '#ea580c',
    desc: '존재하나 표현이 추상적·짧음' },
  { min: 41, max: 65,  key: 'normal',    label: '보통',   short: '2',
    bg: 'bg-amber-50',   border: 'border-amber-300',   text: 'text-amber-700',
    radarFill: '#fbbf24', radarStroke: '#d97706',
    desc: '일반 학생 수준에 부합' },
  { min: 66, max: 85,  key: 'strong',    label: '강함',   short: '3',
    bg: 'bg-sky-50',     border: 'border-sky-300',     text: 'text-sky-700',
    radarFill: '#38bdf8', radarStroke: '#0284c7',
    desc: '구체성·서사·논리 모두 양호' },
  { min: 86, max: 100, key: 'excellent', label: '탁월',   short: '4',
    bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700',
    radarFill: '#34d399', radarStroke: '#059669',
    desc: '대체불가·최상위권 수준' },
];

const qualityLevelOf = (score) => {
  const s = Math.max(0, Math.min(100, score ?? 0));
  return QUALITY_LEVELS.find((q) => s >= q.min && s <= q.max) || QUALITY_LEVELS[0];
};

// 5단계 status 문자열 → 품질 레벨 (UnifiedStructureFlow용)
const statusToLevel = (status) => {
  const map = { missing: 0, weak: 1, normal: 2, strong: 3, excellent: 4 };
  return QUALITY_LEVELS[map[status] ?? 0];
};

// v9 신규: 3관점 평가자 정의
const EVALUATORS = [
  {
    id: 'conservative',
    name: '신뢰도 중심형',
    nameEn: 'Conservative',
    icon: ShieldCheck,
    accent: 'slate',
    headerBg: 'from-slate-700 to-slate-900',
    cardBg: 'bg-slate-50',
    cardBorder: 'border-slate-300',
    textAccent: 'text-slate-800',
    badge: 'bg-slate-100 text-slate-700 border-slate-300',
    persona: '과장 의심 · 검증 가능성 · 논리적 일관성',
    weights: '구체성 25 / 사고수준 15 / 진로연계 10 / 인과관계 20 / 차별성 10 / 신뢰도 20',
    desc: '근거가 검증 가능한지, 표현이 과장되지 않았는지를 가장 엄격히 봅니다.',
  },
  {
    id: 'academic',
    name: '탐구·지적 호기심형',
    nameEn: 'Academic',
    icon: Microscope,
    accent: 'indigo',
    headerBg: 'from-indigo-600 to-purple-700',
    cardBg: 'bg-indigo-50',
    cardBorder: 'border-indigo-300',
    textAccent: 'text-indigo-800',
    badge: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    persona: '사고 깊이 · 문제 정의 · 개념 연결',
    weights: '구체성 10 / 사고수준 35 / 진로연계 15 / 인과관계 20 / 차별성 15 / 신뢰도 5',
    desc: '문제를 새롭게 정의하고, 개념을 깊이 연결했는지를 가장 중시합니다.',
  },
  {
    id: 'fit',
    name: '전공 적합성 중심형',
    nameEn: 'Fit',
    icon: GraduationCap,
    accent: 'emerald',
    headerBg: 'from-emerald-600 to-teal-700',
    cardBg: 'bg-emerald-50',
    cardBorder: 'border-emerald-300',
    textAccent: 'text-emerald-800',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    persona: '진로 일관성 · 전공 관련성 · 학과 핵심 역량',
    weights: '구체성 15 / 사고수준 20 / 진로연계 35 / 인과관계 10 / 차별성 10 / 신뢰도 10',
    desc: '입력하신 진로·학과 맥락에 얼마나 정합적으로 연결되는지를 봅니다.',
  },
];

const ROADMAP_CATEGORIES = [
  { key: 'depthDeepening',     label: '깊이 심화',       icon: Microscope,   ring: 'border-indigo-200',  dot: 'bg-indigo-500',  bg: 'bg-indigo-50',   text: 'text-indigo-700',   desc: '현재 본문 주제를 한 단계 더 깊이 파고드는 방향' },
  { key: 'majorAligned',       label: '희망 학과 맞춤',  icon: GraduationCap, ring: 'border-purple-200',  dot: 'bg-purple-500',  bg: 'bg-purple-50',   text: 'text-purple-700',   desc: '희망 학과의 핵심 개념·방법론과 연결되는 방향' },
  { key: 'careerAligned',      label: '진로 맞춤',       icon: Briefcase,     ring: 'border-emerald-200', dot: 'bg-emerald-500', bg: 'bg-emerald-50',  text: 'text-emerald-700',  desc: '진로 희망의 실무·실천 맥락으로 확장하는 방향' },
  { key: 'crossDisciplinary',  label: '융합·확장',       icon: Network,       ring: 'border-amber-200',   dot: 'bg-amber-500',   bg: 'bg-amber-50',    text: 'text-amber-700',    desc: '인접 학문·다른 교과와 구조적으로 연결하는 방향' },
];

// ──────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────
// NEIS 바이트 계산 (참조: 나이스 바이트 계산기 엑셀 수식)
//   원본 수식: (LENB - LEN) * 3 + LEN * 2 - LENB
//   결과: 한글 3바이트, ASCII(영문·숫자·공백·기본기호) 1바이트
//   학생부 한도: 항목당 1500바이트 = 한글 약 500자
// ──────────────────────────────────────────────────────────

const NEIS_BYTE_LIMIT = 1500;
// v9 신규: 대안 문장 권장 하한 — 한도를 충분히 활용하기 위함
const NEIS_BYTE_REWRITE_MIN = 1400;

// 한글 등 비-ASCII 문자는 3바이트, ASCII는 1바이트로 카운트
const calcNeisBytes = (s) => {
  if (!s) return 0;
  let bytes = 0;
  for (const ch of s) {
    const code = ch.codePointAt(0);
    bytes += (code <= 0x7F) ? 1 : 3;
  }
  return bytes;
};

// 시스템 프롬프트 — 두 개로 분리
// ──────────────────────────────────────────────────────────

const buildContextHeader = (activityType, grade, careerGoal, desiredMajor) => {
  const cp = !!careerGoal?.trim(), mp = !!desiredMajor?.trim();
  let inputRule;
  if (cp && mp)        inputRule = `진로·학과 모두 입력. 둘을 함께 고려.`;
  else if (cp && !mp)  inputRule = `진로 "${careerGoal}"만 입력. 학과는 진로에서 도출되는 1~2개를 추론하여 사용.`;
  else if (!cp && mp)  inputRule = `학과 "${desiredMajor}"만 입력. 진로는 학과에서 도출되는 1~2개를 추론하여 사용.`;
  else                 inputRule = `둘 다 미입력. 본문에서 도출되는 학과·진로 방향을 추정.`;
  return `[현재 분석 대상]
- 학년: ${grade}  /  항목: ${activityType}활동
- 진로 희망: ${careerGoal || '(미입력)'}  /  희망 학과: ${desiredMajor || '(미입력)'}
- 입력 처리: ${inputRule}

[가독성 강조 규칙]
모든 분석 텍스트(rationale, evidence, comment, scoreReason 등)에서 핵심 키워드·수치·개념·이론명·자료명은 **이중 별표**로 감쌀 것. 예: "**다중회귀**와 **표본 350명**이 명시되어 **대학 2학년 수준**".

JSON 외 코드펜스(\`\`\`)·해설·머리말 일체 금지. 모든 큰따옴표는 \\" 로 이스케이프.`;
};

// 1단계: 핵심 분석
const buildCorePrompt = (activityType, grade, careerGoal, desiredMajor) => {
  return `당신은 대한민국 고등학교 학생부 작성 분석 전문가입니다. 추측·과장·관대한 해석 금지. 본문에 실제 적힌 표현만 근거로 삼습니다.

${buildContextHeader(activityType, grade, careerGoal, desiredMajor)}

[분석 기준]
1. 7가지 DNA: ① 질문 / ② 근거 / ③ 과정 / ④ 확장 / ⑤ 공동체 / ⑥ 평가는 마지막 / ⑦ 감정보다 신뢰. 5개 이상 합격선.
2. 6단계 서사: ① 계기 / ② 탐구 / ③ 분석 / ④ 실행 / ⑤ 확산 / ⑥ 평가. 항목별 강조: 자율⑤ / 동아리② / 진로②⑥ / 세특②⑥ / 행특⑥
3. 탐구 깊이 1~10: 1교과서기본(고1) / 2-3교과심화(고2) / 4-5교과융합·통계기초(고3) / 6-7학술DB·회귀(대1-2) / 8-9다중회귀·이론비판(대3-4) / 10메타분석(대학원)
4. 학과 연계: 주연계 1 + 관련 2-4 + 입력 학과(또는 추론학과)와의 적합도 high|medium|low|unknown
5. 교과·단원: specificity high(단원 명시)/medium(교과만)/low(추정)
6. 대안 문장: NEIS **반드시 1400~1500바이트 사이**(한글 약 467~500자)로 작성. 1500 절대 초과 금지, 동시에 1400 미만도 금지(여백을 본문 사고 과정·후속 활동·역량 평가로 채워 1400~1500 구간에 정확히 맞출 것). 명사형 종결(~함/~임/~됨), 학생부 위반 표현 금지. **rewrittenVersion 필드 안에는 ** 별표 마크업·따옴표·괄호 강조 등 일체 사용 금지** — 순수 텍스트만 작성. 본문이 한도를 초과해도 분석은 정상 수행.

[v9 품질 등급 기준 — 매우 중요]
DNA 7요소와 6단계 서사는 단순 충족/미충족이 아니라 **품질 점수 0~100점**으로 평가합니다.
- 0~15점: 누락 — 본문에서 식별되지 않거나 매우 형식적
- 16~40점: 약함 — 존재하나 표현이 추상적·짧음 (예: "관련 책을 읽음" 수준)
- 41~65점: 보통 — 일반 학생 수준에 부합 (예: 책 제목·저자 명시, 1~2문장 분석)
- 66~85점: 강함 — 구체성·서사·논리 모두 양호 (예: 표본수·통계값·후속 활동 연결)
- 86~100점: 탁월 — 대체불가·최상위권 수준 (예: 자기 관점 + 한계 인식 + 누적 탐구)

structureMap의 status는 5단계: "missing|weak|normal|strong|excellent" 중 하나.
qualityScore와 status는 일관성 있게 매기되, "있어 보이는 정도"로 점수 부풀리기 절대 금지.

응답은 아래 JSON만:

{
  "characterCount": 정수,
  "dnaChecklist": [
    {"id":1,"name":"질문으로 시작","satisfied":true|false,"qualityScore":0~100,"evidence":"..."},
    ...id 7까지
  ],
  "satisfiedCount": 정수(qualityScore가 50점 이상인 항목 수),
  "structureMap": [
    {"stage":1,"keyContent":"...","keywords":["..."],"status":"missing|weak|normal|strong|excellent","qualityScore":0~100,"excerpt":"...","diagnosis":"..."},
    ...stage 6까지
  ],
  "researchDepth": {
    "score": 1~10,
    "bucketLabel": "고1 수준|고2 수준|고3 심화 수준|대학 1-2학년 수준|대학 3-4학년 수준|대학원 수준",
    "rationale": "...",
    "depthEvidence": ["..."]
  },
  "majorAlignment": {
    "primary": "...",
    "primaryReason": "...",
    "related": ["..."],
    "crossDisciplinary": "...",
    "matchWithDesired": "high|medium|low|unknown",
    "matchComment": "..."
  },
  "curriculumConnection": [{"subject":"...","unit":"...","specificity":"high|medium|low","excerpt":"..."}],
  "overallScore": 0~100,
  "scoreReason": "...",
  "strengths": ["...","...","..."],
  "weaknesses": ["...","...","..."],
  "improvementSuggestions": ["...","...","..."],
  "rewrittenVersion": "보완된 NEIS **반드시 1400~1500바이트** 대안 문장 (별표 마크업 없는 순수 텍스트, 1400 미만 금지·1500 초과 금지)"
}`;
};

// 2단계: 확장 분석 (최상위 도약 + 로드맵)
const buildExtendedPrompt = (activityType, grade, careerGoal, desiredMajor) => {
  return `당신은 대한민국 고등학교 학생부 작성 분석 전문가입니다. 본문에 실제 적힌 표현만 근거로 엄격히 판정하세요.

${buildContextHeader(activityType, grade, careerGoal, desiredMajor)}

[분석 1: 최상위 도약 10가지 — 가장 엄격]
"있어 보이는 정도"로 met=true 처리 절대 금지. 본문에서 명확한 문장으로 드러나야 함.

1. 문제 정의 능력: 기존 접근 한계 지적·문제 재정의
2. 자기만의 관점: 자기 해석·주장·기준 (자료 정리 ≠ 자기 생각)
3. 지식의 재구성 능력: 교과 개념을 새 맥락에 변형·적용
4. 연결의 깊이: 서로 다른 개념의 구조적 연결 + 그 이유 설명
5. 불확실성 다루기: 실패·모순·예상외 결과 분석, 가설 수정
6. 탐구의 누적성: 1차→한계 인식→2차 확장 구조
7. 인지적 도전: 어려운 주제 도전, 자기 확장
8. 사고 구조: "문제→가설→방법→결과→해석→한계" 논리
9. 평가 밀도: "잘함" 수준이 아닌 "복잡한 상황에서 ○○하게 사고하며 △△한 방식으로 해결" 같은 분석적 평가
10. 대체 불가능성: 다른 학생이 못 쓸 고유 내용

[v9 품질 등급 기준 — 매우 중요]
각 기준을 단순 met/unmet이 아니라 **품질 점수 0~100점**으로 평가:
- 0~15점: 누락 — 본문에서 식별되지 않음
- 16~40점: 약함 — 단편적·암시적 (예: "다양한 자료 검토")
- 41~65점: 보통 — 일반 학생 수준 (예: 책 인용 + 한 문장 자기 해석)
- 66~85점: 강함 — 명확한 문장으로 드러남 + 후속 연결
- 86~100점: 탁월 — 대체 불가능한 고유 사고 (최상위권)

met=true는 qualityScore가 **66 이상**일 때만 표시. 65 이하는 met=false.

각 기준:
- met=true (qualityScore≥66) → satisfyingSentence(본문 발췌, 250자 이내) + developedAlternative(한 단계 발전 대안 1~2문장)
- met=false (qualityScore≤65) → 위 두 필드 빈 문자열 + tipForImprovement(짧은 보완 팁)

[분석 2: 진급 이후 로드맵]

(I) currentApplicationActivities — 분석된 결과를 즉시 적용할 수 있는 탐구 활동 추천
- 학년과 무관하게 항상 작성. 지금 학기·다음 학기 안에 시도 가능한 구체적 후속 활동 3~4개.
- 위 핵심 분석에서 도출된 약점·보완 제안·발견된 학과·진로 방향을 직접 반영.
- 본문 주제를 그대로 살리되, 약점을 즉시 메우는 방향(예: 근거 부족 → 1차 자료·통계 보강 / 확산 부족 → 학급·교내 발표 / 평가 미흡 → 교사 인터뷰 등).
- 각 항목: {"title":"활동명","description":"왜 지금 이 활동이 필요한지 + 본문의 어떤 약점을 보완하는지 1~2문장","tag":"심화|확장|적용|융합","linkedWeakness":"이 활동이 보완하는 약점 키워드"}

(II) nextStages — 진급 이후 로드맵 (기존 구조 유지)
- 3학년 → nextStages = []
- 1학년 → [2학년, 3학년]
- 2학년 → [3학년]

각 단계 4개 카테고리, 카테고리당 항목 2~3개:
(A) depthDeepening: 본문 주제 그대로 깊이 심화 (변인 통제, 통계 고도화, 1차 자료)
(B) majorAligned: 희망 학과(또는 추론학과) 핵심 개념·방법론 연결
(C) careerAligned: 진로(또는 추론진로) 실무 맥락. 학교 내 가능 형태(현장체험·인터뷰·정책분석)로 변환
(D) crossDisciplinary: 인접 학문·다른 교과로 확장

각 항목: {"title":"...","description":"왜 이 시점·학년에 추천하는지 1~2문장","tag":"심화|확장|적용|융합"}

학년 올라갈수록 깊이·구체성·독립성 증가. 외부 수상·공인어학시험 회피. 본문 주제 단순 반복 금지. 다양한 영역 포함.

응답은 아래 JSON만 (가독성 강조 규칙 적용):

{
  "topTierCheck": [
    {"id":1,"name":"문제 정의 능력","met":true|false,"qualityScore":0~100,"satisfyingSentence":"...","developedAlternative":"...","tipForImprovement":"..."},
    ...id 10까지
  ],
  "topTierMetCount": 정수(qualityScore가 66 이상인 항목 수),
  "promotionRoadmap": {
    "currentGrade": "${grade}",
    "considered": {"careerGoal":"${careerGoal || ''}","desiredMajor":"${desiredMajor || ''}"},
    "currentApplicationActivities": [
      {"title":"활동명","description":"분석 결과의 어떤 점을 보완하는지 1~2문장","tag":"심화|확장|적용|융합","linkedWeakness":"보완 약점 키워드"}
    ],
    "nextStages": [
      {
        "targetGrade": "...",
        "growthFocus": "...",
        "categories": [
          {"key":"depthDeepening","items":[{"title":"...","description":"...","tag":"심화"}]},
          {"key":"majorAligned","items":[...]},
          {"key":"careerAligned","items":[...]},
          {"key":"crossDisciplinary","items":[...]}
        ]
      }
    ]
  }
}`;
};

// ──────────────────────────────────────────────────────────
// v9 신규: 3단계 — 3관점 평가 (Multi-Perspective Evaluation)
// 서로 다른 철학을 가진 독립 평가자 3명이 같은 문장을 다르게 해석
// ──────────────────────────────────────────────────────────

const buildMultiPerspectivePrompt = (activityType, grade, careerGoal, desiredMajor) => {
  return `당신은 대한민국 학종 평가 시뮬레이션 엔진입니다. 같은 학생부 문장에 대해 **서로 다른 철학을 가진 독립 평가자 3명**이 어떻게 다르게 해석하고 점수를 매기는지를 시뮬레이션합니다.

${buildContextHeader(activityType, grade, careerGoal, desiredMajor)}

[3명의 평가자 — 각자 다른 가중치 매트릭스]

평가 요소         | 신뢰형 | 탐구형 | 적합성형
구체성            |  0.25  |  0.10  |  0.15
사고 수준         |  0.15  |  0.35  |  0.20
진로 연계         |  0.10  |  0.15  |  0.35
인과관계          |  0.20  |  0.20  |  0.10
차별성            |  0.10  |  0.15  |  0.10
신뢰도(논리·검증) |  0.20  |  0.05  |  0.10

[평가자 1 — 신뢰도 중심형 (Conservative Reviewer)]
철학: "검증할 수 없는 표현은 모두 의심한다."
- 과장·추상 표현 강하게 감점 ("다양한", "여러", "심층적으로" 같은 막연한 수식어)
- 표본수·통계값·기관명·자료명이 명시되어야 만점 근접
- 인과관계가 논리적으로 연결되는지 엄밀히 본다
- 톤: 차갑고 분석적. "...의 검증 가능성에 의문이 있음"

[평가자 2 — 탐구·지적 호기심형 (Academic Reviewer)]
철학: "이 학생이 진짜 자기 머리로 사고하는가?"
- 문제를 새롭게 정의하면 가산점, 자료 정리만 있으면 감점
- 개념 간 연결의 "이유"가 드러나면 만점 근접
- 표본수·통계 같은 형식적 근거에는 큰 가중을 두지 않음
- 톤: 학자적·열린 호기심. "...에서 사고의 발화점이 인상적이나"

[평가자 3 — 전공 적합성 중심형 (Fit Reviewer)]
철학: "이 활동이 입력된 진로·학과의 핵심 역량과 연결되는가?"
- 진로/학과와 본문 주제의 정합성을 가장 중시
- 학과의 핵심 개념·방법론과 본문의 사고가 닮아 있으면 가산점
- 사고가 깊어도 진로와 무관하면 감점
- 톤: 입학사정관 톤. "...의 학과 핵심 역량과의 정합성은"

[필수 규칙]
1. **세 평가자가 같은 점수를 주면 안 됨** — 가중치가 다르므로 보통 ±5~25점 차이가 나야 정상
2. 각 평가자는 reasoningTrace를 4~6단계로 구체적으로 작성 (단계마다 "어떤 표현/근거를 보고 어떻게 판단했는지")
3. criticalWeakness는 그 평가자 관점에서 가장 크게 감점한 한 가지 — 짧고 구체적
4. feedbackComment는 평가자 톤·말투를 살려 1~2문장으로 작성
5. 합의 분석은 세 점수의 평균/분산을 정직하게 계산
6. admissionProbability는 점수·분산·약점 종합 — 분산이 크면 최상위 가능성 낮춤
7. conflictPoints는 세 평가자 의견이 가장 크게 갈리는 1~2개 지점만

[가독성 강조 규칙] 모든 텍스트(reasoningTrace, verdict, feedbackComment, criticalWeakness, conflictPoints, summary)에서 핵심 키워드·수치·개념·이론명·자료명은 **이중 별표**로 감싸기.

응답은 아래 JSON만 (코드펜스·해설 금지):

{
  "multiPerspectiveEvaluation": {
    "evaluators": [
      {
        "id": "conservative",
        "score": 0~100,
        "reasoningTrace": [
          "① 활동 구체성 검토 — 본문에서 **표본수**·**기관명**·**자료명** 명시 여부 확인 → 결과 ...",
          "② 사고 수준 — '분석' 단계까지 도달했는지 ...",
          "③ 인과관계 — '왜 그런가'에 대한 답이 ...",
          "④ 차별성 — 다른 학생도 쓸 수 있는 표현인지 ...",
          "⑤ 최종 판단: ..."
        ],
        "verdict": "한 줄 종합 판정",
        "criticalWeakness": "이 관점에서 가장 큰 감점 요인 (짧고 구체적)",
        "feedbackComment": "평가자 톤을 살린 1~2문장 피드백"
      },
      {"id": "academic", "score": 0~100, "reasoningTrace": [...], "verdict": "...", "criticalWeakness": "...", "feedbackComment": "..."},
      {"id": "fit",      "score": 0~100, "reasoningTrace": [...], "verdict": "...", "criticalWeakness": "...", "feedbackComment": "..."}
    ],
    "consensus": {
      "averageScore": 정수 (세 점수 평균),
      "varianceScore": 정수 (세 점수의 표준편차 정도, 0~30),
      "varianceLevel": "low|medium|high",
      "interpretation": "평균과 분산을 종합한 한 줄 해석 (예: '평균은 양호하나 평가자별 분산이 커서 호불호가 갈리는 문장')",
      "conflictPoints": [
        {
          "topic": "충돌 주제 (예: 전공 적합성, 사고 깊이)",
          "conservativeView": "신뢰형 입장 1~2문장",
          "academicView": "탐구형 입장 1~2문장",
          "fitView": "적합성형 입장 1~2문장"
        }
      ]
    },
    "admissionProbability": {
      "topTier":   0~100 (서울권 최상위 — SKY·의약·서울교대 등),
      "upperTier": 0~100 (상위권 — 서울 주요·지방거점국립 인기학과),
      "stableTier":0~100 (안정권 — 일반 4년제),
      "interpretation": "확률 분포에 대한 1~2문장 해석"
    },
    "criticalWeaknessConsensus": "세 평가자가 공통적으로 가장 우려한 한 가지 약점 (1~2문장)",
    "summary": "이 문장이 학종 평가에서 어떻게 받아들여질지 종합 요약 (3~4문장)"
  }
}`;
};

// ──────────────────────────────────────────────────────────
// JSON 추출 / 잘림 복구 / 오류 변환
// ──────────────────────────────────────────────────────────

// 잘림 복구: 응답이 도중에 끊기면 마지막 안전 지점까지 자르고 자동으로 닫음
const recoverTruncatedJson = (rawText) => {
  if (!rawText) return null;
  let s = rawText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  const startIdx = s.indexOf('{');
  if (startIdx === -1) return null;
  s = s.slice(startIdx);

  // 한 번 훑어서 완전한 JSON인지 확인
  const traverse = (str) => {
    let depth = 0;
    let inString = false;
    let escape = false;
    let lastZeroDepth = -1;
    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      if (escape) { escape = false; continue; }
      if (c === '\\') { escape = true; continue; }
      if (c === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (c === '{' || c === '[') depth++;
      else if (c === '}' || c === ']') {
        depth--;
        if (depth === 0) lastZeroDepth = i;
      }
    }
    return { depth, inString, lastZeroDepth };
  };

  const { depth, inString, lastZeroDepth } = traverse(s);

  // (1) 완전한 JSON: 끝 탐색 후 그대로 반환
  if (depth === 0 && !inString && lastZeroDepth >= 0) {
    return s.slice(0, lastZeroDepth + 1);
  }

  // (2) 잘렸음 → 마지막 안전 지점(콤마, 닫는 괄호) 찾아서 잘라낸 뒤 자동 닫기
  // 마지막 valid 종료 위치를 찾기 (문자열 밖의 , 또는 } 또는 ])
  let safeEnd = -1;
  let depth2 = 0, inString2 = false, escape2 = false;
  const stack = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (escape2) { escape2 = false; continue; }
    if (c === '\\') { escape2 = true; continue; }
    if (c === '"') { inString2 = !inString2; continue; }
    if (inString2) continue;
    if (c === '{' || c === '[') { depth2++; stack.push(c); }
    else if (c === '}' || c === ']') { depth2--; stack.pop(); }
    if (c === ',' || c === '}' || c === ']') safeEnd = i;
  }

  if (safeEnd === -1) return null;
  let body = s.slice(0, safeEnd + 1);
  body = body.replace(/,\s*$/, ''); // 끝 콤마 제거

  // 다시 깊이/스택 계산하여 닫기
  let inString3 = false, escape3 = false;
  const stack2 = [];
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (escape3) { escape3 = false; continue; }
    if (c === '\\') { escape3 = true; continue; }
    if (c === '"') { inString3 = !inString3; continue; }
    if (inString3) continue;
    if (c === '{' || c === '[') stack2.push(c);
    else if (c === '}' || c === ']') stack2.pop();
  }
  if (inString3) body += '"'; // 열린 문자열 닫기
  while (stack2.length > 0) {
    const top = stack2.pop();
    body += (top === '{') ? '}' : ']';
  }
  return body;
};

// 다단계 파싱 (잘림 복구 + 후행 콤마 + 스마트 따옴표)
const parseAnalysisJson = (raw) => {
  if (!raw) throw new Error('빈 응답');
  const candidate = recoverTruncatedJson(raw);
  if (!candidate) {
    const err = new Error('응답에서 JSON을 추출하지 못했습니다');
    err.diagnostic = raw.slice(0, 500);
    throw err;
  }

  // 1차 시도
  try { return { data: JSON.parse(candidate), recovered: false }; } catch (e1) {
    // 2차 시도: 후행 콤마 제거
    let repaired = candidate.replace(/,(\s*[}\]])/g, '$1');
    try { return { data: JSON.parse(repaired), recovered: true }; } catch (e2) {
      // 3차 시도: 스마트 따옴표 정규화
      repaired = repaired
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'");
      try { return { data: JSON.parse(repaired), recovered: true }; } catch (e3) {
        const err = new Error(`JSON 파싱 실패: ${e1.message.slice(0, 120)}`);
        err.diagnostic = candidate.slice(0, 500);
        throw err;
      }
    }
  }
};

const humanizeError = (msg) => {
  if (!msg) return '알 수 없는 오류';
  if (/Invalid response format/i.test(msg)) return '응답 형식 오류 — 잠시 후 다시 시도해 주세요.';
  if (/Failed to fetch|NetworkError/i.test(msg)) return '네트워크 오류 — 연결 상태를 확인하고 다시 시도해 주세요.';
  if (/429|rate.?limit/i.test(msg)) return '요청 한도 초과 — 30초~1분 후 다시 시도해 주세요.';
  if (/529|overload/i.test(msg)) return '서버 과부하 — 잠시 후 다시 시도해 주세요.';
  return msg;
};

// 단일 API 호출 (한 phase)
const callPhase = async ({ system, userMsg, maxTokens = 8000 }) => {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userMsg }],
    }),
  });

  if (!res.ok) {
    let bodyText = '';
    try { bodyText = (await res.text()).slice(0, 300); } catch {}
    const err = new Error(`API 오류 (${res.status})`);
    err.diagnostic = bodyText;
    throw err;
  }

  const data = await res.json();
  if (data?.type === 'error' || data?.error) {
    const m = data?.error?.message || data?.message || '응답 형식 오류';
    const err = new Error(m);
    err.diagnostic = JSON.stringify(data).slice(0, 400);
    throw err;
  }
  if (!data?.content || !Array.isArray(data.content)) {
    const err = new Error('응답에 content 필드가 없습니다');
    err.diagnostic = JSON.stringify(data).slice(0, 400);
    throw err;
  }

  const raw = data.content.filter((b) => b?.type === 'text').map((b) => b.text || '').join('');
  const stop = data?.stop_reason; // "end_turn" | "max_tokens" | ...
  const { data: parsed, recovered } = parseAnalysisJson(raw);
  return { parsed, recovered, stop };
};

// ──────────────────────────────────────────────────────────
// 공용 컴포넌트
// ──────────────────────────────────────────────────────────

const RichText = ({ text, className = '' }) => {
  if (!text) return null;
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-bold text-slate-900 bg-yellow-100/60 px-0.5 rounded">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

const InfoTooltip = ({ content }) => (
  <span className="relative inline-flex items-center group/tt cursor-help align-middle">
    <Info className="w-4 h-4 text-slate-400 group-hover/tt:text-indigo-500 transition" />
    <span className="absolute z-30 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 sm:w-72 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover/tt:opacity-100 pointer-events-none transition leading-relaxed font-normal text-left">
      {content}
      <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-slate-900" />
    </span>
  </span>
);

const CardHeader = ({ icon: Icon, title, tooltip, children, color = 'text-indigo-600' }) => (
  <div className="flex items-center gap-2 mb-4 flex-wrap">
    {Icon && <Icon className={`w-5 h-5 ${color}`} />}
    <h2 className="text-lg sm:text-xl font-bold text-slate-900">{title}</h2>
    {tooltip && <InfoTooltip content={tooltip} />}
    {children && <div className="ml-auto">{children}</div>}
  </div>
);

// ──────────────────────────────────────────────────────────
// 시각화 컴포넌트
// ──────────────────────────────────────────────────────────

const CircularScore = ({ score = 0, size = 160 }) => {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const safe = Math.max(0, Math.min(100, score));
  const offset = circumference - (safe / 100) * circumference;
  const color = safe >= 80 ? '#10b981' : safe >= 60 ? '#f59e0b' : '#f43f5e';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circumference} strokeDashoffset={offset}
        transform={`rotate(-90 ${size/2} ${size/2})`} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
      <text x={size/2} y={size/2 - 4} textAnchor="middle" fontSize={size * 0.28} fontWeight="800" fill={color}>{safe}</text>
      <text x={size/2} y={size/2 + size * 0.16} textAnchor="middle" fontSize={size * 0.09} fill="#64748b" fontWeight="500">/ 100점</text>
    </svg>
  );
};

const DNARadar = ({ checklist }) => {
  // v9: satisfied 이분법 → qualityScore(0~100) 연속 시각화
  const data = (checklist || []).map((item) => {
    const meta = DNA_CRITERIA.find((d) => d.id === item.id) || {};
    // qualityScore 우선, 없으면 satisfied 기반 fallback (구버전 호환)
    const score = (typeof item.qualityScore === 'number')
      ? item.qualityScore
      : (item.satisfied ? 75 : 20);
    return { subject: meta.short || item.name || `${item.id}`, value: score };
  });
  return (
    <div className="w-full" style={{ height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} stroke="#cbd5e1" axisLine={false} />
          {/* v9: 합격선(50점) 기준 가이드 */}
          <Radar dataKey={() => 50} stroke="#cbd5e1" fill="transparent" strokeDasharray="4 4" strokeWidth={1} dot={false} legendType="none" />
          <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.35} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

const TopTierRadar = ({ check }) => {
  // v9: met 이분법 → qualityScore(0~100) 연속 시각화
  const data = (check || []).map((item) => {
    const meta = TOP_TIER_CRITERIA.find((c) => c.id === item.id) || {};
    const score = (typeof item.qualityScore === 'number')
      ? item.qualityScore
      : (item.met ? 75 : 18);
    return { subject: meta.short || `${item.id}`, value: score };
  });
  return (
    <div className="w-full" style={{ height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
          <PolarGrid stroke="#fecaca" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} stroke="#fda4af" axisLine={false} />
          {/* v9: 충족선(66점) 가이드 */}
          <Radar dataKey={() => 66} stroke="#fecaca" fill="transparent" strokeDasharray="4 4" strokeWidth={1} dot={false} legendType="none" />
          <Radar dataKey="value" stroke="#e11d48" fill="#fb7185" fillOpacity={0.4} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

const EvidenceDonut = ({ ratio = 0, level = '심각' }) => {
  const size = 140, stroke = 14;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const safe = Math.max(0, Math.min(100, ratio));
  const offset = circ - (safe / 100) * circ;
  const color = level === '통과' ? '#10b981' : level === '부족' ? '#f59e0b' : '#f43f5e';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#fee2e2" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        transform={`rotate(-90 ${size/2} ${size/2})`} strokeLinecap="round" />
      <text x={size/2} y={size/2 - 2} textAnchor="middle" fontSize="28" fontWeight="800" fill={color}>{safe}%</text>
      <text x={size/2} y={size/2 + 18} textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="500">구체성</text>
    </svg>
  );
};

const DepthGauge = ({ score, bucketLabel }) => {
  const pct = Math.max(0, Math.min(100, ((score - 1) / 9) * 100));
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-2 flex-wrap gap-1">
        <div className="text-sm font-semibold text-slate-700">현재 위치</div>
        <div className="text-base font-bold text-indigo-700">
          {bucketLabel} <span className="text-sm text-slate-500 font-normal">({score}/10)</span>
        </div>
      </div>
      <div className="relative h-4 bg-gradient-to-r from-emerald-200 via-amber-200 to-rose-200 rounded-full">
        <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-indigo-600 border-2 border-white shadow-md"
          style={{ left: `calc(${pct}% - 10px)` }} />
      </div>
      <div className="grid grid-cols-6 gap-1 mt-2 text-[10px] sm:text-xs text-slate-500 text-center font-medium">
        {DEPTH_BUCKETS.map((b) => (<div key={b.short}>{b.short}</div>))}
      </div>
    </div>
  );
};

const MatchBadge = ({ level }) => {
  if (!level || level === 'unknown') return null;
  const map = {
    high:   { bg: 'bg-emerald-100', text: 'text-emerald-700', label: '적합도 높음' },
    medium: { bg: 'bg-amber-100',   text: 'text-amber-700',   label: '적합도 보통' },
    low:    { bg: 'bg-rose-100',    text: 'text-rose-700',    label: '적합도 낮음' },
  };
  const v = map[level] || map.medium;
  return <span className={`text-xs font-bold px-2 py-1 rounded-full ${v.bg} ${v.text}`}>{v.label}</span>;
};

// ──────────────────────────────────────────────────────────
// 통합 6단계 구조도
// ──────────────────────────────────────────────────────────

// v9: 5단계 status (missing/weak/normal/strong/excellent)
const STATUS_COLORS = {
  excellent: { bg: 'bg-emerald-50', border: 'border-emerald-400', text: 'text-emerald-700', label: '탁월', barBg: 'bg-emerald-500' },
  strong:    { bg: 'bg-sky-50',     border: 'border-sky-300',     text: 'text-sky-700',     label: '강함', barBg: 'bg-sky-500' },
  normal:    { bg: 'bg-amber-50',   border: 'border-amber-300',   text: 'text-amber-700',   label: '보통', barBg: 'bg-amber-500' },
  weak:      { bg: 'bg-orange-50',  border: 'border-orange-300',  text: 'text-orange-700',  label: '약함', barBg: 'bg-orange-500' },
  missing:   { bg: 'bg-rose-50',    border: 'border-rose-300',    text: 'text-rose-700',    label: '누락', barBg: 'bg-rose-500' },
};

const UnifiedStructureFlow = ({ structureMap }) => {
  const safeMap = (structureMap && structureMap.length === 6)
    ? structureMap
    : NARRATIVE_STAGES.map((s) => ({ stage: s.id, keyContent: '', keywords: [], status: 'missing', qualityScore: 0, excerpt: '', diagnosis: '' }));

  const renderBox = (item, idx) => {
    const meta = NARRATIVE_STAGES[item.stage - 1] || NARRATIVE_STAGES[idx];
    const status = STATUS_COLORS[item.status] || STATUS_COLORS.missing;
    // v9: qualityScore 표시 — 본문의 질에 따라 미세 차이를 보여줌
    const qScore = (typeof item.qualityScore === 'number')
      ? Math.max(0, Math.min(100, item.qualityScore))
      : (item.status === 'excellent' ? 92 : item.status === 'strong' ? 75 : item.status === 'normal' ? 53 : item.status === 'weak' ? 30 : 8);
    return (
      <div className={`flex flex-col rounded-lg border-2 ${status.border} ${status.bg} p-3`}>
        <div className="flex items-center justify-between mb-2 gap-1">
          <span className="text-sm font-bold" style={{ color: meta.hex }}>{meta.mark} {meta.name}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${status.text} bg-white border ${status.border}`}>{status.label}</span>
        </div>
        <div className="text-[11px] text-slate-500 mb-2 font-medium">{meta.desc}</div>
        {/* v9: 품질 게이지 — 같은 status 안에서도 점수 차이를 시각화 */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
            <span className="font-semibold">품질</span>
            <span className="font-mono font-bold text-slate-700">{qScore}</span>
          </div>
          <div className="h-1.5 bg-white rounded-full overflow-hidden border border-slate-200">
            <div className={`h-full ${status.barBg} transition-all duration-500`} style={{ width: `${qScore}%` }} />
          </div>
        </div>
        {item.keyContent
          ? <p className="text-xs text-slate-800 leading-relaxed mb-2"><RichText text={item.keyContent} /></p>
          : <p className="text-xs text-slate-400 italic mb-2">본문에서 식별되지 않음</p>}
        {item.excerpt && (
          <div className="text-[11px] text-slate-600 italic mb-2 pl-2 border-l-2 border-slate-300">"{item.excerpt}"</div>
        )}
        {item.diagnosis && (
          <div className="text-[11px] text-slate-700 mt-1 mb-2 leading-relaxed">
            <span className="font-bold text-slate-500">진단 · </span>
            <RichText text={item.diagnosis} />
          </div>
        )}
        {item.keywords?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-1">
            {item.keywords.slice(0, 4).map((k, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 bg-white rounded border border-slate-200 text-slate-600 font-medium">#{k}</span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
      <CardHeader icon={Microscope} title="탐구 구조도 (6단계 흐름 + 진단)"
        tooltip="① 계기 → ⑥ 평가까지 6단계가 자연스럽게 이어지는지 분석합니다. 각 박스에 본문 발췌·핵심 키워드·5단계(누락·약함·보통·강함·탁월) 상태와 품질 점수(0~100)·진단 코멘트가 모두 통합되어 있습니다." />
      <div className="hidden md:flex items-stretch gap-1 overflow-x-auto pb-2">
        {safeMap.map((item, idx) => (
          <div key={item.stage} className="flex items-stretch flex-shrink-0">
            <div className="w-52 lg:w-56">{renderBox(item, idx)}</div>
            {idx < 5 && <div className="flex items-center px-1.5"><ArrowRight className="w-5 h-5 text-slate-400" /></div>}
          </div>
        ))}
      </div>
      <div className="md:hidden flex flex-col items-stretch gap-1">
        {safeMap.map((item, idx) => (
          <div key={item.stage} className="flex flex-col items-center">
            <div className="w-full">{renderBox(item, idx)}</div>
            {idx < 5 && <ArrowDown className="w-5 h-5 text-slate-400 my-1" />}
          </div>
        ))}
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────
// 근거 엄격성 카드
// ──────────────────────────────────────────────────────────

const StrictEvidenceCard = ({ check }) => {
  if (!check) return null;
  const level = check.strictnessLevel;
  const ratio = typeof check.concreteRatio === 'number' ? check.concreteRatio :
    level === '통과' ? 80 : level === '부족' ? 50 : 20;
  const color =
    level === '통과' ? { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-800' }
    : level === '부족' ? { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-800' }
    :                    { bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-800' };
  const Icon = level === '통과' ? ShieldCheck : ShieldAlert;

  return (
    <div className={`rounded-xl border-2 ${color.border} ${color.bg} p-5 sm:p-6`}>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Icon className={`w-6 h-6 ${color.text}`} />
        <h2 className={`text-lg sm:text-xl font-bold ${color.text}`}>근거 엄격성 체크</h2>
        <InfoTooltip content="본문에 구체적 자료(저자·제목·연도)와 수치(표본수·통계값 등)가 명시되어 있는지 엄격하게 검증합니다. '관련 자료를 찾아봄' 같은 추상적 표현은 모두 미충족 처리됩니다." />
        <span className={`ml-auto px-3 py-1 rounded-full text-base font-bold bg-white border ${color.border} ${color.text}`}>{level}</span>
      </div>
      <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start mb-5">
        <div className="flex-shrink-0"><EvidenceDonut ratio={ratio} level={level} /></div>
        <div className="flex-1">
          <p className={`text-base ${color.text} leading-relaxed font-semibold mb-2`}>
            <RichText text={check.verdict} />
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            구체적 근거의 비율이 높을수록 학생부의 신뢰도가 올라갑니다. 학종 평가에서 가장 핵심적으로 보는 부분 중 하나입니다.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 발견된 구체적 자료
          </div>
          {check.specificSourcesFound?.length > 0
            ? <ul className="space-y-1">{check.specificSourcesFound.map((s, i) => (<li key={i} className="text-xs text-slate-800 leading-relaxed">• <RichText text={s} /></li>))}</ul>
            : <p className="text-xs text-slate-400 italic">없음</p>}
        </div>
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 발견된 구체적 수치/변인
          </div>
          {check.numericalDataFound?.length > 0
            ? <ul className="space-y-1">{check.numericalDataFound.map((s, i) => (<li key={i} className="text-xs text-slate-800 leading-relaxed font-mono">• {s}</li>))}</ul>
            : <p className="text-xs text-slate-400 italic">없음</p>}
        </div>
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="text-xs font-bold text-rose-700 mb-2 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> 추상적 표현 (구체화 필요)
          </div>
          {check.abstractExpressions?.length > 0
            ? <ul className="space-y-1">{check.abstractExpressions.map((s, i) => (<li key={i} className="text-xs text-slate-700 leading-relaxed">• {s}</li>))}</ul>
            : <p className="text-xs text-slate-400 italic">없음</p>}
        </div>
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="text-xs font-bold text-rose-700 mb-2 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> 누락된 근거 항목
          </div>
          {check.missingItems?.length > 0
            ? <ul className="space-y-1">{check.missingItems.map((s, i) => (<li key={i} className="text-xs text-slate-700 leading-relaxed">• {s}</li>))}</ul>
            : <p className="text-xs text-slate-400 italic">없음</p>}
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────
// 최상위 도약 카드
// ──────────────────────────────────────────────────────────

const TopTierCheckCard = ({ topTierCheck, topTierMetCount }) => {
  if (!topTierCheck || topTierCheck.length === 0) return null;
  const total = topTierCheck.length;
  const met = topTierMetCount ?? topTierCheck.filter((c) => c.met).length;
  const ratio = (met / total) * 100;
  const headerColor = ratio >= 70 ? 'from-rose-500 to-orange-500'
    : ratio >= 40 ? 'from-orange-500 to-amber-500' : 'from-slate-500 to-slate-600';

  return (
    <div className="bg-white rounded-xl border-2 border-rose-200 shadow-sm overflow-hidden">
      <div className={`bg-gradient-to-r ${headerColor} p-5 sm:p-6 text-white`}>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Flame className="w-6 h-6" />
          <h2 className="text-lg sm:text-xl font-bold">최상위 도약을 위한 마지막 점검</h2>
          <span className="ml-auto px-3 py-1.5 rounded-full bg-white/25 text-base font-bold backdrop-blur-sm">
            {met} / {total} 충족
          </span>
        </div>
        <p className="text-sm text-white/90 leading-relaxed">
          상위권은 문제를 <span className="font-bold">해결</span>하지만, 최상위권은 문제를 <span className="font-bold">새롭게 정의</span>합니다.
        </p>
      </div>
      <div className="p-5 sm:p-6 bg-rose-50/30 border-b border-rose-100">
        <TopTierRadar check={topTierCheck} />
      </div>
      <div className="divide-y divide-slate-100">
        {topTierCheck.map((item) => {
          const meta = TOP_TIER_CRITERIA.find((c) => c.id === item.id) || {};
          // v9: qualityScore 우선, 없으면 met 기반
          const qScore = (typeof item.qualityScore === 'number')
            ? item.qualityScore
            : (item.met ? 75 : 18);
          const lvl = qualityLevelOf(qScore);
          const isMet = qScore >= 66; // 강함 이상만 충족
          return (
            <div key={item.id} className="p-4 sm:p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                  isMet ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-400'
                }`}>🔥{item.id}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-base">{item.name || meta.name}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">{meta.nameEn}</span>
                  </div>
                  {/* v9: 품질 점수 게이지 */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full transition-all duration-500" style={{ width: `${qScore}%`, backgroundColor: lvl.radarStroke }} />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700">{qScore}</span>
                  </div>
                </div>
                <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold border ${lvl.bg} ${lvl.text} ${lvl.border}`}>
                  {lvl.label}
                </span>
              </div>
              {isMet && item.satisfyingSentence ? (
                <div className="space-y-3 sm:pl-13">
                  <div className="bg-emerald-50 border-l-4 border-emerald-400 rounded-r-lg p-3">
                    <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide mb-1">원본 문장</div>
                    <p className="text-sm text-slate-800 leading-relaxed italic">"{item.satisfyingSentence}"</p>
                  </div>
                  {item.developedAlternative && (
                    <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-lg p-3">
                      <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> 한 단계 발전된 대안
                      </div>
                      <p className="text-sm text-slate-800 leading-relaxed">
                        <RichText text={item.developedAlternative} />
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="sm:pl-13">
                  <p className="text-sm text-slate-500 italic mb-2">{lvl.desc}</p>
                  {item.tipForImprovement && (
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">보완 팁</div>
                      <p className="text-xs text-slate-700 leading-relaxed">{item.tipForImprovement}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────
// 진급 이후 로드맵
// ──────────────────────────────────────────────────────────

const TAG_COLORS = {
  '심화': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  '확장': 'bg-amber-100 text-amber-700 border-amber-200',
  '적용': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  '융합': 'bg-purple-100 text-purple-700 border-purple-200',
};

const PromotionRoadmapCard = ({ roadmap, careerGoal, desiredMajor }) => {
  if (!roadmap) return null;
  const stages = roadmap.nextStages || [];
  const currentApps = roadmap.currentApplicationActivities || [];
  if (stages.length === 0 && currentApps.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border-2 border-indigo-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 sm:p-6 text-white">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Map className="w-6 h-6" />
          <h2 className="text-lg sm:text-xl font-bold">진급 이후 로드맵</h2>
          <InfoTooltip content="(1) 분석 결과를 지금 즉시 적용할 수 있는 탐구 활동 추천과, (2) 진급 후 학년별 발전 로드맵을 함께 제시합니다. 입력하신 진로·학과(또는 추론된 값)를 모두 고려합니다." />
        </div>
        <p className="text-sm text-white/90 leading-relaxed">
          현재 학년: <span className="font-bold">{roadmap.currentGrade}</span>
          {careerGoal && <> · 진로 희망: <span className="font-bold">{careerGoal}</span></>}
          {desiredMajor && <> · 희망 학과: <span className="font-bold">{desiredMajor}</span></>}
        </p>
      </div>

      {/* (1) 분석 결과 즉시 적용 — 탐구 활동 추천 */}
      {currentApps.length > 0 && (
        <div className="p-5 sm:p-6 bg-amber-50/40 border-b border-amber-100">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">탐구 활동 추천</h3>
            <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-bold">분석 결과 즉시 적용</span>
            <InfoTooltip content="현재 분석에서 드러난 약점·보완점을 지금 학기 또는 다음 학기 안에 메울 수 있는 구체적 후속 활동입니다. 학년이 올라가기를 기다리지 않고 바로 시도할 수 있는 추천입니다." />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            현재 분석에서 발견된 <span className="font-semibold text-amber-700">약점·보완점</span>을 즉시 메울 수 있는 후속 활동입니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentApps.map((act, i) => (
              <div key={i} className="bg-white rounded-lg p-4 border border-amber-200 hover:border-amber-400 transition">
                <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                  <div className="text-sm font-bold text-slate-900 flex-1 min-w-0">
                    <RichText text={act.title} />
                  </div>
                  {act.tag && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${TAG_COLORS[act.tag] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {act.tag}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed mb-2">
                  <RichText text={act.description} />
                </p>
                {act.linkedWeakness && (
                  <div className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 inline-block font-semibold">
                    보완 ▸ {act.linkedWeakness}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* (2) 진급 이후 단계별 로드맵 */}
      {stages.length > 0 && (
        <div className="p-5 sm:p-6 space-y-8">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Rocket className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">진급 이후 학년별 단계</h3>
          </div>
          {stages.map((stage, sIdx) => (
            <div key={sIdx} className="relative">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-base">{sIdx + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h3 className="text-xl font-bold text-slate-900">{stage.targetGrade}</h3>
                    <Rocket className="w-4 h-4 text-indigo-500" />
                  </div>
                  {stage.growthFocus && (
                    <p className="text-sm text-indigo-700 font-semibold mt-1 leading-relaxed">
                      <RichText text={stage.growthFocus} />
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:pl-13">
                {ROADMAP_CATEGORIES.map((cat) => {
                  const matched = (stage.categories || []).find((c) => c.key === cat.key);
                  const items = matched?.items || [];
                  const Icon = cat.icon;
                  return (
                    <div key={cat.key} className={`rounded-lg border ${cat.ring} ${cat.bg} p-4`}>
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <div className={`w-7 h-7 rounded-md ${cat.dot} text-white flex items-center justify-center`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <h4 className={`text-sm font-bold ${cat.text}`}>{cat.label}</h4>
                        <InfoTooltip content={cat.desc} />
                      </div>
                      {items.length > 0 ? (
                        <ul className="space-y-2">
                          {items.map((it, i) => (
                            <li key={i} className="bg-white rounded-md p-3 border border-slate-200">
                              <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                                <div className="text-sm font-bold text-slate-900 flex-1 min-w-0">
                                  <RichText text={it.title} />
                                </div>
                                {it.tag && (
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${TAG_COLORS[it.tag] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                    {it.tag}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                <RichText text={it.description} />
                              </p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400 italic">추천 항목이 생성되지 않았습니다.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SPECIFICITY_COLORS = {
  high:   { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: '명확' },
  medium: { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   label: '추정' },
  low:    { bg: 'bg-slate-50',   text: 'text-slate-600',   border: 'border-slate-200',   label: '약함' },
};

// ──────────────────────────────────────────────────────────
// v9 신규: 3관점 평가 카드 (Multi-Perspective Evaluation Card)
// ──────────────────────────────────────────────────────────

// 점수 → 색상 (인입 가능: emerald/amber/orange/rose)
const scoreColorOf = (score) => {
  if (score >= 80) return { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', stroke: '#059669', fill: '#34d399' };
  if (score >= 65) return { bg: 'bg-sky-50',     border: 'border-sky-300',     text: 'text-sky-700',     stroke: '#0284c7', fill: '#38bdf8' };
  if (score >= 50) return { bg: 'bg-amber-50',   border: 'border-amber-300',   text: 'text-amber-700',   stroke: '#d97706', fill: '#fbbf24' };
  if (score >= 35) return { bg: 'bg-orange-50',  border: 'border-orange-300',  text: 'text-orange-700',  stroke: '#ea580c', fill: '#fb923c' };
  return                 { bg: 'bg-rose-50',     border: 'border-rose-300',    text: 'text-rose-700',    stroke: '#e11d48', fill: '#fb7185' };
};

// 분산 지수 시각화 (낮을수록 의견 일치)
const VarianceIndicator = ({ variance, level }) => {
  const pct = Math.max(0, Math.min(100, (variance ?? 0) * 3.33)); // 0~30 → 0~100%
  const lv = level || (variance < 8 ? 'low' : variance < 18 ? 'medium' : 'high');
  const map = {
    low:    { color: 'bg-emerald-500', text: 'text-emerald-700', label: '의견 일치' },
    medium: { color: 'bg-amber-500',   text: 'text-amber-700',   label: '부분 충돌' },
    high:   { color: 'bg-rose-500',    text: 'text-rose-700',    label: '호불호 강함' },
  };
  const v = map[lv] || map.medium;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
        <span className="text-xs font-bold text-slate-600">분산 지수</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${v.text}`}>{v.label}</span>
          <span className="text-xs font-mono font-bold text-slate-700">{variance ?? 0}</span>
        </div>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${v.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// 합격 가능성 분포 바 (3구간)
const AdmissionProbabilityBar = ({ label, value, accent }) => {
  const pct = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
        <span className="text-sm font-bold text-slate-700">{label}</span>
        <span className={`text-base font-bold font-mono ${accent.text}`}>{pct}%</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${accent.bar} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const MultiPerspectiveCard = ({ multi }) => {
  if (!multi) return null;
  const evaluators = multi.evaluators || [];
  const consensus = multi.consensus || {};
  const prob = multi.admissionProbability || {};
  if (evaluators.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border-2 border-slate-300 shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-slate-800 via-indigo-800 to-purple-800 p-5 sm:p-6 text-white">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Users className="w-6 h-6" />
          <h2 className="text-lg sm:text-xl font-bold">3관점 평가 시뮬레이션</h2>
          <InfoTooltip content="서로 다른 철학을 가진 평가자 3명이 같은 문장을 어떻게 다르게 해석하는지 시뮬레이션합니다. 각 평가자의 가중치 매트릭스가 다르므로 점수가 같으면 안 됩니다." />
          <span className="ml-auto px-3 py-1.5 rounded-full bg-white/25 text-base font-bold backdrop-blur-sm">
            평균 {consensus.averageScore ?? '-'} / 100
          </span>
        </div>
        <p className="text-sm text-white/90 leading-relaxed">
          평가 요소·가중치가 다른 <span className="font-bold">독립 평가자 3명</span>의 판단을 동시에 시뮬레이션 — 단일 점수 대신 <span className="font-bold">합의·분산·확률 분포</span>를 함께 제공합니다.
        </p>
      </div>

      {/* 3 평가자 카드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-5 sm:p-6 bg-slate-50/50">
        {evaluators.map((ev) => {
          const meta = EVALUATORS.find((e) => e.id === ev.id) || EVALUATORS[0];
          const Icon = meta.icon;
          const sc = scoreColorOf(ev.score ?? 0);
          return (
            <div key={ev.id} className={`rounded-xl border-2 ${meta.cardBorder} ${meta.cardBg} overflow-hidden`}>
              {/* 평가자 헤더 */}
              <div className={`bg-gradient-to-br ${meta.headerBg} p-4 text-white`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold leading-tight">{meta.name}</div>
                    <div className="text-[10px] text-white/70 font-mono">{meta.nameEn} Reviewer</div>
                  </div>
                </div>
                <p className="text-[11px] text-white/80 leading-relaxed">{meta.persona}</p>
              </div>
              {/* 점수 */}
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">평가 점수</span>
                  <span className={`text-3xl font-bold font-mono ${sc.text}`}>{ev.score ?? '-'}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full transition-all duration-700"
                    style={{ width: `${Math.max(0, Math.min(100, ev.score ?? 0))}%`, backgroundColor: sc.fill }} />
                </div>
                <div className="text-[10px] text-slate-500 mt-2 font-mono leading-relaxed">
                  가중치 · {meta.weights}
                </div>
              </div>
              {/* 사고 흐름 */}
              {ev.reasoningTrace?.length > 0 && (
                <div className="p-4 border-b border-slate-200">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Activity className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">사고 과정</span>
                  </div>
                  <ol className="space-y-1.5">
                    {ev.reasoningTrace.map((step, i) => (
                      <li key={i} className="text-[11px] text-slate-700 leading-relaxed pl-2 border-l-2 border-slate-300">
                        <RichText text={step} />
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {/* 판정 + 약점 */}
              <div className="p-4 space-y-3">
                {ev.verdict && (
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">최종 판정</div>
                    <p className={`text-sm font-semibold ${meta.textAccent} leading-relaxed`}>
                      <RichText text={ev.verdict} />
                    </p>
                  </div>
                )}
                {ev.criticalWeakness && (
                  <div className="bg-rose-50 border-l-4 border-rose-400 rounded-r p-2.5">
                    <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wide mb-0.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> 치명적 약점
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed">
                      <RichText text={ev.criticalWeakness} />
                    </p>
                  </div>
                )}
                {ev.feedbackComment && (
                  <div className="bg-white rounded-lg border border-slate-200 p-2.5">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> 피드백
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      "<RichText text={ev.feedbackComment} />"
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 합의 점수 + 분산 지수 */}
      <div className="px-5 sm:px-6 pb-6 space-y-4">
        <div className="bg-white rounded-xl border-2 border-indigo-200 p-5">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Scale className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">합의 점수 + 분산 지수</h3>
            <InfoTooltip content="합의 점수는 세 평가자 점수의 평균입니다. 분산 지수가 낮으면 평가자들의 의견이 일치하는 안정적 강점이고, 높으면 호불호가 갈리는 위험·기회 양면을 가진 문장입니다." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">평균 (합의 점수)</span>
                <span className="text-3xl font-bold font-mono text-indigo-700">{consensus.averageScore ?? '-'}</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                  style={{ width: `${Math.max(0, Math.min(100, consensus.averageScore ?? 0))}%` }} />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 px-1 font-mono">
                <span>0</span><span>50</span><span>100</span>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <VarianceIndicator variance={consensus.varianceScore} level={consensus.varianceLevel} />
            </div>
          </div>
          {consensus.interpretation && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-700 leading-relaxed">
                <span className="font-bold text-indigo-700">해석 · </span>
                <RichText text={consensus.interpretation} />
              </p>
            </div>
          )}
        </div>

        {/* 의견 충돌 포인트 */}
        {consensus.conflictPoints?.length > 0 && (
          <div className="bg-amber-50/50 rounded-xl border border-amber-200 p-5">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Zap className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900">의견 충돌 지점</h3>
              <InfoTooltip content="세 평가자의 해석이 가장 크게 갈리는 주제와 각자의 입장을 보여줍니다. 학종 평가에서 입학사정관 성향에 따라 결과가 갈릴 수 있는 위험·기회 영역입니다." />
            </div>
            <div className="space-y-3">
              {consensus.conflictPoints.map((cp, i) => (
                <div key={i} className="bg-white rounded-lg border border-amber-200 p-4">
                  <div className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                    {cp.topic}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { ev: EVALUATORS[0], view: cp.conservativeView },
                      { ev: EVALUATORS[1], view: cp.academicView },
                      { ev: EVALUATORS[2], view: cp.fitView },
                    ].map((row, j) => {
                      const Icon = row.ev.icon;
                      return (
                        <div key={j} className={`rounded-lg p-2.5 border ${row.ev.cardBorder} ${row.ev.cardBg}`}>
                          <div className={`flex items-center gap-1 mb-1 text-[10px] font-bold ${row.ev.textAccent} uppercase tracking-wide`}>
                            <Icon className="w-3 h-3" />
                            {row.ev.name}
                          </div>
                          <p className="text-[11px] text-slate-700 leading-relaxed">
                            <RichText text={row.view} />
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 합격 가능성 분포 */}
        <div className="bg-white rounded-xl border-2 border-purple-200 p-5">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Crown className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-bold text-slate-900">합격 가능성 분포</h3>
            <InfoTooltip content="평균 점수·분산·약점을 종합한 추정 확률입니다. 분산이 클수록 최상위 가능성이 낮아지는 경향을 반영합니다. 단순 합격/불합격이 아닌 '대학 티어별' 확률로 표시되어 현실적 의사결정에 도움이 됩니다." />
          </div>
          <div className="space-y-4">
            <AdmissionProbabilityBar label="🏆 최상위 대학 (SKY · 의약 · 서울교대)" value={prob.topTier}
              accent={{ text: 'text-rose-700',    bar: 'bg-gradient-to-r from-rose-500 to-pink-500' }} />
            <AdmissionProbabilityBar label="🎯 상위권 대학 (서울 주요 · 거점국립 인기학과)" value={prob.upperTier}
              accent={{ text: 'text-amber-700',   bar: 'bg-gradient-to-r from-amber-500 to-orange-500' }} />
            <AdmissionProbabilityBar label="✅ 안정권 (일반 4년제)" value={prob.stableTier}
              accent={{ text: 'text-emerald-700', bar: 'bg-gradient-to-r from-emerald-500 to-teal-500' }} />
          </div>
          {prob.interpretation && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-700 leading-relaxed">
                <span className="font-bold text-purple-700">해석 · </span>
                <RichText text={prob.interpretation} />
              </p>
            </div>
          )}
        </div>

        {/* 공통 치명 약점 + 종합 요약 */}
        {(multi.criticalWeaknessConsensus || multi.summary) && (
          <div className="bg-slate-900 rounded-xl p-5 text-white">
            {multi.criticalWeaknessConsensus && (
              <div className="mb-4 pb-4 border-b border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <h3 className="text-base font-bold">공통 치명 약점</h3>
                  <InfoTooltip content="세 평가자가 모두 우려한 한 가지 약점입니다. 평균 점수보다 입시 결과에 더 큰 영향을 주는 경우가 많습니다." />
                </div>
                <p className="text-sm text-slate-200 leading-relaxed pl-7">
                  <RichText text={multi.criticalWeaknessConsensus} />
                </p>
              </div>
            )}
            {multi.summary && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="w-5 h-5 text-indigo-300" />
                  <h3 className="text-base font-bold">종합 평가 요약</h3>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed pl-7">
                  <RichText text={multi.summary} />
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────
// 메인
// ──────────────────────────────────────────────────────────

export default function HaksenbuAnalyzer() {
  const [grade, setGrade] = useState('3학년');
  const [activityType, setActivityType] = useState('세특');
  const [careerGoal, setCareerGoal] = useState('');
  const [desiredMajor, setDesiredMajor] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(''); // 진행 표시
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [errorDetail, setErrorDetail] = useState(null);
  const [partialNotice, setPartialNotice] = useState(null); // 부분 결과 안내
  const [copied, setCopied] = useState(false);

  const charCount = text.length;
  const byteCount = calcNeisBytes(text);
  const overLimit = byteCount > NEIS_BYTE_LIMIT;
  const underLimit = byteCount > 0 && byteCount < 600;
  const bytePct = Math.min(100, (byteCount / NEIS_BYTE_LIMIT) * 100);

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setLoadingPhase('세 단계 병렬 분석 중...');
    setError(null);
    setErrorDetail(null);
    setPartialNotice(null);
    setResult(null);

    const userMsg = `다음 ${grade} ${activityType}활동 학생부 문구를 분석해 JSON으로만 응답하세요.\n진로 희망: ${careerGoal || '(미입력)'}\n희망 학과: ${desiredMajor || '(미입력)'}\n\n----- 분석 대상 -----\n${text}`;

    // v9: Promise.allSettled — 3 phase 병렬 호출 (한쪽 실패해도 다른 쪽 결과 활용)
    const [coreSettled, extSettled, mpSettled] = await Promise.allSettled([
      callPhase({
        system: buildCorePrompt(activityType, grade, careerGoal, desiredMajor),
        userMsg,
        maxTokens: 8000,
      }),
      callPhase({
        system: buildExtendedPrompt(activityType, grade, careerGoal, desiredMajor),
        userMsg,
        maxTokens: 8000,
      }),
      callPhase({
        system: buildMultiPerspectivePrompt(activityType, grade, careerGoal, desiredMajor),
        userMsg,
        maxTokens: 8000,
      }),
    ]);

    const coreOk = coreSettled.status === 'fulfilled';
    const extOk  = extSettled.status === 'fulfilled';
    const mpOk   = mpSettled.status === 'fulfilled';

    // 세 단계 모두 실패
    if (!coreOk && !extOk && !mpOk) {
      const e = coreSettled.reason || extSettled.reason || mpSettled.reason;
      setError(humanizeError(e?.message));
      if (e?.diagnostic) setErrorDetail(e.diagnostic);
      setLoading(false);
      setLoadingPhase('');
      // eslint-disable-next-line no-console
      console.error('[All phases failed]', coreSettled.reason, extSettled.reason, mpSettled.reason);
      return;
    }

    // 결과 병합
    const merged = {
      ...(coreOk ? coreSettled.value.parsed : {}),
      ...(extOk  ? extSettled.value.parsed  : {}),
      ...(mpOk   ? mpSettled.value.parsed   : {}),
    };
    setResult(merged);

    // 부분 결과 안내
    const notices = [];
    if (!coreOk) notices.push('핵심 분석 실패 — 최상위 도약·로드맵·3관점 평가만 표시됩니다.');
    if (!extOk)  notices.push('확장 분석(최상위 도약·로드맵) 실패 — 다른 결과만 표시됩니다.');
    if (!mpOk)   notices.push('3관점 평가 실패 — 핵심·확장 분석만 표시됩니다.');
    if (coreOk && coreSettled.value.recovered) notices.push('핵심 분석 응답이 일부 복구되었습니다.');
    if (extOk  && extSettled.value.recovered)  notices.push('확장 분석 응답이 일부 복구되었습니다.');
    if (mpOk   && mpSettled.value.recovered)   notices.push('3관점 평가 응답이 일부 복구되었습니다.');
    if (coreOk && coreSettled.value.stop === 'max_tokens') notices.push('핵심 분석 응답이 토큰 한도에 도달했습니다 — 일부 항목이 누락될 수 있습니다.');
    if (extOk  && extSettled.value.stop === 'max_tokens')  notices.push('확장 분석 응답이 토큰 한도에 도달했습니다 — 일부 항목이 누락될 수 있습니다.');
    if (mpOk   && mpSettled.value.stop === 'max_tokens')   notices.push('3관점 평가 응답이 토큰 한도에 도달했습니다 — 일부 항목이 누락될 수 있습니다.');
    if (notices.length > 0) setPartialNotice(notices);

    setLoading(false);
    setLoadingPhase('');
  };

  const copyRewrite = async () => {
    if (!result?.rewrittenVersion) return;
    try {
      const cleanText = (result.rewrittenVersion || '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*+/g, '');
      await navigator.clipboard.writeText(cleanText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {}
  };

  const depth = result?.researchDepth;
  const depthBucket = depth ? depthBucketOf(depth.score) : null;
  const hasNextStages = result?.promotionRoadmap?.nextStages?.length > 0;
  const hasCurrentApps = result?.promotionRoadmap?.currentApplicationActivities?.length > 0;
  const showRoadmap = (grade !== '3학년' && hasNextStages) || hasCurrentApps;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Sparkles className="w-7 h-7 text-indigo-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">학생부 문장 분석기</h1>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold">v9</span>
          </div>
          <p className="text-sm text-slate-600">
            5단계 품질 등급 · 3관점 평가 · 1400~1500바이트 권장 · 7가지 DNA · 6단계 서사 · 탐구 깊이 · 최상위 도약 · 진급 로드맵
          </p>
        </div>

        {/* 입력 카드 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 mb-6 shadow-sm space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">1. 학년 선택</label>
            <div className="flex flex-wrap gap-2">
              {GRADES.map((g) => (
                <button key={g} onClick={() => setGrade(g)}
                  className={`px-4 py-2 rounded-lg border text-sm font-semibold transition ${
                    grade === g ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                  }`}>{g}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">2. 항목 선택</label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_TYPES.map((t) => (
                <button key={t.value} onClick={() => setActivityType(t.value)}
                  className={`text-left px-3 py-2 rounded-lg border text-sm transition ${
                    activityType === t.value ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                  }`}>
                  <div className="font-bold">{t.label}</div>
                  <div className={`text-xs mt-0.5 ${activityType === t.value ? 'text-indigo-100' : 'text-slate-500'}`}>강조: {t.focus}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">3. 진로 희망 · 희망 학과</label>
            <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              <span><span className="font-semibold text-indigo-700">둘 중 하나만 입력</span>해도 분석이 가능하며, 둘 다 입력하면 더 정밀한 추천이 제공됩니다.</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-2 items-center">
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={careerGoal} onChange={(e) => setCareerGoal(e.target.value)}
                  placeholder="진로 희망 (예: 임상약사)"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
              </div>
              <div className="text-center text-xs font-bold text-slate-400 px-1 hidden md:block">또는</div>
              <div className="text-center text-xs font-bold text-slate-400 md:hidden">— 또는 —</div>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={desiredMajor} onChange={(e) => setDesiredMajor(e.target.value)}
                  placeholder="희망 학과 (예: 약학과)"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <label className="block text-sm font-bold text-slate-700 flex items-center gap-1">
                4. 분석할 학생부 문구
                <InfoTooltip content="NEIS 시스템은 한글 1자를 3바이트, 영문·숫자·공백을 1바이트로 계산합니다. 한도 1500바이트 ≈ 한글 500자입니다." />
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-mono font-bold ${overLimit ? 'text-rose-600' : underLimit ? 'text-amber-600' : 'text-slate-700'}`}>
                  NEIS: {byteCount} / {NEIS_BYTE_LIMIT}바이트
                </span>
              </div>
            </div>
            {/* 바이트 진행 바 */}
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full transition-all duration-300 ${
                  overLimit ? 'bg-rose-500' : bytePct >= 90 ? 'bg-amber-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${Math.min(100, bytePct)}%` }}
              />
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value)}
              placeholder="학생부 문장을 붙여 넣으세요…  (NEIS 1500바이트 ≈ 한글 500자)"
              rows={9}
              className="w-full p-3 border border-slate-200 rounded-lg text-sm leading-relaxed focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 resize-y" />
            {overLimit && (
              <div className="mt-2 text-sm text-amber-700 flex items-center gap-1 font-medium bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                NEIS 한도 1500바이트({byteCount}바이트)를 초과했지만 분석은 정상 진행됩니다. 대안 문장은 1500바이트 이내로 자동 압축됩니다.
              </div>
            )}
          </div>

          <button onClick={analyze} disabled={loading || !text.trim()}
            className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-base font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-sm">
            {loading
              ? <><Loader2 className="w-5 h-5 animate-spin" /> {loadingPhase || '분석 중…'}</>
              : <><Sparkles className="w-5 h-5" /> 분석 시작</>}
          </button>
        </div>

        {/* 에러 */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6 text-rose-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-sm leading-relaxed font-semibold">{error}</div>
                {errorDetail && (
                  <details className="mt-2">
                    <summary className="text-xs text-rose-600 cursor-pointer font-medium">세부 정보 보기</summary>
                    <pre className="mt-2 text-[10px] text-slate-700 bg-white rounded p-2 border border-rose-200 overflow-auto max-h-40 whitespace-pre-wrap break-all">
                      {errorDetail}
                    </pre>
                  </details>
                )}
                <button onClick={analyze} disabled={loading}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white border border-rose-300 text-rose-700 rounded-md hover:bg-rose-100 transition">
                  <RotateCcw className="w-3.5 h-3.5" /> 다시 시도
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 부분 결과 안내 */}
        {partialNotice && partialNotice.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-amber-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold mb-1">일부 결과 안내</div>
                <ul className="text-xs space-y-1">
                  {partialNotice.map((n, i) => (<li key={i}>• {n}</li>))}
                </ul>
                <button onClick={analyze} disabled={loading}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white border border-amber-300 text-amber-700 rounded-md hover:bg-amber-100 transition">
                  <RotateCcw className="w-3.5 h-3.5" /> 전체 재분석
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 빈 상태 */}
        {!result && !loading && !error && (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 leading-relaxed">
              학년·항목·진로/학과를 입력하고 학생부 문장을 붙여 넣은 뒤 [분석 시작]을 눌러주세요.<br />
              모든 분석 항목 제목 옆 <Info className="w-3.5 h-3.5 inline-block text-slate-400" /> 아이콘에 마우스를 올리면 상세 설명이 표시됩니다.
            </p>
          </div>
        )}

        {/* 결과 */}
        {result && (
          <div className="space-y-6">
            {result.overallScore !== undefined && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
                <CardHeader icon={BarChart3} title="종합 점수"
                  tooltip="7가지 DNA · 6단계 서사 · 근거 엄격성 · 탐구 깊이를 통합해 100점 만점으로 환산. 80점 이상 우수, 60~79점 보완 필요, 60점 미만 재작성 권장." />
                <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-5">
                  <div className="flex-shrink-0"><CircularScore score={result.overallScore} /></div>
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <div className="text-xs text-slate-500 mb-1 font-medium">{grade} · {activityType}활동</div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {result.satisfiedCount !== undefined && (
                        <span className={`text-sm font-bold px-3 py-1.5 rounded-lg border ${
                          result.satisfiedCount >= 5 ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : result.satisfiedCount >= 3 ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>DNA {result.satisfiedCount} / 7 충족</span>
                      )}
                      {result.topTierMetCount !== undefined && (
                        <span className="text-sm font-bold px-3 py-1.5 rounded-lg border bg-rose-50 text-rose-700 border-rose-200">
                          🔥 도약 {result.topTierMetCount} / 10
                        </span>
                      )}
                    </div>
                    {result.scoreReason && (
                      <p className="text-sm text-slate-700 leading-relaxed"><RichText text={result.scoreReason} /></p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {result.structureMap && <UnifiedStructureFlow structureMap={result.structureMap} />}

            {result.dnaChecklist && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
                <CardHeader icon={Target} title="7가지 핵심 DNA"
                  tooltip="좋은 학생부 문장의 7가지 본질 요소(슬라이드 5 기준). v9부터는 단순 충족/미충족이 아닌 0~100 품질 점수로 평가하며, 5단계(누락·약함·보통·강함·탁월) 등급이 표시됩니다. 50점 이상 5개가 합격선." />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <DNARadar checklist={result.dnaChecklist} />
                  <ul className="space-y-3">
                    {result.dnaChecklist.map((item) => {
                      const meta = DNA_CRITERIA.find((d) => d.id === item.id) || {};
                      // v9: qualityScore가 있으면 5단계 등급, 없으면 satisfied 기반 fallback
                      const qScore = (typeof item.qualityScore === 'number')
                        ? item.qualityScore
                        : (item.satisfied ? 75 : 25);
                      const lvl = qualityLevelOf(qScore);
                      return (
                        <li key={item.id} className="flex items-start gap-3">
                          {qScore >= 50
                            ? <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            : <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-1.5 flex-wrap">
                              <span className="text-slate-400 text-sm font-bold">{meta.mark}</span>
                              <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                              {/* v9: 5단계 등급 뱃지 + 점수 */}
                              <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded font-bold border ${lvl.bg} ${lvl.text} ${lvl.border}`}>
                                {lvl.label} · {qScore}
                              </span>
                            </div>
                            {/* v9: 점수 게이지 */}
                            <div className="h-1 bg-slate-100 rounded-full mt-1.5 mb-1.5 overflow-hidden">
                              <div className="h-full transition-all duration-500" style={{ width: `${qScore}%`, backgroundColor: lvl.radarStroke }} />
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              <RichText text={item.evidence} />
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}

            {(depth || result.majorAlignment) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {depth && depthBucket && (
                  <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
                    <CardHeader icon={GraduationCap} title="탐구 깊이 분석"
                      tooltip="사용된 분석 도구·인용 자료의 깊이·사고 추상화 수준을 종합해 1~10 스케일로 환산. 1~5는 고등학교, 6~9는 학부, 10은 대학원 수준." />
                    <DepthGauge score={depth.score} bucketLabel={depth.bucketLabel || depthBucket.label} />
                    <p className="mt-4 text-sm text-slate-700 leading-relaxed"><RichText text={depth.rationale} /></p>
                    {depth.depthEvidence?.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">판정 근거</div>
                        <ul className="space-y-1.5">
                          {depth.depthEvidence.map((e, i) => (
                            <li key={i} className="text-xs text-slate-700 leading-relaxed pl-3 border-l-2 border-indigo-300">
                              <RichText text={e} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {result.majorAlignment && (
                  <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
                    <CardHeader icon={Network} title="학과·전공 연계"
                      tooltip="본문 탐구 주제·방법론·인용 자료에서 도출한 주연계 학과(굵은 배지), 관련 학과 2~4개, 융합 성격. 입력하신 희망 학과와의 적합도도 평가." />
                    <div className="mb-4">
                      <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">주연계 학과</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="inline-block px-4 py-2 bg-indigo-600 text-white text-base font-bold rounded-lg shadow-sm">
                          {result.majorAlignment.primary}
                        </div>
                        {(desiredMajor || careerGoal) && <MatchBadge level={result.majorAlignment.matchWithDesired} />}
                      </div>
                      {result.majorAlignment.primaryReason && (
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                          <RichText text={result.majorAlignment.primaryReason} />
                        </p>
                      )}
                      {result.majorAlignment.matchComment && (desiredMajor || careerGoal) && (
                        <p className="text-xs text-purple-700 mt-1 leading-relaxed font-medium">
                          비교 · {result.majorAlignment.matchComment}
                        </p>
                      )}
                    </div>
                    {result.majorAlignment.related?.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">관련 학과</div>
                        <div className="flex flex-wrap gap-1.5">
                          {result.majorAlignment.related.map((r, i) => (
                            <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md border border-indigo-200">{r}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.majorAlignment.crossDisciplinary && (
                      <div>
                        <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">융합 성격</div>
                        <p className="text-xs text-slate-700 leading-relaxed">{result.majorAlignment.crossDisciplinary}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {result.curriculumConnection !== undefined && activityType !== '세특' && activityType !== '행특' && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
                <CardHeader icon={Layers} title="교과·단원 연계"
                  tooltip="본문에서 명시·시사되는 교과·단원을 추출. 단원명까지 명확하면 '명확', 교과명만 추정 가능하면 '추정' 라벨." />
                {result.curriculumConnection?.length > 0 ? (
                  <div className="space-y-3">
                    {result.curriculumConnection.map((c, i) => {
                      const sp = SPECIFICITY_COLORS[c.specificity] || SPECIFICITY_COLORS.low;
                      return (
                        <div key={i} className="border border-slate-200 rounded-lg p-3.5 hover:border-indigo-300 transition">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-base font-bold text-slate-900">{c.subject}</span>
                            {c.unit && (<><span className="text-slate-400">›</span><span className="text-sm font-semibold text-slate-700">{c.unit}</span></>)}
                            <span className={`ml-auto text-[10px] px-2 py-0.5 rounded border font-bold ${sp.border} ${sp.bg} ${sp.text}`}>{sp.label}</span>
                          </div>
                          {c.excerpt && (<p className="text-xs text-slate-500 italic leading-relaxed mt-1">"{c.excerpt}"</p>)}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">본문에서 교과·단원이 직접 추출되지 않았습니다.</p>
                )}
              </div>
            )}

            {result.evidenceStrictCheck && false && <StrictEvidenceCard check={result.evidenceStrictCheck} />}

            {(result.strengths || result.weaknesses) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {result.strengths && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                      <h3 className="font-bold text-emerald-900 text-base">강점</h3>
                      <InfoTooltip content="본문에서 잘 드러난 점입니다." />
                    </div>
                    <ul className="space-y-2">
                      {result.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-emerald-900 leading-relaxed">• <RichText text={s} /></li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.weaknesses && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <AlertTriangle className="w-5 h-5 text-amber-700" />
                      <h3 className="font-bold text-amber-900 text-base">약점</h3>
                      <InfoTooltip content="본문에서 부족하거나 누락된 점입니다." />
                    </div>
                    <ul className="space-y-2">
                      {result.weaknesses.map((s, i) => (
                        <li key={i} className="text-sm text-amber-900 leading-relaxed">• <RichText text={s} /></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {result.topTierCheck && (
              <TopTierCheckCard topTierCheck={result.topTierCheck} topTierMetCount={result.topTierMetCount} />
            )}

            {result.improvementSuggestions && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Lightbulb className="w-5 h-5 text-indigo-700" />
                  <h3 className="font-bold text-indigo-900 text-base">보완 제안</h3>
                  <InfoTooltip content="약점을 강점으로 바꾸기 위한 구체적 액션." />
                </div>
                <ul className="space-y-2">
                  {result.improvementSuggestions.map((s, i) => (
                    <li key={i} className="text-sm text-indigo-900 leading-relaxed flex gap-2">
                      <span className="font-bold flex-shrink-0">{i + 1}.</span>
                      <span><RichText text={s} /></span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.rewrittenVersion && (
              <div className="bg-white border-2 border-indigo-300 rounded-xl p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-base">대안 문장</h3>
                  <InfoTooltip content="모든 분석 결과를 반영하여 한 단계 발전시킨 NEIS 권장 1400~1500바이트 추천 문장. 한도를 충분히 활용하기 위해 권장 하한선(1400)이 함께 표시됩니다. 명사형 종결, 학생부 기재요령 준수." />
                  {(() => {
                    const altBytes = calcNeisBytes(result.rewrittenVersion);
                    const altOver = altBytes > NEIS_BYTE_LIMIT;
                    const altUnder = altBytes < NEIS_BYTE_REWRITE_MIN;
                    const inRange = !altOver && !altUnder;
                    const tone = altOver ? 'text-rose-600'
                              : altUnder ? 'text-amber-600'
                              : 'text-emerald-700';
                    const badge = altOver ? '한도 초과'
                               : altUnder ? '하한 미달'
                               : '권장 범위 ✓';
                    const badgeBg = altOver ? 'bg-rose-100 text-rose-700 border-rose-300'
                                  : altUnder ? 'bg-amber-100 text-amber-700 border-amber-300'
                                  : 'bg-emerald-100 text-emerald-700 border-emerald-300';
                    return (
                      <div className="ml-auto flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${badgeBg}`}>{badge}</span>
                        <span className={`text-sm font-mono font-bold ${tone}`}>
                          NEIS {altBytes} / {NEIS_BYTE_REWRITE_MIN}~{NEIS_BYTE_LIMIT}바이트
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {/* v9: 1400~1500 권장 범위 시각화 — 진행 바에 권장 구간 강조 */}
                {(() => {
                  const altBytes = calcNeisBytes(result.rewrittenVersion);
                  const pct = Math.min(100, (altBytes / NEIS_BYTE_LIMIT) * 100);
                  const minPct = (NEIS_BYTE_REWRITE_MIN / NEIS_BYTE_LIMIT) * 100; // 약 93.3%
                  return (
                    <div className="mb-4">
                      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                        {/* 권장 구간 배경 (1400~1500) */}
                        <div className="absolute inset-y-0 bg-emerald-200/60"
                          style={{ left: `${minPct}%`, right: '0%' }} />
                        {/* 현재 위치 */}
                        <div className={`h-full transition-all duration-500 ${
                          altBytes > NEIS_BYTE_LIMIT ? 'bg-rose-500'
                          : altBytes < NEIS_BYTE_REWRITE_MIN ? 'bg-amber-500'
                          : 'bg-emerald-500'
                        }`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1 px-0.5">
                        <span>0</span>
                        <span className="text-emerald-700 font-bold">↑ 1400 (권장 시작)</span>
                        <span className="text-emerald-700 font-bold">1500 ↑</span>
                      </div>
                    </div>
                  );
                })()}

                <p className="text-base text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {(result.rewrittenVersion || '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*+/g, '')}
                </p>
                <button onClick={copyRewrite}
                  className="mt-3 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700 inline-flex items-center gap-1.5">
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? '복사됨' : '대안 문장 복사'}
                </button>
              </div>
            )}

            {showRoadmap && (
              <PromotionRoadmapCard roadmap={result.promotionRoadmap}
                careerGoal={careerGoal} desiredMajor={desiredMajor} />
            )}

            {/* v9: 3관점 평가 시뮬레이션 — 항상 최하단 */}
            {result.multiPerspectiveEvaluation && (
              <MultiPerspectiveCard multi={result.multiPerspectiveEvaluation} />
            )}
          </div>
        )}

        <div className="mt-8 text-xs text-slate-400 text-center leading-relaxed">
          분석 기준: 슬라이드 5·6 + 탐구 깊이 1~10 + 최상위 도약 10가지 + 진급 로드맵 (4 카테고리) · NEIS 바이트 카운트 · <span className="font-bold">5단계 품질 등급</span> · <span className="font-bold">3관점 평가</span> · 병렬 3단계 분석
        </div>
      </div>
    </div>
  );
}
