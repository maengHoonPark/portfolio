# portfolio-chat — "박명훈에게 물어보세요" 챗봇 API

포트폴리오 사이트의 챗봇 백엔드. Spring Boot 4 · Java 21 · Gradle.

## 실행

```bash
# JDK 21 필요. 키가 없으면 데모(fake) 모드로 뜬다
GEMINI_API_KEY=... ./gradlew bootRun   # http://localhost:8080
./gradlew test
```

| 환경변수              | 기본값                  | 설명                          |
| --------------------- | ----------------------- | ----------------------------- |
| `GEMINI_API_KEY`      | (없음)                  | 없으면 데모 응답만 스트리밍   |
| `GEMINI_MODEL`        | `gemini-2.5-flash`      | 사용할 Gemini 모델            |
| `LLM_PROVIDER`        | `gemini`                | `gemini` 또는 `fake`          |
| `ALLOWED_ORIGINS`     | `http://localhost:3000` | CORS 허용 도메인 (쉼표 구분)  |
| `TRUST_FORWARDED_FOR` | `false`                 | 리버스 프록시 뒤에서만 `true` |
| `PORT`                | `8080`                  |                               |

Docker (저장소 루트에서): `docker build -f server/Dockerfile -t portfolio-chat .`

## API

`POST /api/chat` — `{"messages":[{"role":"user","content":"..."}]}`
응답은 SSE: `token` `{"text"}` → `done`, 실패 시 `error` `{"message"}`.
검증 실패(400)·레이트 리밋(429, `Retry-After`)은 스트림을 열기 전에 `{"code","message"}` JSON으로 답한다.

## 설계 메모 (왜 이렇게 만들었나)

- **DB 없는 RAG-lite**: 지식원이 프로필·프로젝트·경력 JSON 수천 토큰뿐이라 벡터 DB 없이 전부 시스템 프롬프트에 넣는다.
  빌드 시 `../content/*.json`을 `classpath:knowledge/`로 복사해 **사이트와 같은 데이터**를 쓴다. 파일이 빠지면 기동 시 실패한다.
- **공급자 추상화**: `LlmClient` 인터페이스 뒤에 `GeminiClient`/`FakeLlmClient`. 설정만으로 교체한다.
- **재시도는 첫 토큰 전까지만**: 429·5xx·연결 실패만 재시도하고, 이미 토큰을 흘려보낸 뒤에는 재시도하지 않는다 (답변 중복 방지).
- **검증을 스트리밍 앞에**: 잘못된 요청은 SSE를 열기 전에 일반 HTTP 오류로 돌려줘 클라이언트 처리를 단순하게 한다.
- **가상 스레드**: LLM 응답을 기다리는 블로킹 I/O가 대부분이라 요청마다 가상 스레드에서 스트리밍한다.
- **인메모리 토큰 버킷**: 단일 인스턴스 전제로 외부 의존성 없이 구현했다. 수평 확장 시에는 Redis 기반으로 바꿔야 한다.
- **보안**: API 키는 URL이 아닌 헤더로 보내고 로그에 남기지 않는다. CORS는 허용 도메인만 연다.
  프롬프트 인젝션은 시스템 프롬프트 규칙과 질문 길이 제한으로 완화한다 (완전히 막을 수는 없다는 전제).

## 테스트

| 테스트               | 검증하는 것                                                    |
| -------------------- | -------------------------------------------------------------- |
| `GeminiClientTest`   | JDK 내장 HTTP 서버로 SSE 파싱, 역할 변환, 키 헤더, 재시도 정책 |
| `ChatControllerTest` | SSE 이벤트, 400/429 공통 오류 포맷, CORS 허용·거부             |
| `ChatServiceTest`    | 대화 자르기, 마지막 메시지·길이 검증                           |
| `RateLimiterTest`    | 토큰 버킷 소비·충전·상한 (가짜 시계)                           |
| `PromptFactoryTest`  | 지식원 로딩, 안전 규칙 포함                                    |

실제 외부 API를 호출하는 테스트는 없다.
