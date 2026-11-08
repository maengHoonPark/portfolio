package dev.myeonghun.chat.llm;

import java.util.function.Consumer;

/** LLM 공급자 추상화. 설정(llm.provider)으로 구현체를 바꾼다. */
public interface LlmClient {

    /**
     * 응답을 토큰(텍스트 조각) 단위로 흘려보낸다. 완료될 때까지 블로킹한다.
     *
     * @throws LlmException 공급자 호출이 실패한 경우
     */
    void stream(LlmRequest request, Consumer<String> onToken);
}
