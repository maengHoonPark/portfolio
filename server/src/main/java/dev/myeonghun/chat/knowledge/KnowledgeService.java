package dev.myeonghun.chat.knowledge;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

/**
 * 챗봇이 답변 근거로 쓰는 지식원.
 *
 * <p>사이트와 같은 content/*.json 을 빌드 시 classpath:knowledge/ 로 복사해 쓴다.
 * 데이터가 수천 토큰 수준이라 벡터 DB 없이 전체를 프롬프트에 넣는다 (RAG-lite).
 */
@Component
public class KnowledgeService {

    static final List<String> FILES =
            List.of("profile.json", "projects.json", "skills.json", "experience.json");

    private final String knowledge;

    public KnowledgeService(ResourceLoader resourceLoader) {
        this.knowledge = load(resourceLoader);
    }

    public String knowledge() {
        return knowledge;
    }

    private static String load(ResourceLoader resourceLoader) {
        StringBuilder sb = new StringBuilder();
        for (String file : FILES) {
            Resource resource = resourceLoader.getResource("classpath:knowledge/" + file);
            // 지식원이 빠진 채로 뜨면 챗봇이 엉뚱한 답을 하므로 시작 시점에 실패시킨다
            if (!resource.exists()) {
                throw new IllegalStateException("지식원 파일이 없습니다: knowledge/" + file);
            }
            try (InputStream in = resource.getInputStream()) {
                sb.append("## ").append(file).append('\n')
                        .append(new String(in.readAllBytes(), StandardCharsets.UTF_8).strip())
                        .append("\n\n");
            } catch (IOException e) {
                throw new IllegalStateException("지식원 파일을 읽지 못했습니다: " + file, e);
            }
        }
        return sb.toString().strip();
    }
}
