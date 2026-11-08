package dev.myeonghun.chat.dto;

/** 모든 오류 응답의 공통 포맷 */
public record ErrorResponse(String code, String message) {}
