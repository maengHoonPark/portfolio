package dev.myeonghun.chat.ratelimit;

import java.util.concurrent.ConcurrentHashMap;
import java.util.function.LongSupplier;

/**
 * 클라이언트별 토큰 버킷 레이트 리미터 (인메모리).
 *
 * <p>단일 인스턴스·소규모 트래픽을 전제로 외부 의존성(Redis, Bucket4j) 없이 구현했다.
 * 인스턴스를 늘리면 버킷이 인스턴스마다 따로 생기므로 그때는 Redis 기반으로 바꿔야 한다.
 */
public class RateLimiter {

    private static final long NANOS_PER_MINUTE = 60_000_000_000L;
    /** 키가 무한히 늘어나 메모리를 잡아먹지 않도록 하는 상한 */
    private static final int MAX_TRACKED_CLIENTS = 10_000;

    private final int capacity;
    private final double tokensPerNano;
    private final LongSupplier nanoClock;
    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    public RateLimiter(int capacity, int refillPerMinute, LongSupplier nanoClock) {
        if (capacity <= 0 || refillPerMinute <= 0) {
            throw new IllegalArgumentException("capacity와 refillPerMinute는 양수여야 합니다");
        }
        this.capacity = capacity;
        this.tokensPerNano = (double) refillPerMinute / NANOS_PER_MINUTE;
        this.nanoClock = nanoClock;
    }

    public boolean tryAcquire(String clientKey) {
        if (buckets.size() > MAX_TRACKED_CLIENTS) {
            buckets.clear();
        }
        Bucket bucket = buckets.computeIfAbsent(clientKey, k -> new Bucket(capacity, nanoClock.getAsLong()));
        synchronized (bucket) {
            long now = nanoClock.getAsLong();
            bucket.tokens = Math.min(capacity, bucket.tokens + (now - bucket.lastRefill) * tokensPerNano);
            bucket.lastRefill = now;
            if (bucket.tokens >= 1) {
                bucket.tokens -= 1;
                return true;
            }
            return false;
        }
    }

    /** 토큰 하나가 다시 차는 데 걸리는 시간(초). Retry-After 헤더에 쓴다. */
    public long secondsPerToken() {
        return (long) Math.ceil(1 / tokensPerNano / 1_000_000_000L);
    }

    private static final class Bucket {
        private double tokens;
        private long lastRefill;

        private Bucket(double tokens, long lastRefill) {
            this.tokens = tokens;
            this.lastRefill = lastRefill;
        }
    }
}
