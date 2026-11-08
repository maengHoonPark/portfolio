package dev.myeonghun.chat.llm;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.sun.net.httpserver.HttpServer;
import dev.myeonghun.chat.dto.ChatMessage;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/** 실제 Gemini 대신 JDK 내장 HTTP 서버로 응답을 흉내 낸다 (외부 API 호출 없음). */
class GeminiClientTest {

    private static final JsonMapper JSON = JsonMapper.builder().build();
    private static final LlmRequest REQUEST = new LlmRequest(
            "SYSTEM",
            List.of(
                    new ChatMessage(ChatMessage.USER, "질문1"),
                    new ChatMessage(ChatMessage.ASSISTANT, "답변1"),
                    new ChatMessage(ChatMessage.USER, "질문2")));

    private HttpServer server;
    private final Queue<FakeResponse> responses = new ConcurrentLinkedQueue<>();
    private final List<RecordedRequest> requests = new ArrayList<>();

    @BeforeEach
    void startServer() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/", exchange -> {
            synchronized (requests) {
                requests.add(new RecordedRequest(
                        exchange.getRequestURI().toString(),
                        exchange.getRequestHeaders().getFirst("x-goog-api-key"),
                        new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8)));
            }
            FakeResponse response = responses.poll();
            byte[] body = response.body().getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "text/event-stream");
            exchange.sendResponseHeaders(response.status(), body.length);
            try (OutputStream out = exchange.getResponseBody()) {
                out.write(body);
            }
        });
        server.start();
    }

    @AfterEach
    void stopServer() {
        server.stop(0);
    }

    @Test
    void SSE_조각을_토큰으로_흘려보낸다() {
        responses.add(new FakeResponse(200, sse("안녕", "하세요") + sse("!")));

        List<String> tokens = new ArrayList<>();
        client(2).stream(REQUEST, tokens::add);

        assertThat(tokens).containsExactly("안녕", "하세요", "!");
    }

    @Test
    void 키는_헤더로_보내고_대화_역할을_Gemini_형식으로_바꾼다() {
        responses.add(new FakeResponse(200, sse("ok")));

        client(0).stream(REQUEST, t -> {});

        RecordedRequest recorded = requests.getFirst();
        assertThat(recorded.uri()).isEqualTo("/v1beta/models/test-model:streamGenerateContent?alt=sse");
        assertThat(recorded.apiKey()).isEqualTo("test-key");
        assertThat(recorded.uri()).doesNotContain("test-key");

        JsonNode body = JSON.readTree(recorded.body());
        assertThat(body.at("/systemInstruction/parts/0/text").asString()).isEqualTo("SYSTEM");
        assertThat(body.at("/contents/0/role").asString()).isEqualTo("user");
        assertThat(body.at("/contents/1/role").asString()).isEqualTo("model");
        assertThat(body.at("/contents/2/parts/0/text").asString()).isEqualTo("질문2");
    }

    @Test
    void 일시적_오류는_재시도해서_성공한다() {
        responses.add(new FakeResponse(503, "{}"));
        responses.add(new FakeResponse(429, "{}"));
        responses.add(new FakeResponse(200, sse("복구")));

        List<String> tokens = new ArrayList<>();
        client(2).stream(REQUEST, tokens::add);

        assertThat(tokens).containsExactly("복구");
        assertThat(requests).hasSize(3);
    }

    @Test
    void 재시도_횟수를_넘기면_실패한다() {
        responses.add(new FakeResponse(503, "{}"));
        responses.add(new FakeResponse(503, "{}"));

        assertThatThrownBy(() -> client(1).stream(REQUEST, t -> {}))
                .isInstanceOf(LlmException.class)
                .hasMessageContaining("503");
        assertThat(requests).hasSize(2);
    }

    @Test
    void 요청_자체가_잘못되면_재시도하지_않는다() {
        responses.add(new FakeResponse(400, "{}"));

        assertThatThrownBy(() -> client(3).stream(REQUEST, t -> {}))
                .isInstanceOf(LlmException.class)
                .satisfies(e -> assertThat(((LlmException) e).isRetryable()).isFalse());
        assertThat(requests).hasSize(1);
    }

    private GeminiClient client(int maxRetries) {
        return new GeminiClient(
                "http://127.0.0.1:" + server.getAddress().getPort(),
                "test-key",
                "test-model",
                Duration.ofSeconds(5),
                maxRetries,
                Duration.ofMillis(1),
                JSON);
    }

    /** Gemini streamGenerateContent(alt=sse)의 한 이벤트 */
    private static String sse(String... parts) {
        StringBuilder json = new StringBuilder("{\"candidates\":[{\"content\":{\"role\":\"model\",\"parts\":[");
        for (int i = 0; i < parts.length; i++) {
            json.append(i == 0 ? "" : ",").append("{\"text\":\"").append(parts[i]).append("\"}");
        }
        json.append("]}}]}");
        return "data: " + json + "\r\n\r\n";
    }

    private record FakeResponse(int status, String body) {}

    private record RecordedRequest(String uri, String apiKey, String body) {}
}
