export const AI_CHAT_TIMEOUT_MS = 25_000;
export const AI_CHAT_MAX_HISTORY = 8;
export const AI_CHAT_MAX_HISTORY_LENGTH = 2_400;
export const AI_CHAT_MAX_QUESTION_LENGTH = 800;

type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

type UuidFactory = () => string;

const ALLOWED_HTTPS_ORIGINS = new Set([
  "https://acecore.net",
  "https://systems.acecore.net",
  "https://schools.acecore.net",
  "https://asv.acecore.net",
  "https://asv-wiki.acecore.net",
  "https://world-foundation.acecore.net",
]);
const CENTRAL_ORIGIN = "https://acecore.net";
const LINE_URL = "https://lin.ee/DjIrdqj";
const EMAIL_URL = "mailto:info@acecore.net";
const PHONE_URL = "tel:05088902788";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function generateUuid(): string {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
}

export function createStableClientId(
  uuidFactory: UuidFactory = generateUuid,
): () => string {
  let clientId = "";

  return () => {
    if (clientId) return clientId;
    const candidate = uuidFactory();
    if (!UUID_PATTERN.test(candidate)) {
      throw new Error("AI chat client ID must be a UUID v4.");
    }
    clientId = candidate.toLowerCase();
    return clientId;
  };
}

const getStableClientId = createStableClientId();

export function trimChatHistory(
  messages: readonly ChatMessage[],
): ChatMessage[] {
  const limitedMessages = messages
    .slice(-AI_CHAT_MAX_HISTORY)
    .map(({ role, content }) => ({
      role,
      content: content.slice(0, AI_CHAT_MAX_QUESTION_LENGTH),
    }));
  const trimmedMessages: ChatMessage[] = [];
  let remainingLength = AI_CHAT_MAX_HISTORY_LENGTH;

  for (
    let index = limitedMessages.length - 1;
    index >= 0 && remainingLength > 0;
    index -= 1
  ) {
    const { role, content } = limitedMessages[index];
    const trimmedContent = content.slice(0, remainingLength);
    if (!trimmedContent) continue;
    trimmedMessages.unshift({ role, content: trimmedContent });
    remainingLength -= trimmedContent.length;
  }

  return trimmedMessages;
}

export function normalizeSafeMarkdownHref(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const href = value.trim();
  if (!href || /[\u0000-\u001f\u007f\\]/u.test(href)) return null;

  const lowerHref = href.toLowerCase();
  if (
    lowerHref === EMAIL_URL ||
    lowerHref.startsWith(`${EMAIL_URL}?`) ||
    href === PHONE_URL
  ) {
    return href;
  }

  if (href.startsWith("/") && !href.startsWith("//")) {
    const url = new URL(href, CENTRAL_ORIGIN);
    if (url.origin !== CENTRAL_ORIGIN || url.username || url.password) {
      return null;
    }
    return url.href;
  }

  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }

  if (url.username || url.password) return null;
  if (url.protocol !== "https:") return null;
  if (url.origin === "https://lin.ee") {
    return url.href === LINE_URL ? url.href : null;
  }
  return ALLOWED_HTTPS_ORIGINS.has(url.origin) ? url.href : null;
}

function appendInlineMarkdown(parent: HTMLElement, text: string): void {
  const pattern =
    /(\[([^\]]+)\]\(\s*([^)]+?)\s*\)|\*\*([^*]+)\*\*|__([^_]+)__|`([^`]+)`|\*([^*]+)\*|_([^_]+)_)/g;
  let index = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > index) {
      parent.append(document.createTextNode(text.slice(index, match.index)));
    }

    const label = match[2];
    const safeHref = normalizeSafeMarkdownHref(match[3]);
    if (label && safeHref) {
      const link = document.createElement("a");
      link.href = safeHref;
      link.textContent = label;
      link.rel = "noopener noreferrer";
      if (
        new URL(safeHref, window.location.href).origin !==
        window.location.origin
      ) {
        link.target = "_blank";
      }
      parent.append(link);
    } else if (label) {
      parent.append(document.createTextNode(label));
    } else if (match[4] || match[5]) {
      const strong = document.createElement("strong");
      appendInlineMarkdown(strong, match[4] || match[5]);
      parent.append(strong);
    } else if (match[6]) {
      const code = document.createElement("code");
      code.textContent = match[6];
      parent.append(code);
    } else if (match[7] || match[8]) {
      const emphasis = document.createElement("em");
      appendInlineMarkdown(emphasis, match[7] || match[8]);
      parent.append(emphasis);
    } else {
      parent.append(document.createTextNode(match[0]));
    }

    index = pattern.lastIndex;
  }

  if (index < text.length) {
    parent.append(document.createTextNode(text.slice(index)));
  }
}

function renderMarkdownText(container: HTMLElement, text: string): void {
  container.replaceChildren();
  const lines = String(text || "")
    .replace(/\r\n?/gu, "\n")
    .trim()
    .split("\n");
  let paragraphLines: string[] = [];
  let list: HTMLOListElement | HTMLUListElement | null = null;
  let listType = "";

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    const paragraph = document.createElement("p");
    appendInlineMarkdown(paragraph, paragraphLines.join("\n"));
    container.append(paragraph);
    paragraphLines = [];
  };

  const ensureList = (type: "ol" | "ul") => {
    if (list && listType === type) return list;
    flushParagraph();
    list = document.createElement(type);
    listType = type;
    container.append(list);
    return list;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      list = null;
      listType = "";
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*+・]\s+(.+)$/u);
    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/u);
    if (unorderedMatch || orderedMatch) {
      const item = document.createElement("li");
      appendInlineMarkdown(item, (unorderedMatch || orderedMatch)?.[1] || "");
      ensureList(unorderedMatch ? "ul" : "ol").append(item);
      continue;
    }

    list = null;
    listType = "";
    paragraphLines.push(trimmed.replace(/^#{1,3}\s+/u, ""));
  }

  flushParagraph();
}

export function initSchoolsAiChat(root: HTMLElement): void {
  if (root.dataset.initialized === "true") return;

  const panel = root.querySelector<HTMLElement>("[data-schools-ai-chat-panel]");
  const toggle = root.querySelector<HTMLButtonElement>(
    "[data-schools-ai-chat-toggle]",
  );
  const closeButton = root.querySelector<HTMLButtonElement>(
    "[data-schools-ai-chat-close]",
  );
  const form = root.querySelector<HTMLFormElement>(
    "[data-schools-ai-chat-form]",
  );
  const input = root.querySelector<HTMLTextAreaElement>(
    "[data-schools-ai-chat-input]",
  );
  const submit = root.querySelector<HTMLButtonElement>(
    "[data-schools-ai-chat-submit]",
  );
  const messagesElement = root.querySelector<HTMLElement>(
    "[data-schools-ai-chat-messages]",
  );
  const characterCount = root.querySelector<HTMLElement>(
    "[data-schools-ai-chat-count]",
  );
  const promptButtons = Array.from(
    root.querySelectorAll<HTMLButtonElement>("[data-schools-ai-chat-prompt]"),
  );

  if (
    !panel ||
    !toggle ||
    !closeButton ||
    !form ||
    !input ||
    !submit ||
    !messagesElement ||
    !characterCount
  ) {
    return;
  }

  root.dataset.initialized = "true";
  const endpoint =
    root.dataset.endpoint || "https://acecore.net/api/ai-contact";
  const greeting = root.dataset.greeting || "";
  const loadingText = root.dataset.loading || "回答を確認しています…";
  const genericError = root.dataset.error || "AI案内を利用できません。";
  const timeoutError =
    root.dataset.timeout ||
    "応答に時間がかかっています。少し時間をおいてお試しください。";
  const tooLongError =
    root.dataset.tooLong || "質問は800文字以内で入力してください。";
  let chatHistory: ChatMessage[] = [];
  let greetingShown = false;
  let activeController: AbortController | null = null;
  let lastFocusedElement: HTMLElement | null = null;

  const scrollMessages = () => {
    messagesElement.scrollTop = messagesElement.scrollHeight;
  };

  const renderMessage = (
    role: ChatRole,
    content: string,
    options: { error?: boolean; loading?: boolean } = {},
  ): HTMLElement => {
    const row = document.createElement("div");
    row.className = "schools-ai-chat-message";
    row.dataset.role = role;
    if (options.error) row.dataset.error = "true";
    if (options.loading) {
      row.dataset.loading = "true";
      row.setAttribute("role", "status");
    }

    const bubble = document.createElement("div");
    bubble.className = "schools-ai-chat-bubble";
    if (role === "assistant" && !options.error && !options.loading) {
      bubble.classList.add("schools-ai-chat-markdown");
      renderMarkdownText(bubble, content);
    } else {
      bubble.textContent = content;
    }

    row.append(bubble);
    messagesElement.append(row);
    scrollMessages();
    return row;
  };

  const rememberMessage = (message: ChatMessage) => {
    chatHistory = trimChatHistory([...chatHistory, message]);
  };

  const setBusy = (busy: boolean) => {
    root.dataset.busy = String(busy);
    panel.setAttribute("aria-busy", String(busy));
    submit.disabled = busy;
    input.disabled = busy;
    for (const button of promptButtons) button.disabled = busy;
  };

  const updateCharacterCount = () => {
    characterCount.textContent = `${input.value.length} / ${AI_CHAT_MAX_QUESTION_LENGTH}`;
  };

  const openChat = () => {
    lastFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : toggle;
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    if (!greetingShown && greeting) {
      renderMessage("assistant", greeting);
      greetingShown = true;
    }
    window.setTimeout(() => input.focus(), 0);
  };

  const closeChat = ({ restoreFocus = true } = {}) => {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    activeController?.abort();
    if (restoreFocus) {
      (lastFocusedElement?.isConnected ? lastFocusedElement : toggle).focus();
    }
  };

  const sendQuestion = async (rawQuestion: string) => {
    const question = rawQuestion.normalize("NFKC").replace(/\s+/gu, " ").trim();
    if (!question) {
      input.focus();
      return;
    }
    if (question.length > AI_CHAT_MAX_QUESTION_LENGTH) {
      renderMessage("assistant", tooLongError, { error: true });
      input.focus();
      return;
    }

    input.value = "";
    updateCharacterCount();
    rememberMessage({ role: "user", content: question });
    renderMessage("user", question);
    const loadingRow = renderMessage("assistant", loadingText, {
      loading: true,
    });
    const controller = new AbortController();
    activeController = controller;
    let timedOut = false;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, AI_CHAT_TIMEOUT_MS);
    setBusy(true);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Acecore-AI-Client": getStableClientId(),
        },
        body: JSON.stringify({
          locale: "ja",
          messages: trimChatHistory(chatHistory),
          question,
        }),
        signal: controller.signal,
        credentials: "omit",
      });
      const payload: unknown = await response.json().catch(() => null);
      const answer =
        payload &&
        typeof payload === "object" &&
        "answer" in payload &&
        typeof payload.answer === "string"
          ? payload.answer.trim().slice(0, 8_000)
          : "";
      const ok =
        payload &&
        typeof payload === "object" &&
        "ok" in payload &&
        payload.ok === true;

      if (!response.ok || !ok || !answer) {
        throw new Error(answer || genericError);
      }

      loadingRow.remove();
      rememberMessage({ role: "assistant", content: answer });
      renderMessage("assistant", answer);
    } catch (error) {
      loadingRow.remove();
      if (controller.signal.aborted && !timedOut) return;
      const message = timedOut
        ? timeoutError
        : error instanceof Error && error.message
          ? error.message
          : genericError;
      renderMessage("assistant", message, { error: true });
    } finally {
      window.clearTimeout(timeout);
      if (activeController === controller) activeController = null;
      setBusy(false);
      if (!panel.hidden) input.focus();
    }
  };

  toggle.addEventListener("click", () => {
    if (panel.hidden) {
      openChat();
    } else {
      closeChat();
    }
  });
  closeButton.addEventListener("click", () => closeChat());

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void sendQuestion(input.value);
  });

  input.addEventListener("input", updateCharacterCount);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      void sendQuestion(input.value);
    }
  });

  for (const button of promptButtons) {
    button.addEventListener("click", () => {
      void sendQuestion(button.dataset.prompt || button.textContent || "");
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      event.preventDefault();
      closeChat();
    }
  });

  window.addEventListener(
    "pagehide",
    () => {
      activeController?.abort();
    },
    { once: true },
  );

  updateCharacterCount();
}
