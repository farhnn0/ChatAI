# Tech Stack

## Frontend

### Framework

Gunakan Next.js App Router.

Alasan:

- Frontend dan backend ringan bisa berada dalam satu project.
- Route Handler bisa dipakai untuk API ke Ollama dan DeepSeek.
- Mudah dikembangkan menjadi aplikasi production.
- Cocok dengan TypeScript, Tailwind CSS, dan shadcn/ui.

### Language

Gunakan TypeScript.

Alasan:

- Lebih aman saat mengatur tipe model, message, provider, dan response API.
- Mengurangi error saat project mulai berkembang.
- Cocok untuk struktur data chat dan model selector.

### Styling

Gunakan Tailwind CSS.

Aturan styling:

- Dark mode only.
- Hindari gradient.
- Hindari warna terlalu terang.
- Gunakan neutral/zinc/slate tone.
- Gunakan border halus dan background gelap bertingkat.

Rekomendasi warna:

```txt
background: zinc-950 / neutral-950
surface: zinc-900 / neutral-900
surface secondary: zinc-900/70
border: zinc-800
text primary: zinc-100
text secondary: zinc-400
muted text: zinc-500
accent: zinc-100 text on dark, atau zinc-800 untuk hover
```

### UI Library

Gunakan shadcn/ui.

Komponen yang dibutuhkan untuk MVP:

```txt
button
textarea
input
dropdown-menu
scroll-area
avatar
badge
separator
sheet
dialog
tooltip
```

Komponen opsional:

```txt
command
popover
skeleton
tabs
switch
```

### Icons

Gunakan lucide-react.

Icon yang direkomendasikan:

```txt
PanelLeft
PenSquare
MessageSquare
Search
Settings
SendHorizonal
Bot
User
Code2
Sparkles
ChevronDown
Trash2
Loader2
```

Jangan gunakan emoji sebagai ikon.

## Backend

Gunakan Next.js Route Handler.

Endpoint utama:

```txt
POST /api/chat
GET /api/models
```

Endpoint opsional:

```txt
POST /api/chat/stream
POST /api/title
```

Tidak perlu Express, FastAPI, atau backend terpisah untuk MVP.

## AI Providers

### Ollama

Provider lokal untuk model yang berjalan di laptop.

Base URL default:

```txt
http://127.0.0.1:11434
```

Model utama:

```txt
qwen2.5-coder:7b
```

Ollama tidak membutuhkan API key.

### DeepSeek

Provider cloud untuk backup dan task berat.

Base URL:

```txt
https://api.deepseek.com
```

Model:

```txt
deepseek-v4-flash
deepseek-v4-pro
```

DeepSeek membutuhkan API key.

## State Management

Untuk MVP gunakan React state biasa:

```txt
useState
useMemo
useEffect
useRef
```

Tidak perlu Zustand atau Redux di awal.

## Data Storage

Tahap awal:

```txt
localStorage
```

Data yang disimpan:

- Chat sessions.
- Messages per session.
- Selected model terakhir.
- Sidebar collapsed state.

Tahap lanjut:

```txt
Prisma + PostgreSQL
```

Database belum dibutuhkan untuk MVP.

## Package Rekomendasi

```bash
npm install lucide-react openai
```

shadcn/ui diinstall menggunakan CLI shadcn.

## Build Target

Project harus bisa berjalan lokal dengan:

```bash
npm run dev
```

Aplikasi harus optimal di:

- Desktop utama.
- Laptop 14 sampai 16 inch.
- Mobile layout sederhana.
