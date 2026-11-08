package dev.myeonghun.chat.service;

import dev.myeonghun.chat.config.ChatProperties;
import dev.myeonghun.chat.dto.ChatMessage;
import dev.myeonghun.chat.knowledge.PromptFactory;
import dev.myeonghun.chat.llm.LlmClient;
import dev.myeonghun.chat.llm.LlmRequest;
import java.util.List;
import java.util.function.Consumer;
import org.springframework.stereotype.Service;

@Service
public class ChatService {

    /** 사용자가 한 번에 보낼 수 있는 질문 길이. 프론트 입력 제한과 맞춘다. */
    public static final int MAX_QUESTION_LENGTH = 500;

    private final LlmClient llmClient;
    private final PromptFactory promptFactory;
    private final int maxHistory;

    public ChatService(LlmClient llmClient, PromptFactory promptFactory, ChatProperties properties) {
        this.llmClient = llmClient;
        this.promptFactory = promptFactory;
        this.maxHistory = properties.maxHistory();
    }

    /**
     * 대화를 검증하고 LLM 요청으로 만든다.
     * 스트리밍을 시작하기 전에 호출해서, 잘못된 요청은 SSE가 아닌 400 응답으로 돌려준다.
     */
    public LlmRequest prepare(List<ChatMessage> messages) {
        ChatMessage last = messages.getLast();
        if (!last.isUser()) {
            throw new InvalidChatRequestException("마지막 메시지는 사용자 질문이어야 해요");
        }
        if (last.content().length() > MAX_QUESTION_LENGTH) {
            throw new InvalidChatRequestException("질문은 " + MAX_QUESTION_LENGTH + "자 이내로 입력해 주세요");
        }

        // 비용과 지연을 줄이려고 최근 대화만 넘긴다
        List<ChatMessage> recent = messages.subList(Math.max(0, messages.size() - maxHistory), messages.size());
        // LLM API는 대화가 사용자 메시지로 시작해야 하므로 앞쪽 어시스턴트 메시지를 잘라낸다
        int firstUser = 0;
        while (!recent.get(firstUser).isUser()) {
            firstUser++;
        }
        return new LlmRequest(promptFactory.systemPrompt(), List.copyOf(recent.subList(firstUser, recent.size())));
    }

    public void stream(LlmRequest request, Consumer<String> onToken) {
        llmClient.stream(request, onToken);
    }
}
