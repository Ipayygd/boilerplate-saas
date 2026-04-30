# SaaS Boilerplate

Next.js 16 + Supabase + bayar.gg Payment Gateway

Boilerplate ini dirancang untuk mempercepat pengembangan aplikasi berbasis langganan (SaaS), toko digital, atau sistem donasi dengan integrasi pembayaran lokal Indonesia menggunakan [bayar.gg](https://bayar.gg).

## 🚀 Fitur Utama

- **Auth & Database**: Terintegrasi penuh dengan Supabase (Login/Register/Session Management).
- **Payment Gateway**: Integrasi siap pakai dengan bayar.gg (QRIS, GoPay, OVO, Transfer Bank).
- **Webhook Handler**: Endpoint otomatis untuk update status pembayaran (`PENDING` → `PAID`) di database.
- **Developer-Friendly Demo**: Halaman pembayaran contoh yang minimalis untuk mendemonstrasikan cara memanggil Server Action.
- **Type Safety**: Full TypeScript support.

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (Auth & PostgreSQL)
- **Payment**: [bayar.gg](https://bayar.gg)

---

## 📦 Instalasi & Setup

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Ipayygd/boilerplate-saas.git www
cd www
npm install
```

### 2. Environment Variables

Salin file contoh environment:

```bash
cp .env.example .env.local
```

Isi variabel berikut di `.env.local`:

| Variable                        | Deskripsi                           | Cara Mendapatkan                                    |
| :------------------------------ | :---------------------------------- | :-------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL Project Supabase                | Supabase Dashboard → Project Settings → API         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Key Supabase                 | Supabase Dashboard → Project Settings → API         |
| `SUPABASE_SERVICE_ROLE_KEY`     | Service Role Key (Server-side only) | Supabase Dashboard → Project Settings → API         |
| `BAYARGG_API_KEY`               | API Key Pembayaran                  | [bayar.gg](https://bayar.gg) → Pengaturan → API Key |
| `BAYARGG_WEBHOOK_SECRET`        | Secret untuk verifikasi webhook     | [bayar.gg](https://bayar.gg) → Pengaturan → Webhook |
| `NEXT_PUBLIC_APP_URL`           | URL Aplikasi Anda                   | `http://localhost:3000` (dev) atau domain produksi  |

### 3. Setup Database

Jalankan script SQL berikut di **Supabase SQL Editor**.

📄 [**`supabase-migration.sql`**](./supabase-migration.sql)

Atau copy-paste kode di bawah ini jika ingin manual:

<details>
<summary>Lihat Kode SQL</summary>

```sql
-- =============================================
-- Supabase Schema — bayar.gg Edition
-- Jalankan di Supabase → SQL Editor
-- =============================================

-- Tabel payments
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  bayargg_invoice_id text unique not null,
  amount bigint not null,
  final_amount bigint,
  unique_code int,
  description text not null,
  payment_method text check (payment_method in ('qris', 'qris_user', 'gopay_qris', 'ovo')) default 'qris',
  status text check (status in ('PENDING', 'PAID', 'EXPIRED', 'FAILED')) default 'PENDING',
  payment_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: user hanya bisa lihat payment milik sendiri
alter table public.payments enable row level security;

create policy "Users can view own payments"
  on public.payments for select
  using (auth.uid() = user_id);

create policy "Users can insert own payments"
  on public.payments for insert
  with check (auth.uid() = user_id);

-- Update updated_at otomatis
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger payments_updated_at
  before update on public.payments
  for each row execute procedure public.handle_updated_at();
```

</details>

### 4. Setup Webhook di bayar.gg

Agar status pembayaran otomatis berubah menjadi `PAID` di database Anda:

1. Buka Dashboard [bayar.gg](https://bayar.gg).
2. Masuk ke menu **Pengaturan** → **Webhook**.
3. Set **Callback URL** ke: `https://your-domain.com/api/bayargg/webhook`
   - _Untuk local development, gunakan tools seperti [ngrok](https://ngrok.com) untuk expose localhost._
4. Copy **Webhook Secret Key** dan paste ke variabel `BAYARGG_WEBHOOK_SECRET` di `.env.local`.

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 💳 Panduan Integrasi Pembayaran

Halaman `/payment` di boilerplate ini berisi **contoh implementasi minimal**. Fokus utamanya adalah menunjukkan bagaimana mengirim data dari Frontend ke Server Action.

### Cara Menggunakan di Project Anda

1. **Siapkan Data Produk:**
   Di komponen React Anda, tentukan `amount` (harga) dan `description` (nama produk) yang ingin dijual. Data ini biasanya diambil dari database atau props.

2. **Panggil Server Action:**
   Gunakan fungsi `createPayment` dari `@/actions/payment`.

   ```typescript
   // Contoh di dalam komponen React
   async function handleBuy() {
     const result = await createPayment({
       amount: 100000, // Harga dalam Rupiah
       description: "Beli Produk A", // Deskripsi transaksi
       paymentMethod: "qris", // Metode pembayaran
       // customerPhone: "0812..."  // Opsional
     });

     if (result.data) {
       window.location.href = result.data.payment_url; // Redirect ke halaman bayar
     }
   }
   ```

3. **Validasi di Backend (Opsional tapi Disarankan):**
   Untuk keamanan ekstra, validasi harga di dalam `actions/payment.ts` sebelum memanggil API bayar.gg, terutama jika harga berasal dari input user.

### Alur Teknis (Flow)

1. **Initiate**: User klik "Bayar" → Frontend memanggil Server Action `createPayment`.
2. **Create Invoice**: Server Action memanggil API bayar.gg via `lib/bayargg.ts`.
3. **Save DB**: Server menyimpan data invoice dengan status `PENDING` ke Supabase.
4. **Redirect**: User diarahkan ke `payment_url` (halaman bayar.gg).
5. **Payment**: User menyelesaikan pembayaran di pihak ketiga.
6. **Webhook**: bayar.gg mengirim POST request ke `/api/bayargg/webhook`.
7. **Verify & Update**:
   - Server memverifikasi signature HMAC SHA256.
   - Jika valid, status di database diubah menjadi `PAID`.
8. **Success**: User kembali ke aplikasi dan melihat status sukses.

---

## 📂 Struktur File Penting

```
├── actions/
│   ├── auth.ts            # Login, Register, Get User
│   └── payment.ts         # Create Payment & Save to DB (Lihat JSDoc di sini)
├── app/
│   ├── api/
│   │   └── bayargg/
│   │       └── webhook/   # Endpoint menerima callback dari bayar.gg
│   ├── (auth)/            # Halaman Login & Register
│   ├── (protected)/
│   │   └── payment/       # Halaman Contoh Implementasi
│   └── layout.tsx
├── lib/
│   ├── bayargg/
│   │   └── index.ts       # Helper function API bayar.gg
│   └── supabase/          # Supabase Client Config
└── types/                 # TypeScript Definitions
```

## 🛠 Troubleshooting

- **Error `Unauthorized`**: Pastikan user sudah login. Halaman payment dilindungi middelware/proxy auth.
- **Webhook tidak masuk**: Pastikan URL webhook di dashboard bayar.gg sudah benar dan dapat diakses publik (gunakan ngrok jika testing di localhost).
- **Invalid Signature**: Cek apakah `BAYARGG_WEBHOOK_SECRET` di `.env.local` sama persis dengan di dashboard.
- **Data tidak masuk DB**: Cek console server untuk error Supabase. Pastikan RLS policy sudah benar.

## 📄 License

MIT License - feel free to use this boilerplate for your personal or commercial projects.
