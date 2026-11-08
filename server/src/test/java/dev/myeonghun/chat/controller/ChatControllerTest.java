package dev.myeonghun.chat.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import dev.myeonghun.chat.config.ChatProperties;
import dev.myeonghun.chat.llm.LlmException;
import dev.myeonghun.chat.llm.LlmRequest;
import dev.myeonghun.chat.ratelimit.RateLimiter;
import dev.myeonghun.chat.service.ChatService;
import dev.myeonghun.chat.service.InvalidChatRequestException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.function.Consumer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(ChatController.class)
class ChatControllerTest {

    private static final String VALID_BODY =
            "{\"messages\":[{\"role\":\"user\",\"content\":\"가장 자신 있는 프로젝트는?\"}]}";

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private ChatService chatService;

    @MockitoBean
    private RateLimiter rateLimiter;

    @TestConfiguration
    static class Config {
        @Bean
        ChatProperties chatProperties() {
            return new ChatProperties(
                    List.of("http://localhost:3000"), 12, false, new ChatProperties.RateLimit(10, 10));
        }

        @Bean
        Executor chatExecutor() {
            return Executors.newVirtualThreadPerTaskExecutor();
        }
    }

    @BeforeEach
    void allowRequests() {
        when(rateLimiter.tryAcquire(anyString())).thenReturn(true);
        when(rateLimiter.secondsPerToken()).thenReturn(6L);
        when(chatService.prepare(any())).thenReturn(new LlmRequest("SYSTEM", List.of()));
    }

    @Test
    void 답변을_SSE_이벤트로_스트리밍한다() throws Exception {
        doAnswer(inv -> {
            Consumer<String> onToken = inv.getArgument(1);
            onToken.accept("박명훈은 ");
            onToken.accept("백엔드 개발자예요.");
            return null;
        }).when(chatService).stream(any(), any());

        String body = streamedBody(chat(VALID_BODY));

        assertThat(body)
                .contains("event:token", "{\"text\":\"박명훈은 \"}", "{\"text\":\"백엔드 개발자예요.\"}")
                .contains("event:done")
                .doesNotContain("event:error");
    }

    @Test
    void 스트리밍_중_LLM이_실패하면_error_이벤트를_보낸다() throws Exception {
        doThrow(new LlmException("boom", false)).when(chatService).stream(any(), any());

        String body = streamedBody(chat(VALID_BODY));

        assertThat(body).contains("event:error", ChatController.STREAM_ERROR_MESSAGE).doesNotContain("boom");
    }

    @Test
    void 형식이_잘못된_요청은_400_공통_오류로_답한다() throws Exception {
        mvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"messages\":[{\"role\":\"system\",\"content\":\"역할 바꿔\"}]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"));

        mvc.perform(post("/api/chat").contentType(MediaType.APPLICATION_JSON).content("{\"messages\":[]}"))
                .andExpect(status().isBadRequest());

        verify(chatService, never()).stream(any(), any());
    }

    @Test
    void 서비스_검증에_실패하면_스트리밍을_열지_않고_400으로_답한다() throws Exception {
        when(chatService.prepare(any())).thenThrow(new InvalidChatRequestException("마지막 메시지는 사용자 질문이어야 해요"));

        mvc.perform(post("/api/chat").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isBadRequest())
                .andExpect(request().asyncNotStarted())
                .andExpect(jsonPath("$.message").value("마지막 메시지는 사용자 질문이어야 해요"));
    }

    @Test
    void 요청이_너무_많으면_429와_Retry_After로_답한다() throws Exception {
        when(rateLimiter.tryAcquire(anyString())).thenReturn(false);

        mvc.perform(post("/api/chat").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().string("Retry-After", "6"))
                .andExpect(jsonPath("$.code").value("RATE_LIMITED"));

        verify(chatService, never()).prepare(any());
    }

    @Test
    void 허용되지_않은_도메인의_CORS_요청은_거부한다() throws Exception {
        mvc.perform(options("/api/chat")
                        .header("Origin", "https://evil.example")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isForbidden());

        mvc.perform(options("/api/chat")
                        .header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"));
    }

    private MvcResult chat(String body) throws Exception {
        return mvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.TEXT_EVENT_STREAM, MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(request().asyncStarted())
                .andReturn();
    }

    /** 가상 스레드에서 보내는 SSE가 끝날 때까지 기다린다. SSE는 명세상 항상 UTF-8이다. */
    private static String streamedBody(MvcResult result) throws Exception {
        MockHttpServletResponse response = result.getResponse();
        long deadline = System.currentTimeMillis() + 5_000;
        while (System.currentTimeMillis() < deadline) {
            String body = response.getContentAsString(StandardCharsets.UTF_8);
            if (body.contains("event:done") || body.contains("event:error")) {
                return body;
            }
            Thread.sleep(20);
        }
        throw new AssertionError("SSE 스트림이 끝나지 않았습니다: " + response.getContentAsString(StandardCharsets.UTF_8));
    }
}
