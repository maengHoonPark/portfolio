export type ChatRole = "user" | "assistant";
export type ChatMessage = { role: ChatRole; content: string };

export const API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL ?? "http://localhost:8080";

/** 사이트 어디서든 챗봇을 열 때 쓰는 이벤트 이름 */
export const OPEN_CHAT_EVENT = "portfolio:open-chat";

export type OpenChatDetail = { question?: string };

/** 사이트 어디서든 챗봇을 연다. question을 주면 열자마자 그 질문을 보낸다. */
export function openChat(question?: string) {
  window.dispatchEvent(new CustomEvent<OpenChatDetail>(OPEN_CHAT_EVENT, { detail: { question } }));
}

/** 서버 ChatService.MAX_QUESTION_LENGTH 와 맞춘다 */
export const MAX_QUESTION_LENGTH = 500;

/** 사용자에게 그대로 보여줘도 되는 오류 */
export class ChatError extends Error {}

type StreamOptions = {
  messages: ChatMessage[];
  signal: AbortSignal;
  onToken: (text: string) => void;
};

/**
 * POST /api/chat 의 SSE 응답을 읽어 토큰을 흘려보낸다.
 * EventSource는 POST를 지원하지 않아 fetch 스트림을 직접 파싱한다.
 */
export async function streamChat({ messages, signal, onToken }: StreamOptions): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream, application/json",
      },
      body: JSON.stringify({ messages }),
      signal,
    });
  } catch (e) {
    if (signal.aborted) throw e;
    throw new ChatError("챗봇 서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  if (!res.ok || !res.body) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new ChatError(body?.message ?? "답변을 받지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let boundary = buffer.search(/\r?\n\r?\n/);
    while (boundary !== -1) {
      const raw = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary).replace(/^\r?\n\r?\n/, "");
      const event = parseEvent(raw);
      if (event.name === "token") onToken((JSON.parse(event.data) as { text: string }).text);
      if (event.name === "error")
        throw new ChatError((JSON.parse(event.data) as { message: string }).message);
      if (event.name === "done") return;
      boundary = buffer.search(/\r?\n\r?\n/);
    }
  }
  throw new ChatError("답변이 중간에 끊겼어요. 다시 시도해 주세요.");
}

function parseEvent(raw: string) {
  let name = "message";
  const data: string[] = [];
  for (const line of raw.split(/\r?\n/)) {
    if (line.startsWith("event:")) name = line.slice(6).trim();
    else if (line.startsWith("data:")) data.push(line.slice(5).replace(/^ /, ""));
  }
  return { name, data: data.join("\n") };
}

/** 무료 호스팅의 콜드스타트를 줄이려고 챗봇을 열 때 미리 서버를 깨운다 */
export function wakeServer() {
  fetch(`${API_URL}/actuator/health`, { mode: "no-cors" }).catch(() => {});
}
