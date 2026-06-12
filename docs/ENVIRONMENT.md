# Environment Setup

## Required Tools

Install these tools locally:

```txt
Node.js
npm
Ollama
Git
```

## Ollama Setup

Check installed Ollama models:

```bash
ollama list
```

Run Qwen Coder:

```bash
ollama run qwen2.5-coder:7b
```

Ollama should be available at:

```txt
http://127.0.0.1:11434
```

## Environment Variables

Create `.env.local` in project root:

```env
DEEPSEEK_API_KEY=sk-your-deepseek-api-key
OLLAMA_BASE_URL=http://127.0.0.1:11434
```

## Important Security Rule

Never use `NEXT_PUBLIC_DEEPSEEK_API_KEY`.

API keys must stay server-side only.

## Install Packages

```bash
npm install lucide-react openai
```

## shadcn/ui Setup

Initialize shadcn/ui:

```bash
npx shadcn@latest init
```

Add components:

```bash
npx shadcn@latest add button textarea input dropdown-menu scroll-area avatar badge separator tooltip dialog sheet
```

## Run Project

```bash
npm run dev
```

Open:

```txt
http://localhost:3000/chat
```
