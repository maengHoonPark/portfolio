package dev.myeonghun.chat.config;

import dev.myeonghun.chat.llm.FakeLlmClient;
import dev.myeonghun.chat.llm.GeminiClient;
import dev.myeonghun.chat.llm.LlmClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.json.JsonMapper;

@Configuration
public class LlmConfig {

    private static final Logger log = LoggerFactory.getLogger(LlmConfig.class);

    @Bean
    public LlmClient llmClient(LlmProperties properties, JsonMapper jsonMapper) {
        return switch (properties.provider()) {
            case "gemini" -> {
                LlmProperties.Gemini gemini = properties.gemini();
                if (gemini.apiKey() == null || gemini.apiKey().isBlank()) {
                    log.warn("GEMINI_API_KEY가 설정되지 않아 데모(fake) 모드로 실행합니다");
                    yield new FakeLlmClient(40);
                }
                log.info("LLM 공급자: gemini ({})", gemini.model());
                yield new GeminiClient(
                        gemini.baseUrl(),
                        gemini.apiKey(),
                        gemini.model(),
                        properties.timeout(),
                        properties.maxRetries(),
                        properties.retryBackoff(),
                        jsonMapper);
            }
            case "fake" -> new FakeLlmClient(40);
            default -> throw new IllegalStateException("지원하지 않는 llm.provider: " + properties.provider());
        };
    }
}
