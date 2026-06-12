# Project Structure

## Recommended Folder Structure

```txt
app/
  layout.tsx
  page.tsx
  chat/
    page.tsx
  api/
    chat/
      route.ts

components/
  chat/
    chat-layout.tsx
    chat-sidebar.tsx
    chat-header.tsx
    chat-message-list.tsx
    chat-message.tsx
    chat-composer.tsx
    model-selector.tsx
  ui/
    button.tsx
    textarea.tsx
    dropdown-menu.tsx
    scroll-area.tsx
    avatar.tsx
    badge.tsx
    separator.tsx
    input.tsx
    tooltip.tsx

lib/
  ai/
    models.ts
    provider-router.ts
    ollama.ts
    deepseek.ts
  storage/
    chat-storage.ts
  types/
    chat.ts
  utils.ts

styles/
  globals.css

docs/
  README.md
  TECH_STACK.md
  DESIGN_SYSTEM.md
  AI_MODELS.md
  ARCHITECTURE.md
  API_CONTRACT.md
  PROJECT_STRUCTURE.md
  IMPLEMENTATION_PLAN.md
  ANTIGRAVITY_INSTRUCTIONS.md
```

## File Responsibility

### app/chat/page.tsx

Main chat page.

Should render:

```txt
<ChatLayout />
```

### components/chat/chat-layout.tsx

Main layout wrapper.

Contains:

- Sidebar.
- Header.
- Message area.
- Composer.

### components/chat/chat-sidebar.tsx

Left sidebar.

Contains:

- New chat button.
- Search chats.
- Chat history.
- Settings entry.

### components/chat/chat-header.tsx

Top bar.

Contains:

- Sidebar toggle.
- Current chat title.
- Optional clear button.

### components/chat/chat-message-list.tsx

Renders all messages.

Handles:

- Empty state.
- Loading state.
- Scroll to bottom.

### components/chat/chat-message.tsx

Single message component.

Contains:

- Avatar.
- Role name.
- Model badge.
- Message content.

### components/chat/chat-composer.tsx

Bottom input area.

Contains:

- Textarea.
- Model selector.
- Send button.
- Keyboard handler.

### components/chat/model-selector.tsx

Dropdown model selector.

Model selector should be inside composer, not only in header.

### lib/ai/models.ts

Contains model configuration.

### lib/ai/provider-router.ts

Chooses correct provider based on selected model/provider.

### lib/ai/ollama.ts

Handles Ollama request.

### lib/ai/deepseek.ts

Handles DeepSeek request.

### lib/storage/chat-storage.ts

Handles localStorage for MVP.

### lib/types/chat.ts

Contains TypeScript types for:

- Message.
- ChatSession.
- ModelOption.
- Provider.
- ChatRequest.
- ChatResponse.

## Naming Convention

Use kebab-case for files:

```txt
chat-layout.tsx
model-selector.tsx
provider-router.ts
chat-storage.ts
```

Use PascalCase for React components:

```txt
ChatLayout
ModelSelector
ChatComposer
```

Use camelCase for functions:

```txt
sendMessage
createNewChat
selectModel
```
