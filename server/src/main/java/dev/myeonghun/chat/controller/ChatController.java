package dev.myeonghun.chat.controller;

import dev.myeonghun.chat.config.ChatProperties;
import dev.myeonghun.chat.dto.ChatRequest;
import dev.myeonghun.chat.llm.LlmRequest;
import dev.myeonghun.chat.ratelimit.RateLimitExceededException;
import dev.myeonghun.chat.ratelimit.RateLimiter;
import dev.myeonghun.chat.service.ChatService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.Executor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * 챗봇 엔드포인트. 응답은 SSE 이벤트로 흘려보낸다.
 *
 * <ul>
 *   <li>{@code token}: {"text": "..."} 답변 조각
 *   <li>{@code done}: 답변 완료
 *   <li>{@code error}: {"message": "..."} 스트리밍 도중 실패
 * </ul>
 */
@RestController
@RequestMapping("/api")
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);
    private static final Duration STREAM_TIMEOUT = Duration.ofSeconds(90);
    static final String STREAM_ERROR_MESSAGE = "답변을 만들지 못했어요. 잠시 후 다시 시도해 주세요.";

    private final ChatService chatService;
    private final RateLimiter rateLimiter;
    private final Executor chatExecutor;
    private final boolean trustForwardedFor;

    public ChatController(
            ChatService chatService,
            RateLimiter rateLimiter,
            @Qualifier("chatExecutor") Executor chatExecutor,
            ChatProperties properties) {
        this.chatService = chatService;
        this.rateLimiter = rateLimiter;
        this.chatExecutor = chatExecutor;
        this.trustForwardedFor = properties.trustForwardedFor();
    }

    @PostMapping("/chat")
    public SseEmitter chat(@Valid @RequestBody ChatRequest request, HttpServletRequest httpRequest) {
        if (!rateLimiter.tryAcquire(clientKey(httpRequest))) {
            throw new RateLimitExceededException(rateLimiter.secondsPerToken());
        }
        // 검증 실패는 스트리밍을 열기 전에 일반 HTTP 오류(400)로 돌려준다
        LlmRequest llmRequest = chatService.prepare(request.messages());

        SseEmitter emitter = new SseEmitter(STREAM_TIMEOUT.toMillis());
        chatExecutor.execute(() -> streamTo(emitter, llmRequest));
        return emitter;
    }

    private void streamTo(SseEmitter emitter, LlmRequest llmRequest) {
        try {
            chatService.stream(llmRequest, token -> send(emitter, "token", Map.of("text", token)));
            send(emitter, "done", Map.of());
            emitter.complete();
        } catch (UncheckedIOException e) {
            // 사용자가 창을 닫는 등 연결이 끊긴 경우. 더 보낼 곳이 없으니 조용히 끝낸다
            log.debug("클라이언트 연결 종료로 스트리밍 중단");
            emitter.complete();
        } catch (RuntimeException e) {
            log.warn("챗봇 응답 생성 실패: {}", e.getMessage());
            try {
                send(emitter, "error", Map.of("message", STREAM_ERROR_MESSAGE));
                emitter.complete();
            } catch (UncheckedIOException ignored) {
                emitter.complete();
            }
        }
    }

    private static void send(SseEmitter emitter, String event, Object data) {
        try {
            emitter.send(SseEmitter.event().name(event).data(data, MediaType.APPLICATION_JSON));
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    /**
     * 레이트 리밋 키(클라이언트 IP).
     * 프록시 뒤에서는 X-Forwarded-For의 마지막 값(프록시가 직접 본 주소)을 쓴다.
     * 첫 번째 값은 클라이언트가 임의로 넣을 수 있어 신뢰하지 않는다.
     */
    private String clientKey(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (trustForwardedFor && forwarded != null && !forwarded.isBlank()) {
            String[] hops = forwarded.split(",");
            return hops[hops.length - 1].strip();
        }
        return request.getRemoteAddr();
    }
}
