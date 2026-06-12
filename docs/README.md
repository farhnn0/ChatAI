# Local AI Chat App

## Ringkasan Project

Project ini adalah web chat AI dengan tampilan dark, clean, dan sederhana. Aplikasi dibuat untuk menggabungkan model lokal dari Ollama dan model cloud dari DeepSeek dalam satu UI yang nyaman digunakan.

Tujuan utama project ini adalah membuat aplikasi seperti chat assistant pribadi, bukan produk yang terlihat ramai atau terlalu dekoratif. UI harus terasa serius, ringan, dan fokus ke percakapan.

## Konsep Utama

Aplikasi memiliki tiga mode model:

1. Ollama Qwen Coder untuk penggunaan lokal dan gratis.
2. DeepSeek V4 Flash untuk cloud model murah dan cepat.
3. DeepSeek V4 Pro untuk task coding berat dan reasoning kompleks.

User bisa memilih model langsung dari area input prompt di bagian bawah, mirip pengalaman chat modern. Sidebar kiri digunakan untuk daftar chat, tombol new chat, search, dan akses settings.

## Prinsip Desain

- Dark mode only.
- Tidak memakai emoji.
- Tidak memakai gradient.
- Tidak memakai warna mencolok berlebihan.
- Tidak terlihat seperti template AI generik.
- Fokus pada layout bersih, whitespace, typography, dan interaksi yang rapi.
- UI harus terasa seperti developer tool modern.

## Target Penggunaan

Aplikasi ini ditujukan untuk penggunaan pribadi atau internal sebagai:

- Local coding assistant.
- AI chat workspace.
- Debugging helper.
- Prompt experiment tool.
- Frontend untuk Ollama dan DeepSeek.

## Stack Singkat

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide-react
- Ollama API
- DeepSeek API
- localStorage untuk history awal

## Status MVP

MVP pertama tidak membutuhkan database dan login. Semua chat bisa disimpan sementara di client menggunakan state dan localStorage. Backend cukup memakai Next.js Route Handler.
