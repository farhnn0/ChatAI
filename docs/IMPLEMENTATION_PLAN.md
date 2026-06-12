# Implementation Plan

## Phase 1: UI Only

Goal:

Build complete ChatGPT-style UI without real API integration.

Tasks:

1. Setup Next.js project.
2. Install Tailwind CSS.
3. Setup shadcn/ui.
4. Add required shadcn components.
5. Build sidebar.
6. Build chat message area.
7. Build bottom composer.
8. Add model selector inside composer.
9. Add mock messages.
10. Add responsive behavior.

Acceptance criteria:

- Sidebar exists on desktop.
- Sidebar can be collapsed.
- Chat area displays user and assistant messages.
- Prompt input stays at bottom.
- Model selector is inside input container.
- UI is dark only.
- No emoji.
- No gradient.

## Phase 2: Ollama Integration

Goal:

Connect UI to local Ollama model.

Tasks:

1. Create `/api/chat` route.
2. Add provider routing.
3. Add Ollama request handler.
4. Send selected model from UI.
5. Show loading state.
6. Show error if Ollama is not running.
7. Return normalized response.

Acceptance criteria:

- User can select Ollama Qwen Coder.
- User can send prompt.
- Response appears in chat.
- Error message appears if Ollama is offline.

## Phase 3: DeepSeek Integration

Goal:

Add cloud model fallback.

Tasks:

1. Add `.env.local` with DeepSeek API key.
2. Install OpenAI SDK if needed.
3. Add DeepSeek provider handler.
4. Add DeepSeek Flash model.
5. Add DeepSeek Pro model.
6. Route request based on provider.
7. Handle API errors.

Acceptance criteria:

- User can select DeepSeek Flash.
- User can select DeepSeek Pro.
- API key is never exposed to frontend.
- All providers return same response format.

## Phase 4: Local Chat History

Goal:

Persist chat sessions locally.

Tasks:

1. Save chat sessions to localStorage.
2. Save selected model to localStorage.
3. Add new chat action.
4. Add delete chat action.
5. Add rename chat title after first message.

Acceptance criteria:

- Chat remains after refresh.
- Sidebar shows previous chat sessions.
- New chat creates a clean session.

## Phase 5: Streaming Response

Goal:

Make response appear progressively like ChatGPT.

Tasks:

1. Add streaming route or update `/api/chat`.
2. Stream Ollama response.
3. Stream DeepSeek response.
4. Update UI message content while stream is active.
5. Add stop generation button.

Acceptance criteria:

- Text appears progressively.
- User can stop generation.
- UI remains responsive during stream.

## Phase 6: Better Memory

Goal:

Make AI feel more contextual without fine-tuning.

Tasks:

1. Send last 10 messages as context.
2. Add system prompt.
3. Add simple saved memory.
4. Add project-specific instruction.

Acceptance criteria:

- Model understands current conversation.
- Model knows basic app purpose.
- Context stays lightweight.

## MVP Priority

Build in this order:

```txt
UI first
Ollama second
DeepSeek third
History fourth
Streaming fifth
Memory last
```
