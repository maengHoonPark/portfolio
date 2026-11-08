package dev.myeonghun.chat.ratelimit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.Test;

class RateLimiterTest {

    private static final long SECOND = 1_000_000_000L;

    private final AtomicLong clock = new AtomicLong(0);

    @Test
    void 용량만큼은_허용하고_초과하면_거절한다() {
        RateLimiter limiter = new RateLimiter(3, 60, clock::get);

        assertThat(limiter.tryAcquire("a")).isTrue();
        assertThat(limiter.tryAcquire("a")).isTrue();
        assertThat(limiter.tryAcquire("a")).isTrue();
        assertThat(limiter.tryAcquire("a")).isFalse();
    }

    @Test
    void 시간이_지나면_토큰이_다시_찬다() {
        RateLimiter limiter = new RateLimiter(1, 60, clock::get); // 1초에 1개

        assertThat(limiter.tryAcquire("a")).isTrue();
        assertThat(limiter.tryAcquire("a")).isFalse();

        clock.addAndGet(SECOND);
        assertThat(limiter.tryAcquire("a")).isTrue();
    }

    @Test
    void 오래_쉬어도_용량을_넘게_쌓이지_않는다() {
        RateLimiter limiter = new RateLimiter(2, 60, clock::get);
        limiter.tryAcquire("a");

        clock.addAndGet(3600 * SECOND);

        assertThat(limiter.tryAcquire("a")).isTrue();
        assertThat(limiter.tryAcquire("a")).isTrue();
        assertThat(limiter.tryAcquire("a")).isFalse();
    }

    @Test
    void 클라이언트마다_버킷이_따로다() {
        RateLimiter limiter = new RateLimiter(1, 60, clock::get);

        assertThat(limiter.tryAcquire("a")).isTrue();
        assertThat(limiter.tryAcquire("b")).isTrue();
        assertThat(limiter.tryAcquire("a")).isFalse();
    }

    @Test
    void 토큰_하나가_차는_시간을_초로_알려준다() {
        assertThat(new RateLimiter(10, 10, clock::get).secondsPerToken()).isEqualTo(6);
        assertThat(new RateLimiter(10, 60, clock::get).secondsPerToken()).isEqualTo(1);
    }

    @Test
    void 잘못된_설정은_거부한다() {
        assertThatThrownBy(() -> new RateLimiter(0, 10, clock::get))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
