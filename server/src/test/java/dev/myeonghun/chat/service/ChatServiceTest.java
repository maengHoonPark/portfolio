package dev.myeonghun.chat.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import dev.myeonghun.chat.config.ChatProperties;
import dev.myeonghun.chat.dto.ChatMessage;
import dev.myeonghun.chat.knowledge.PromptFactory;
import dev.myeonghun.chat.llm.LlmClient;
import dev.myeonghun.chat.llm.LlmRequest;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ChatServiceTest {

    private ChatService service;

    @BeforeEach
    void setUp() {
        ChatProperties properties = new ChatProperties(List.of(), 3, false, new ChatProperties.RateLimit(10, 10));
        service = new ChatService(mock(LlmClient.class), systemPromptFactory(), properties);
    }

    @Test
    void 시스템_프롬프트와_대화를_LLM_요청으로_만든다() {
        LlmRequest request = service.prepare(List.of(user("안녕하세요")));

        assertThat(request.systemPrompt()).isEqualTo("SYSTEM");
        assertThat(request.messages()).containsExactly(user("안녕하세요"));
    }

    @Test
    void 최근_대화만_남기고_사용자_메시지로_시작하게_자른다() {
        List<ChatMessage> history = List.of(
                user("q1"), assistant("a1"), user("q2"), assistant("a2"), user("q3"));

        // 최근 3개는 [q2, a2, q3] 이고, 이미 사용자 메시지로 시작한다
        assertThat(service.prepare(history).messages())
                .containsExactly(user("q2"), assistant("a2"), user("q3"));
    }

    @Test
    void 잘린_대화가_어시스턴트로_시작하면_그_메시지를_버린다() {
        ChatService keepTwo = new ChatService(
                mock(LlmClient.class),
                systemPromptFactory(),
                new ChatProperties(List.of(), 2, false, new ChatProperties.RateLimit(10, 10)));
        List<ChatMessage> history = List.of(user("q1"), assistant("a1"), user("q2"), assistant("a2"), user("q3"));

        // 최근 2개는 [a2, q3]인데 어시스턴트로 시작하므로 [q3]만 남는다
        assertThat(keepTwo.prepare(history).messages()).containsExactly(user("q3"));
    }

    @Test
    void 마지막_메시지가_사용자_질문이_아니면_거절한다() {
        assertThatThrownBy(() -> service.prepare(List.of(user("q"), assistant("a"))))
                .isInstanceOf(InvalidChatRequestException.class);
    }

    @Test
    void 질문이_너무_길면_거절한다() {
        String longQuestion = "가".repeat(ChatService.MAX_QUESTION_LENGTH + 1);

        assertThatThrownBy(() -> service.prepare(List.of(user(longQuestion))))
                .isInstanceOf(InvalidChatRequestException.class)
                .hasMessageContaining("500자");
    }

    private static PromptFactory systemPromptFactory() {
        PromptFactory promptFactory = mock(PromptFactory.class);
        when(promptFactory.systemPrompt()).thenReturn("SYSTEM");
        return promptFactory;
    }

    private static ChatMessage user(String content) {
        return new ChatMessage(ChatMessage.USER, content);
    }

    private static ChatMessage assistant(String content) {
        return new ChatMessage(ChatMessage.ASSISTANT, content);
    }
}
