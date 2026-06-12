# AI Models

## Model Strategy

Aplikasi menggunakan tiga pilihan model utama. Tujuannya agar user bisa memilih antara mode gratis lokal, mode cloud murah, dan mode cloud kuat.

## Model List

### 1. Ollama Qwen Coder

Provider:

```txt
ollama
```

Model ID:

```txt
qwen2.5-coder:7b
```

Use case:

- Coding harian.
- Debugging ringan.
- Generate komponen kecil.
- Belajar konsep programming.
- Eksperimen lokal tanpa biaya API.

Kelebihan:

- Gratis.
- Jalan lokal.
- Tidak membutuhkan API key.
- Cocok untuk development awal.

Kekurangan:

- Performa tergantung laptop.
- Tidak bisa diakses dari server production kecuali Ollama juga dihosting.
- Tidak otomatis belajar permanen dari chat.

### 2. DeepSeek V4 Flash

Provider:

```txt
deepseek
```

Model ID:

```txt
deepseek-v4-flash
```

Use case:

- Cloud model murah.
- Chat cepat.
- Backup saat Ollama lokal lambat.
- General coding task.
- Jawaban pendek sampai menengah.

Kelebihan:

- Murah untuk penggunaan harian.
- Tidak bergantung pada performa laptop.
- Cocok untuk fallback cloud.

Kekurangan:

- Membutuhkan API key.
- Membutuhkan saldo API.
- Data dikirim ke provider cloud.

### 3. DeepSeek V4 Pro

Provider:

```txt
deepseek
```

Model ID:

```txt
deepseek-v4-pro
```

Use case:

- Coding task berat.
- Debugging kompleks.
- Refactor kode panjang.
- Reasoning yang lebih dalam.
- Analisis banyak konteks.

Kelebihan:

- Lebih cocok untuk task sulit.
- Bagus untuk mode power user.

Kekurangan:

- Lebih mahal daripada Flash.
- Tidak perlu dipakai untuk semua request.

## Default Model

Default model aplikasi:

```txt
Ollama Qwen Coder
```

Alasan:

- Gratis.
- Cocok untuk user utama project ini.
- Sesuai tujuan local AI chat.

## Model Selector Label

Gunakan label UI berikut:

```txt
Local Qwen Coder
DeepSeek Flash
DeepSeek Pro
```

Badge:

```txt
Free
Cheap Cloud
Heavy Task
```

## Model Option Object

```ts
export const modelOptions = [
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

## Routing Logic

Jika provider adalah `ollama`, request dikirim ke:

```txt
/api/chat/ollama
```

Jika provider adalah `deepseek`, request dikirim ke:

```txt
/api/chat/deepseek
```

Alternatif lebih sederhana:

```txt
/api/chat
```

Dengan body berisi `provider` dan `model`.

## Important Notes

Model tidak belajar permanen dari percakapan. Agar AI terasa punya memory, aplikasi harus menyimpan chat history dan user memory, lalu mengirimkannya kembali sebagai context.

Untuk MVP, cukup kirim beberapa message terakhir agar biaya dan context tetap ringan.
