package dev.myeonghun.chat.llm;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import dev.myeonghun.chat.dto.ChatMessage;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Consumer;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.json.JsonMapper;

/**
 * Google Gemini API 클라이언트 (streamGenerateContent, SSE).
 *
 * <p>재시도는 "아직 토큰을 하나도 내보내지 않은" 일시적 장애에만 한다.
 * 중간까지 흘려보낸 뒤 재시도하면 사용자 화면에 답이 중복되기 때문이다.
 */
public class GeminiClient implements LlmClient {

    private final RestClient restClient;
    private final JsonMapper jsonMapper;
    private final String model;
    private final int maxRetries;
    private final Duration retryBackoff;

    public GeminiClient(
            String baseUrl,
            String apiKey,
            String model,
            Duration timeout,
            int maxRetries,
            Duration retryBackoff,
            JsonMapper jsonMapper) {
        HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(timeout);
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(requestFactory)
                // 키는 URL 쿼리가 아닌 헤더로 보낸다 (URL은 로그에 남기 쉽다)
                .defaultHeader("x-goog-api-key", apiKey)
                .build();
        this.jsonMapper = jsonMapper;
        this.model = model;
        this.maxRetries = maxRetries;
        this.retryBackoff = retryBackoff;
    }

    @Override
    public void stream(LlmRequest request, Consumer<String> onToken) {
        String body = jsonMapper.writeValueAsString(toRequestBody(request));
        for (int attempt = 0; ; attempt++) {
            AtomicBoolean emitted = new AtomicBoolean(false);
            try {
                streamOnce(body, token -> {
                    emitted.set(true);
                    onToken.accept(token);
                });
                return;
            } catch (LlmException e) {
                if (!e.isRetryable() || emitted.get() || attempt >= maxRetries) {
                    throw e;
                }
                sleep(retryBackoff.multipliedBy(attempt + 1L));
            }
        }
    }

    private void streamOnce(String body, Consumer<String> onToken) {
        try {
            restClient.post()
                    .uri("/v1beta/models/{model}:streamGenerateContent?alt=sse", model)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.TEXT_EVENT_STREAM)
                    .body(body)
                    .exchange((req, res) -> {
                        HttpStatusCode status = res.getStatusCode();
                        if (status.value() == 429 || status.is5xxServerError()) {
                            throw new LlmException("LLM 공급자 일시 오류: HTTP " + status.value(), true);
                        }
                        if (status.isError()) {
                            throw new LlmException("LLM 요청 실패: HTTP " + status.value(), false);
                        }
                        try (BufferedReader reader = new BufferedReader(
                                new InputStreamReader(res.getBody(), StandardCharsets.UTF_8))) {
                            String line;
                            while ((line = reader.readLine()) != null) {
                                if (!line.startsWith("data:")) {
                                    continue;
                                }
                                String data = line.substring(5).strip();
                                if (!data.isEmpty()) {
                                    jsonMapper.readValue(data, Chunk.class).texts().forEach(onToken);
                                }
                            }
                        }
                        return null;
                    });
        } catch (ResourceAccessException e) {
            throw new LlmException("LLM 공급자에 연결하지 못했습니다", true, e);
        }
    }

    static Map<String, Object> toRequestBody(LlmRequest request) {
        List<Map<String, Object>> contents = request.messages().stream()
                .map(GeminiClient::toContent)
                .toList();
        return Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", request.systemPrompt()))),
                "contents", contents,
                "generationConfig", Map.of("temperature", 0.3, "maxOutputTokens", 2048));
    }

    private static Map<String, Object> toContent(ChatMessage message) {
        // Gemini는 어시스턴트 역할을 "model"로 부른다
        String role = message.isUser() ? "user" : "model";
        return Map.of("role", role, "parts", List.of(Map.of("text", message.content())));
    }

    private static void sleep(Duration duration) {
        try {
            Thread.sleep(duration);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new LlmException("재시도 대기 중 중단되었습니다", false, e);
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Chunk(List<Candidate> candidates) {
        List<String> texts() {
            if (candidates == null) {
                return List.of();
            }
            return candidates.stream()
                    .map(Candidate::content)
                    .filter(Objects::nonNull)
                    .flatMap(c -> c.parts() == null ? java.util.stream.Stream.empty() : c.parts().stream())
                    .map(Part::text)
                    .filter(Objects::nonNull)
                    .toList();
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Candidate(Content content) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Content(List<Part> parts) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Part(String text) {}
}
