package dev.myeonghun.chat.llm;

import dev.myeonghun.chat.dto.ChatMessage;
import java.util.List;

public record LlmRequest(String systemPrompt, List<ChatMessage> messages) {}
