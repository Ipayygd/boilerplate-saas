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