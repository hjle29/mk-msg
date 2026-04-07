create table if not exists letters (
  id uuid primary key default gen_random_uuid(),
  share_id text unique not null,
  situation_id text,
  custom_situation text,
  answers jsonb not null default '[]',
  scenes jsonb not null default '[]',
  content text not null,
  lang text not null default 'ko',
  created_at timestamptz not null default now()
);

-- Index for fast share_id lookup
create index if not exists letters_share_id_idx on letters (share_id);

-- Enable Row Level Security
alter table letters enable row level security;

-- Public read (shared letters are public by link)
create policy "Public read by share_id"
  on letters for select
  using (true);

-- Public insert (no auth needed)
create policy "Anyone can insert"
  on letters for insert
  with check (true);
