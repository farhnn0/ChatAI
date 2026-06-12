# API Contract

## Main Endpoint

```txt
POST /api/chat
```

Endpoint ini menerima request chat dari frontend, lalu meneruskan ke provider yang dipilih.

## Request Body

```json
{
  "provider": "ollama",
  "model": "qwen2.5-coder:7b",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful coding assistant."
    },
    {
      "role": "user",
      "content": "Create a Next.js component using shadcn/ui."
    }
  ]
}
```

Untuk DeepSeek:

```json
{
  "provider": "deepseek",
  "model": "deepseek-v4-flash",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful coding assistant."
    },
    {
      "role": "user",
      "content": "Fix this TypeScript error."
    }
  ]
}
```

## Success Response

```json
{
  "content": "Here is the answer from the selected model.",
  "provider": "ollama",
  "model": "qwen2.5-coder:7b"
}
```

## Error Response

```json
{
  "error": "Failed to connect to Ollama server.",
  "provider": "ollama"
}
```

## Ollama Provider Request

Endpoint target:

```txt
POST http://127.0.0.1:11434/api/chat
```

Payload:

```json
{
  "model": "qwen2.5-coder:7b",
  "messages": [
    {
      "role": "user",
      "content": "Hello"
    }
  ],
  "stream": false
}
```

Response yang perlu diambil:

```txt
message.content
```

## DeepSeek Provider Request

Gunakan OpenAI-compatible client atau fetch manual.

Base URL:

```txt
https://api.deepseek.com
```

Required environment variable:

```txt
DEEPSEEK_API_KEY
```

## Environment Variables

Buat file `.env.local`:

```env
DEEPSEEK_API_KEY=sk-your-key-here
OLLAMA_BASE_URL=http://127.0.0.1:11434
```

Jangan expose API key ke client.

## Validation Rules

Route harus memvalidasi:

- `provider` wajib ada.
- `model` wajib ada.
- `messages` harus array.
- `messages` minimal berisi satu user message.
- Provider hanya boleh `ollama` atau `deepseek`.

## Suggested API Route Logic

```txt
Receive request
Validate body
Check provider
If provider is ollama, call Ollama API
If provider is deepseek, call DeepSeek API
Normalize response
Return response to client
```

## Response Normalization

Semua provider harus dikembalikan ke format yang sama:

```ts
{
  content: string;
  provider: string;
  model: string;
}
```

Frontend tidak perlu tahu bentuk response asli dari masing-masing provider.
