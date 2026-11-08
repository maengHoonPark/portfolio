package dev.myeonghun.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ChatMessage(
        @NotNull @Pattern(regexp = "user|assistant", message = "role은 user 또는 assistant여야 해요") String role,
        @NotBlank @Size(max = 4000) String content) {

    public static final String USER = "user";
    public static final String ASSISTANT = "assistant";

    public boolean isUser() {
        return USER.equals(role);
    }
}
