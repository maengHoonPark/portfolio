package dev.myeonghun.chat.config;

import dev.myeonghun.chat.ratelimit.RateLimiter;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({ChatProperties.class, LlmProperties.class})
public class AppConfig {

    /** 스트리밍 응답은 LLM 응답을 기다리며 오래 블로킹되므로 가상 스레드에서 처리한다. */
    @Bean(destroyMethod = "close")
    public ExecutorService chatExecutor() {
        return Executors.newVirtualThreadPerTaskExecutor();
    }

    @Bean
    public RateLimiter rateLimiter(ChatProperties properties) {
        ChatProperties.RateLimit limit = properties.rateLimit();
        return new RateLimiter(limit.capacity(), limit.refillPerMinute(), System::nanoTime);
    }
}
