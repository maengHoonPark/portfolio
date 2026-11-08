package dev.myeonghun.chat.llm;

public class LlmException extends RuntimeException {

    private final boolean retryable;

    public LlmException(String message, boolean retryable) {
        super(message);
        this.retryable = retryable;
    }

    public LlmException(String message, boolean retryable, Throwable cause) {
        super(message, cause);
        this.retryable = retryable;
    }

    /** 일시적 장애(429, 5xx, 연결 실패)라 다시 시도해 볼 만한지 */
    public boolean isRetryable() {
        return retryable;
    }
}
