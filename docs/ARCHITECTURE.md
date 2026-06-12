# Architecture

## High Level Architecture

```txt
User Browser
  -> Next.js UI
  -> Next.js Route Handler
  -> Provider Router
  -> Ollama local API or DeepSeek API
  -> Response returned to UI
```

## Provider Flow

### Ollama Flow

```txt
Chat UI
  -> POST /api/chat
  -> provider = ollama
  -> http://127.0.0.1:11434/api/chat
  -> qwen2.5-coder:7b
  -> response to UI
```

### DeepSeek Flow

```txt
Chat UI
  -> POST /api/chat
  -> provider = deepseek
  -> https://api.deepseek.com
  -> deepseek-v4-flash or deepseek-v4-pro
  -> response to UI
```

## Route Handler Responsibility

The route handler should:

- Validate request body.
- Check selected provider.
- Forward messages to the correct provider.
- Hide API keys from client.
- Normalize provider response into one common format.
- Return error message if provider fails.

## Client Responsibility

The client should:

- Render sidebar.
- Render chat messages.
- Manage selected model.
- Manage input state.
- Send request to `/api/chat`.
- Show loading state.
- Store chat history in localStorage for MVP.

## Request Shape

```ts
type ChatRequest = {
  provider: "ollama" | "deepseek";
  model: string;
  messages: {
    role: "system" | "user" | "assistant";
    content: string;
  }[];
};
```

## Response Shape

```ts
type ChatResponse = {
  content: string;
  provider: "ollama" | "deepseek";
  model: string;
};
```

## Error Response Shape

```ts
type ChatErrorResponse = {
  error: string;
  provider?: "ollama" | "deepseek";
};
```

## Streaming

MVP boleh menggunakan non-streaming response terlebih dahulu.

Tahap awal:

```txt
stream: false
```

Tahap lanjut:

```txt
streaming response seperti ChatGPT
```

Prioritas MVP adalah UI dan routing model berjalan stabil dulu.

## Memory System

MVP:

```txt
Last 10 messages sent as context
```

Tahap lanjut:

```txt
Saved user preferences
Saved project context
RAG for documents
```

## Deployment Notes

Jika aplikasi dijalankan lokal, Ollama bisa dipanggil dari Next.js server melalui:

```txt
http://127.0.0.1:11434
```

Jika aplikasi dideploy ke Vercel, endpoint `localhost` tidak akan mengarah ke laptop user. Untuk production, pilih salah satu:

```txt
Host Ollama on your own server
Use DeepSeek cloud only
Run the app locally
```
