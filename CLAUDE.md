# CLAUDE.md — 프로젝트 지침서

이 저장소는 **박명훈의 개발자 포트폴리오 웹사이트**다. 상세 기획은 [PLAN.md](PLAN.md)를 따른다. 기획과 이 문서가 충돌하면 이 문서(규칙)를 우선하고, 변경 사항은 PLAN.md에 반영한다.

## 프로젝트 개요

- 목적: 취업/이직(토스 계열 지향), 주 독자는 개발자 면접관
- 컨셉: 토스 스타일 UI + GitHub 연동 + "박명훈에게 물어보세요" 챗봇
- 지원 직군: **서버(Java) 개발자**. 사이트 자체가 백엔드 역량의 증거물이어야 한다.
- 프론트: Next.js (App Router) · TypeScript(strict) · Tailwind CSS v4 · Motion(Framer Motion) · pnpm · Vercel
- 백엔드(`server/`): Spring Boot · Java 21 · Gradle · Docker (챗봇 API)
- DB 없음. 콘텐츠는 `content/` 디렉터리의 MDX/JSON이 단일 진실 공급원(SSOT)이다.

> 설치된 Next.js는 16.x로 기존 지식과 다른 점이 있다. Next.js 코드를 쓰기 전에 `node_modules/next/dist/docs/`의 관련 문서를 먼저 확인한다 (`AGENTS.md` 참고).

## 명령어

```bash
pnpm install        # 의존성 설치
pnpm dev            # 개발 서버 (http://localhost:3000)
pnpm build          # 프로덕션 빌드
pnpm lint           # ESLint
pnpm typecheck      # tsc --noEmit
pnpm format         # Prettier
```

작업 완료 전 `pnpm lint && pnpm typecheck && pnpm build`가 통과해야 한다.

서버(`server/` 디렉터리에서):

```bash
./gradlew bootRun   # 로컬 실행 (http://localhost:8080)
./gradlew test      # 테스트
./gradlew build     # 빌드
```

서버 변경 시 `./gradlew test`가 통과해야 한다.

## 디렉터리 규칙

```
app/            라우트, 레이아웃 (api/chat은 Spring Boot 완성 전 임시용)
server/         Spring Boot 챗봇 API (controller / service / llm / config, 테스트, Dockerfile)
components/ui/        재사용 UI 프리미티브 (Button, Card, Toast, BottomSheet ...)
components/sections/  페이지 섹션 (Intro, DeepDive, TechStack ...)
components/story/     스크롤 연출 섹션 (HeroScroll, WordReveal, ProjectStory, SectionRail)
components/motion/    재사용 모션 프리미티브 (Reveal, CountUp, Marquee ...)
components/chat/      챗봇 UI
content/        프로필·프로젝트·경력 데이터 (사이트와 챗봇이 공유)
lib/            github.ts, llm/, content.ts 등 비 UI 로직
public/         정적 자산
```

- 섹션 컴포넌트는 `content/`에서 데이터를 받아 렌더링만 한다. 문구를 컴포넌트에 하드코딩하지 않는다.
- 한 파일이 약 200줄을 넘으면 분리를 고려한다.

## 코딩 컨벤션

- TypeScript `strict`. `any` 금지(불가피하면 사유 주석). 컴포넌트 props는 명시적 타입.
- 기본은 **Server Component**. 상호작용·브라우저 API·애니메이션이 필요한 곳에만 `"use client"`를 최소 범위로 쓴다.
- 스타일은 Tailwind 유틸리티 + 디자인 토큰(CSS 변수). 임의 값(`w-[137px]`) 남발 금지, 토큰을 먼저 확인한다.
- 이미지는 `next/image`, 링크는 `next/link`. 외부 링크는 `rel="noopener noreferrer"`.
- 네이밍: 컴포넌트 PascalCase, 함수/변수 camelCase, 파일은 컴포넌트 PascalCase / 그 외 kebab-case.
- 주석은 "왜"를 설명할 때만. 자명한 코드에 주석을 달지 않는다.
- 커밋 메시지는 Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`). 한 커밋에 한 가지 변경.

## 디자인 규칙 (토스 스타일)

- 여백 넉넉, 섹션당 메시지 1개, 큰 타이포(제목) + 낮은 대비 회색 본문.
- 폰트: Pretendard. 본문 17px 기준, line-height 1.6.
- 컬러 토큰: 주요 `#3182F6`, 제목 `#191F28`, 본문 `#4E5968`, 보조 `#8B95A1`, 배경 `#F2F4F6`. 새 색을 임의로 추가하지 말고 토큰에 먼저 정의한다.
- 카드 radius 20px, 버튼 radius 14px. 다크 모드를 항상 함께 고려한다(색은 토큰으로만 참조).
- 모션: 짧고 부드럽게(150~400ms, ease-out). 의미 없는 장식 모션 금지. **`prefers-reduced-motion`을 반드시 존중**한다.
- 토스의 로고·이미지·고유 에셋은 사용하지 않는다.

## 접근성 · 성능 기준

- Lighthouse 4개 지표 90+ 유지. 새 의존성 추가 시 번들 크기 영향을 확인한다.
- 키보드로 모든 기능 사용 가능, 포커스 링 유지, 명도 대비 AA, 이미지 `alt` 필수.
- 모바일 우선(360px부터) 반응형.

## Java / Spring Boot 규칙 (`server/`)

- Java 21, Gradle. 패키지는 계층형(`controller` / `service` / `llm` / `config` / `dto`).
- 생성자 주입만 사용(필드 `@Autowired` 금지). 요청/응답은 `record` DTO + Bean Validation.
- 예외는 `@RestControllerAdvice`에서 일관된 에러 응답 포맷으로 처리한다.
- 설정값·키는 `application.yml` + 환경변수로 주입. 키를 코드/로그에 남기지 않는다.
- 외부 호출(LLM)은 타임아웃·재시도·폴백을 둔다. 공급자는 `LlmClient` 인터페이스 뒤에 두고 설정(`llm.provider`)으로 교체.
- CORS는 허용 도메인(프로덕션 사이트 + localhost)만 열어 둔다. `*` 금지.
- 테스트 필수: 서비스 단위 테스트 + 컨트롤러 슬라이스 테스트, 외부 LLM은 MockWebServer로 대체. 실제 외부 API를 호출하는 테스트는 만들지 않는다.
- Dockerfile은 멀티스테이지 빌드, 비루트 사용자로 실행. 헬스체크 엔드포인트(`/actuator/health`) 제공.
- 서버 직군 어필이 목적이므로 설계 의도(왜 이 구조인지)를 `server/README.md`에 짧게 기록한다.

## 챗봇 규칙 (`server/`, `components/chat`)

- LLM 호출은 **서버(Spring Boot)에서만** 한다. API 키를 클라이언트 번들/로그에 노출하지 않는다.
- LLM 공급자는 `LlmClient` 인터페이스 뒤에 두고 환경변수/설정으로 교체 가능하게 한다. 기본값은 Gemini 무료 티어.
- 응답은 SSE로 스트리밍한다. 무료 호스팅 콜드스타트를 고려해 프론트에 "서버 깨우는 중" 상태를 표시한다.
- 지식원은 `content/`만 사용한다. 지식에 없는 내용은 추측하지 않고 "해당 정보는 가지고 있지 않아요"라고 답하도록 시스템 프롬프트에 강제한다.
- 사용자 입력은 신뢰하지 않는다: 길이 제한, 레이트 리밋, 프롬프트 인젝션(역할 변경/시스템 프롬프트 유출 요청) 거부.
- 챗봇은 박명훈 및 이 포트폴리오에 관한 질문에만 답한다.
- 대화 내용은 저장하지 않는다(MVP). 저장이 필요해지면 먼저 PLAN.md를 갱신하고 사용자와 합의한다.

## GitHub 연동 규칙 (`lib/github.ts`)

- 토큰은 서버 전용 `GITHUB_TOKEN`(public 읽기 권한). 클라이언트에서 GitHub API를 직접 호출하지 않는다.
- `fetch`에 `next: { revalidate: 3600 }`로 ISR 캐시. 실패 시 빌드를 깨지 말고 폴백 데이터를 사용한다.

## 환경변수

`.env.local`에만 저장하고 **절대 커밋하지 않는다.** 변경 시 `.env.example`을 함께 갱신한다.

```
# 프론트 (.env.local)
GITHUB_TOKEN=
GITHUB_USERNAME=
NEXT_PUBLIC_CHAT_API_URL=http://localhost:8080

# 서버 (환경변수 또는 server/.env, 커밋 금지)
LLM_PROVIDER=gemini
GEMINI_API_KEY=
ALLOWED_ORIGINS=http://localhost:3000
```

## 콘텐츠 작성 규칙

- 프로젝트 케이스 스터디는 **문제 → 접근 → 의사결정/트레이드오프 → 트러블슈팅 → 결과(수치) → 회고** 구조를 지킨다.
- 서버 프로젝트는 API/DB 설계, 트랜잭션·동시성, 성능 개선 수치, 테스트 전략을 반드시 다룬다.
- 사실이 아닌 성과·수치를 만들어내지 않는다. 확인되지 않은 정보는 `TODO(확인 필요)`로 표시하고 사용자에게 묻는다.
- 문구 톤: 담백하고 구체적으로. 과장 표현("최고의", "완벽한") 지양.

## 작업 방식

- 큰 변경 전에는 PLAN.md의 해당 Phase를 확인하고, 범위를 벗어나는 기능은 먼저 사용자에게 제안한다.
- 요청받지 않은 리팩터링, 의존성 추가, 파일 대량 이동을 하지 않는다.
- 새 기능은 동작을 직접 확인한다(dev 서버에서 확인, 모바일 폭 포함). 확인하지 못한 부분은 숨기지 말고 보고한다.
- 비밀 값, 개인 연락처 등 민감 정보는 사용자가 공개하기로 명시한 것만 `content/`에 넣는다.
- 전 직장(레피소드) 프로젝트는 보안 정책상 소스 코드 링크를 넣지 않는다. 실제 서비스 링크(`kind: "live"`)만 쓴다.

## Git 브랜치

- 모든 개발·수정은 `develop` 브랜치(기본 브랜치)에서 한다.
- `main`은 배포용이다. Vercel Production과 Render 자동 배포가 `main`을 바라본다.
- 배포는 `develop` → `main` PR을 머지해서 한다. `develop` 푸시는 Vercel Preview 배포만 만든다.
