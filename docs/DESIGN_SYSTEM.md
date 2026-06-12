# Design System

## Arah Visual

UI harus menggunakan dark theme yang clean, tenang, dan teknikal. Jangan membuat tampilan terlalu ramai. Hindari kesan template AI yang terlalu glossy, berwarna-warni, atau penuh efek.

Tampilan yang diinginkan:

- Modern.
- Minimal.
- Developer-focused.
- Rapi.
- Premium tapi tidak berlebihan.
- Fokus ke text dan percakapan.

## Larangan Desain

Jangan gunakan:

- Emoji.
- Gradient.
- Background warna-warni.
- Glassmorphism berlebihan.
- Shadow terlalu terang.
- Neon effect.
- Ilustrasi dekoratif yang tidak perlu.
- Copywriting yang terlalu marketing.
- Komponen dengan radius terlalu besar di semua tempat.

## Tema Warna

Gunakan warna gelap netral.

```txt
App background: #09090B
Sidebar background: #0C0C0F
Card surface: #111113
Input surface: #111113
Hover surface: #18181B
Border: #27272A
Text primary: #FAFAFA
Text secondary: #A1A1AA
Text muted: #71717A
Accent light: #E4E4E7
Danger: #EF4444
```

Tailwind mapping:

```txt
bg-zinc-950
bg-zinc-900
bg-zinc-900/70
hover:bg-zinc-800
border-zinc-800
text-zinc-100
text-zinc-400
text-zinc-500
```

## Typography

Gunakan font default modern seperti Inter, Geist, atau system font.

Hierarchy:

```txt
Page title: text-sm atau text-base font-medium
Sidebar item: text-sm
Message body: text-sm leading-7
Helper text: text-xs text-muted-foreground
Badge: text-xs
```

Jangan gunakan heading besar berlebihan di halaman chat. Area chat harus terasa seperti workspace, bukan landing page.

## Radius

Gunakan radius sedang.

```txt
Sidebar item: rounded-lg atau rounded-xl
Input container: rounded-2xl
Button icon: rounded-full atau rounded-xl
Dropdown item: rounded-xl
Message bubble: rounded-2xl jika bubble digunakan
```

Hindari semua elemen terlalu bulat tanpa alasan.

## Layout Utama

Aplikasi terdiri dari:

```txt
Left Sidebar
Main Chat Area
Bottom Prompt Input
```

Sidebar width desktop:

```txt
280px sampai 300px
```

Main chat max width:

```txt
max-w-4xl
```

Prompt input max width:

```txt
max-w-4xl
```

## Sidebar

Sidebar berisi:

- New chat button.
- Search button atau search field.
- Current model card kecil.
- Chat history list.
- Settings entry di bawah.

Sidebar harus bisa collapse.

## Chat Area

Chat area harus fokus pada percakapan.

Struktur message:

```txt
Avatar kecil
Nama role
Badge model untuk assistant
Isi pesan
```

Untuk UI yang lebih mirip ChatGPT, message tidak harus selalu bubble. Bisa menggunakan block text dengan jarak yang rapi.

## Prompt Input

Prompt input berada di bawah.

Harus berisi:

- Textarea.
- Dropdown model selector di dalam input container.
- Send button di kanan bawah.
- Hint kecil di bawah input.

Model selector harus terlihat seperti bagian dari composer, bukan dropdown terpisah di header.

## Empty State

Saat belum ada chat, tampilkan empty state sederhana:

```txt
What are you working on?
Choose a model and start a conversation.
```

Jangan gunakan emoji atau ilustrasi.

## Loading State

Gunakan Loader2 dari lucide-react.

Text loading:

```txt
Thinking...
```

atau

```txt
Generating response...
```

## Tone Copywriting

Gunakan copy yang natural dan pendek.

Contoh bagus:

```txt
New chat
Search chats
Local model
Thinking...
Message your AI...
```

Hindari copy seperti:

```txt
Unleash the power of AI
Supercharge your workflow
Revolutionize your productivity
```
