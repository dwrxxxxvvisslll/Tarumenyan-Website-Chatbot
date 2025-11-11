create table if not exists public.data_riset_prewedding (
  id bigserial primary key,
  created_at timestamptz default now(),
  timestamp timestamptz,
  nama_pasangan text,
  kisah_cinta text,
  latar_belakang text,
  tahu_legenda_sebelumnya boolean,
  rekomendasi_tema text,
  kepuasan numeric,
  budget text,
  conversation_id text not null
);

create unique index if not exists data_riset_unique
  on public.data_riset_prewedding (conversation_id, timestamp);

alter table public.data_riset_prewedding enable row level security;

-- Optional policies (safe defaults)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='data_riset_prewedding' and policyname='Allow read to all'
  ) then
    create policy "Allow read to all" on public.data_riset_prewedding for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='data_riset_prewedding' and policyname='Allow insert to authenticated'
  ) then
    create policy "Allow insert to authenticated" on public.data_riset_prewedding for insert to authenticated with check (true);
  end if;
end $$;

