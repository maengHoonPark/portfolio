package dev.myeonghun.chat.llm;

import java.util.function.Consumer;

/** API 키 없이 로컬에서 화면·스트리밍 흐름을 개발할 때 쓰는 가짜 공급자. */
public class FakeLlmClient implements LlmClient {

    static final String DEMO_ANSWER =
            "지금은 데모 모드라 실제 답변을 만들 수 없어요. 서버에 GEMINI_API_KEY를 설정하면 "
                    + "박명훈의 경력과 프로젝트에 대해 답할 수 있어요.";

    private final long delayMillis;

    public FakeLlmClient(long delayMillis) {
        this.delayMillis = delayMillis;
    }

    @Override
    public void stream(LlmRequest request, Consumer<String> onToken) {
        for (String word : DEMO_ANSWER.split("(?<= )")) {
            onToken.accept(word);
            pause();
        }
    }

    private void pause() {
        if (delayMillis <= 0) {
            return;
        }
        try {
            Thread.sleep(delayMillis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new LlmException("중단되었습니다", false, e);
        }
    }
}
