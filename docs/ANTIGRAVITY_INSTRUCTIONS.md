# Antigravity Instructions

## Role

You are helping build a local AI chat web app for Farhan. The app should feel like a clean developer-focused ChatGPT alternative with local and cloud model support.

## Main Goal

Build a Next.js app with:

- Dark-only ChatGPT-style chat UI.
- Left sidebar.
- Bottom prompt composer.
- Model selector inside the prompt input area.
- Support for Ollama Qwen Coder.
- Support for DeepSeek V4 Flash and DeepSeek V4 Pro.

## Important Design Rules

Follow these rules strictly:

- Use dark mode only.
- Do not use emoji.
- Do not use gradient.
- Do not use neon effect.
- Do not make it look like a generic AI landing page.
- Use shadcn/ui components.
- Use Tailwind CSS.
- Use clean spacing and neutral colors.
- Keep the interface focused on chat.

## UI Requirements

The UI must include:

### Sidebar

- New chat button.
- Search chat input or button.
- Chat history list.
- Settings button at bottom.
- Collapsible behavior.

### Header

- Sidebar toggle button.
- Current chat title.
- Optional clear chat button.

### Chat Area

- User messages.
- Assistant messages.
- Assistant model badge.
- Loading state.
- Empty state.

### Prompt Composer

- Textarea at bottom.
- Model dropdown inside composer.
- Send button inside composer.
- Enter to send.
- Shift + Enter for new line.

## Model Selector

Use these options:

```ts
const modelOptions = [
  {
    provider: "ollama",
    model: "qwen2.5-coder:7b",
    label: "Local Qwen Coder",
    badge: "Free",
    description: "Local model for daily coding and experiments.",
  },
  {
    provider: "deepseek",
    model: "deepseek-v4-flash",
    label: "DeepSeek Flash",
    badge: "Cheap Cloud",
    description: "Low-cost cloud model for fast responses.",
  },
  {
    provider: "deepseek",
    model: "deepseek-v4-pro",
    label: "DeepSeek Pro",
    badge: "Heavy Task",
    description: "Stronger cloud model for complex coding tasks.",
  },
];
```

## API Requirements

Create one route:

```txt
POST /api/chat
```

The body should include:

```ts
{
  provider: "ollama" | "deepseek";
  model: string;
  messages: Message[];
}
```

The response should be normalized:

```ts
{
  content: string;
  provider: string;
  model: string;
}
```

## Ollama Requirements

Use Ollama API at:

```txt
http://127.0.0.1:11434/api/chat
```

Default model:

```txt
qwen2.5-coder:7b
```

Use non-streaming for MVP:

```json
{
  "stream": false
}
```

## DeepSeek Requirements

Use environment variable:

```txt
DEEPSEEK_API_KEY
```

Do not expose this key to the client.

Use these models:

```txt
deepseek-v4-flash
deepseek-v4-pro
```

## shadcn/ui Components Needed

Install or use:

```txt
button
textarea
input
dropdown-menu
scroll-area
avatar
badge
separator
tooltip
dialog
sheet
```

## Coding Style

- Use TypeScript.
- Use small reusable components.
- Do not put all logic in one file if building final version.
- Keep API provider logic inside `lib/ai`.
- Keep UI components inside `components/chat`.
- Use clear names.
- Avoid overengineering.

## MVP Scope

Do not add these in MVP:

- Authentication.
- Database.
- Payment.
- Team workspace.
- Complex RAG.
- File upload.
- Voice input.

MVP should focus on:

```txt
Chat UI
Model selector
Ollama API
DeepSeek API
Local history
```

## Final Feel

The final app should feel like a practical AI workspace made by a developer, not a flashy SaaS template.
