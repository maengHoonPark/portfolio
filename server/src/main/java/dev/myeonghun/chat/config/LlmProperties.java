package dev.myeonghun.chat.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "llm")
public record LlmProperties(
        String provider,
        Duration timeout,
        int maxRetries,
        Duration retryBackoff,
        Gemini gemini) {

    public record Gemini(String apiKey, String model, String baseUrl) {}
}
