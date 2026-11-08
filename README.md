# 박명훈 포트폴리오

Java 백엔드 개발자 박명훈의 포트폴리오 사이트와 "박명훈에게 물어보세요" AI 챗봇 서버입니다.

## 구성

| 영역     | 기술                                                            | 위치                          |
| -------- | --------------------------------------------------------------- | ----------------------------- |
| 사이트   | Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Motion | `app/`, `components/`         |
| 챗봇 API | Spring Boot 4 · Java 21 · Gradle · Docker                       | [`server/`](server/README.md) |
| 콘텐츠   | 프로필·프로젝트·경력 JSON (사이트와 챗봇이 함께 사용)           | `content/`                    |

```
브라우저 ──▶ 사이트 (Next.js, 정적 생성)
   └──────▶ 챗봇 API (Spring Boot, SSE 스트리밍) ──▶ Gemini API
```

## 주요 기능

- 토스 스타일 UI: 스크롤 등장, 숫자 카운트업, 롤링 텍스트, 바텀시트, 토스트
- 다크/라이트 모드 (깜빡임 없는 초기 적용, View Transitions 전환 효과)
- AI 챗봇: 포트폴리오 내용만 근거로 답변, 레이트 리밋, 프롬프트 인젝션 완화
- `prefers-reduced-motion` 존중, 키보드 접근성

챗봇 서버의 설계 의도와 테스트는 [server/README.md](server/README.md)에 정리했습니다.

## 실행

```bash
pnpm install
pnpm dev                 # http://localhost:3000

cd server
./gradlew bootRun        # http://localhost:8080 (GEMINI_API_KEY 없으면 데모 모드)
./gradlew test
```

환경변수는 [.env.example](.env.example)을 참고하세요.

## 배포

| 대상     | 서비스                | 설정                                                                                     |
| -------- | --------------------- | ---------------------------------------------------------------------------------------- |
| 사이트   | Vercel                | 레포 연결 → 환경변수 `NEXT_PUBLIC_CHAT_API_URL` = Render 주소                            |
| 챗봇 API | Render (무료, Docker) | 루트의 [`render.yaml`](render.yaml) Blueprint → `GEMINI_API_KEY`, `ALLOWED_ORIGINS` 입력 |

1. Render에서 챗봇 API를 먼저 띄우고 주소(`https://portfolio-chat-xxxx.onrender.com`)를 확인한다.
2. Vercel에 `NEXT_PUBLIC_CHAT_API_URL`을 그 주소로 넣고 배포한다. 타입은 **Config**로 둔다 (Secret이면 `NEXT_PUBLIC_` 변수를 저장할 수 없다).
3. Render의 `ALLOWED_ORIGINS`에 Vercel 주소를 넣고 재배포한다 (CORS).

Render 무료 플랜은 15분간 요청이 없으면 잠들어 첫 응답이 30초~1분 걸린다. 사이트는 챗봇을 열 때 서버를 미리 깨우고, 늦어지면 안내 문구를 보여준다.
