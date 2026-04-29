# Next.js Boilerplate

Stack: **Next.js 16** · **TypeScript** · **Tailwind CSS v4** · **shadcn/ui** · **Supabase** · **Xendit**

---

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/username/repo my-app
cd my-app
npm install
cp .env.example .env.local
```

### 2. Supabase

**Buat project:**
1. Buka [supabase.com](https://supabase.com) → **New Project**
2. Isi nama project, password database, pilih region **Southeast Asia (Singapore)**
3. Tunggu project selesai dibuat (~1-2 menit)

**Ambil kredensial:**
1. Buka **Project Settings → API**
2. Salin **Project URL** → isi ke `NEXT_PUBLIC_SUPABASE_URL`
3. Salin **anon / public** key → isi ke `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Jalankan migration:**
1. Buka **SQL Editor → New Query**
2. Copy seluruh isi file `supabase-migration.sql`, paste, lalu klik **Run**
3. Pastikan tidak ada error — tabel `payments` akan terbuat otomatis

**Konfigurasi auth (opsional):**
- Untuk development, matikan konfirmasi email supaya bisa langsung login tanpa verifikasi: **Authentication → Email → nonaktifkan Confirm email**

---

### 3. Xendit

**Ambil API key:**
1. Buka [dashboard.xendit.co](https://dashboard.xendit.co) → **Settings → API Keys**
2. Klik **Generate secret key**, beri nama, lalu salin key-nya
3. Gunakan key dengan prefix `xnd_development_` selama development — jangan pakai production key
4. Isi ke `XENDIT_SECRET_KEY`

**Setup webhook:**
1. Buka **Settings → Webhooks**
2. Di bagian **Webhook Token**, isi dengan string bebas (contoh: `rahasia-webhook-123`) → ini yang akan jadi `XENDIT_WEBHOOK_TOKEN`
3. Di bagian URL, tambahkan endpoint webhook:
   - **Lokal:** Pakai [ngrok](https://ngrok.com) untuk expose localhost
     ```bash
     ngrok http 3000
     # Contoh output: https://abc123.ngrok.io
     ```
     Isi URL: `https://abc123.ngrok.io/api/xendit/webhook`
   - **Production:** `https://domain-kamu.com/api/xendit/webhook`
4. Centang event yang perlu didengarkan:
   - ✅ **Invoice** → `invoice.paid`
   - ✅ **Invoice** → `invoice.expired`
5. Klik **Save**

---

### 4. Environment

Isi `.env.local` dengan semua nilai yang sudah dikumpulkan:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Xendit → Settings → API Keys
XENDIT_SECRET_KEY=xnd_development_...

# Xendit → Settings → Webhooks → Webhook Token (harus sama persis)
XENDIT_WEBHOOK_TOKEN=rahasia-webhook-123
```

---

### 5. Jalankan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) — aplikasi siap dipakai.

---

## Panduan

### Struktur Folder

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (protected)/
│   └── dashboard/page.tsx
├── (public)/
│   └── page.tsx
├── api/xendit/webhook/route.ts
└── layout.tsx

components/
├── ui/           # shadcn/ui — jangan edit manual
├── shared/       # komponen reusable buatan sendiri
├── layouts/      # DashboardLayout, AuthLayout, dll
└── forms/        # LoginForm, RegisterForm, dll

actions/          # Server Actions (mutasi data)
services/         # Fungsi read data dari Supabase
hooks/            # Custom React hooks
lib/              # Supabase & Xendit client
types/            # TypeScript types
utils/            # Helper: cn(), formatIDR(), slugify()
constants/        # Routes dan config
```

### Tambah Halaman Protected

```bash
touch "app/(protected)/nama-halaman/page.tsx"
```

Tambahkan route ke `constants/index.ts`:

```ts
export const PROTECTED_ROUTES = ["/dashboard", "/nama-halaman"];
```

### Tambah Komponen shadcn

```bash
npx shadcn@latest add button
npx shadcn@latest add input
```

### Auth Flow

1. User daftar/login via `/login` atau `/register`
2. Session disimpan di cookies oleh Supabase
3. `middleware.ts` memproteksi semua route di `PROTECTED_ROUTES`

### Payment Flow

1. Panggil `createPayment()` dari `actions/payment.ts`
2. User diarahkan ke `invoice_url` Xendit
3. Xendit kirim webhook → status di tabel `payments` diupdate otomatis

### Deploy (Vercel)

1. Push ke GitHub → import di [vercel.com](https://vercel.com)
2. Tambahkan semua env variable di Vercel dashboard
3. Ganti `NEXT_PUBLIC_APP_URL` ke domain production
4. Ganti `XENDIT_SECRET_KEY` ke production key
5. Update webhook URL di dashboard Xendit

---

## Contoh: Payment Flow

File yang terlibat:

```
app/
├── (protected)/payment/page.tsx       # Form input pembayaran
├── (public)/payment/success/page.tsx  # Halaman sukses
└── (public)/payment/failed/page.tsx   # Halaman gagal
actions/
└── payment.ts                         # createPayment(), getPaymentByExternalId()
lib/xendit/index.ts                    # createInvoice(), verifyWebhookToken()
app/api/xendit/webhook/route.ts        # Terima callback dari Xendit
```

**Alur lengkap:**

1. User mengisi form di `/payment` → `createPayment()` dipanggil
2. Invoice dibuat di Xendit, record `PENDING` disimpan ke tabel `payments`
3. User diarahkan ke `invoice_url` (halaman pembayaran Xendit)
4. User menyelesaikan pembayaran
5. Xendit mengirim webhook ke `/api/xendit/webhook` → status diupdate ke `PAID` / `EXPIRED`
6. Xendit redirect user ke `/payment/success?external_id=inv_xxx` atau `/payment/failed?external_id=inv_xxx`
7. Halaman success/failed menampilkan detail transaksi berdasarkan `external_id`

> **Catatan:** Status di halaman success/failed diambil dari database, bukan dari query param — jadi tidak bisa dimanipulasi dari URL.
