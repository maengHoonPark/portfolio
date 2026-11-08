package dev.myeonghun.chat.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "chat")
public record ChatProperties(
        List<String> allowedOrigins,
        int maxHistory,
        boolean trustForwardedFor,
        RateLimit rateLimit) {

    public record RateLimit(int capacity, int refillPerMinute) {}
}
