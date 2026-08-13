-- Spritz Perfumes — initial schema

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('customer', 'admin');

create type public.concentration as enum (
  'EDT', 'EDP', 'Parfum', 'Extrait', 'EDC', 'Other'
);

create type public.variant_type as enum ('full_size', 'decant');

create type public.lot_status as enum ('sealed', 'open', 'depleted');

create type public.order_status as enum (
  'pending_payment',
  'paid',
  'packing',
  'shipped',
  'cancelled',
  'delivered',
  'returned',
  'refunded'
);

create type public.payment_status as enum (
  'pending', 'success', 'failed', 'chargedback'
);

create type public.product_collection as enum (
  'core', 'gift_set', 'new', 'sale', 'limited'
);

create type public.product_gender as enum ('women', 'men', 'unisex');

create type public.inventory_event_kind as enum (
  'receive', 'open', 'adjust', 'loss', 'sample', 'sale'
);

create type public.return_status as enum (
  'pending', 'approved', 'rejected', 'refunded'
);

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Brands
-- ---------------------------------------------------------------------------
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  logo_url text,
  banner_url text,
  country text,
  website text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete restrict,
  name text not null,
  slug text not null unique,
  concentration public.concentration not null default 'EDP',
  description text,
  notes jsonb not null default '{"top":[],"heart":[],"base":[]}'::jsonb,
  images text[] not null default '{}',
  is_active boolean not null default true,
  gender public.product_gender,
  longevity text,
  projection text,
  season text,
  occasion text,
  country_of_origin text,
  year_released integer,
  perfumers text[] not null default '{}',
  collection public.product_collection not null default 'core',
  inspired_by text,
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_brand_id_idx on public.products (brand_id);
create index products_is_active_idx on public.products (is_active);
create index products_search_vector_idx on public.products using gin (search_vector);

-- ---------------------------------------------------------------------------
-- Variants
-- ---------------------------------------------------------------------------
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  type public.variant_type not null,
  size_ml numeric(10, 2) not null check (size_ml > 0),
  price_lkr numeric(12, 2) not null check (price_lkr >= 0),
  compare_at_price_lkr numeric(12, 2)
    check (compare_at_price_lkr is null or compare_at_price_lkr >= 0),
  sku text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (product_id, type, size_ml)
);

create index product_variants_product_id_idx on public.product_variants (product_id);

-- ---------------------------------------------------------------------------
-- Inventory lots
-- ---------------------------------------------------------------------------
create table public.inventory_lots (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete restrict,
  fill_ml numeric(10, 2) not null check (fill_ml > 0),
  remaining_ml numeric(10, 2) not null check (remaining_ml >= 0),
  status public.lot_status not null default 'sealed',
  cost_lkr numeric(12, 2),
  notes text,
  received_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index inventory_lots_product_status_idx
  on public.inventory_lots (product_id, status);

-- ---------------------------------------------------------------------------
-- Inventory events
-- ---------------------------------------------------------------------------
create table public.inventory_events (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid references public.inventory_lots (id) on delete set null,
  product_id uuid not null references public.products (id) on delete cascade,
  kind public.inventory_event_kind not null,
  delta_ml numeric(10, 2) not null default 0,
  note text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index inventory_events_product_id_idx
  on public.inventory_events (product_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  phone text not null,
  first_name text not null,
  last_name text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  district text not null,
  postal_code text,
  country text not null default 'Sri Lanka',
  status public.order_status not null default 'pending_payment',
  subtotal_lkr numeric(12, 2) not null,
  shipping_lkr numeric(12, 2) not null default 0,
  total_lkr numeric(12, 2) not null,
  notes text,
  tracking_number text,
  shipped_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  variant_id uuid references public.product_variants (id) on delete set null,
  product_name text not null,
  brand_name text not null,
  variant_type public.variant_type not null,
  size_ml numeric(10, 2) not null,
  sku text not null,
  quantity integer not null check (quantity > 0),
  unit_price_lkr numeric(12, 2) not null,
  line_total_lkr numeric(12, 2) not null
);

create index order_items_order_id_idx on public.order_items (order_id);

-- ---------------------------------------------------------------------------
-- Payments (PayHere)
-- ---------------------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  payhere_order_id text not null,
  payhere_payment_id text,
  status public.payment_status not null default 'pending',
  amount_lkr numeric(12, 2) not null,
  currency text not null default 'LKR',
  method text,
  raw_notify jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (payhere_order_id)
);

create index payments_order_id_idx on public.payments (order_id);

-- ---------------------------------------------------------------------------
-- Addresses
-- ---------------------------------------------------------------------------
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null default 'Home',
  first_name text not null,
  last_name text not null,
  phone text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  district text not null,
  postal_code text,
  country text not null default 'Sri Lanka',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index addresses_user_id_idx on public.addresses (user_id);

-- ---------------------------------------------------------------------------
-- Wishlist
-- ---------------------------------------------------------------------------
create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index wishlist_items_user_id_idx on public.wishlist_items (user_id);

-- ---------------------------------------------------------------------------
-- Reviews
-- ---------------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text,
  longevity_score integer check (longevity_score is null or longevity_score between 1 and 5),
  projection_score integer check (projection_score is null or projection_score between 1 and 5),
  value_score integer check (value_score is null or value_score between 1 and 5),
  packaging_score integer check (packaging_score is null or packaging_score between 1 and 5),
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, user_id)
);

create index reviews_product_id_idx on public.reviews (product_id);
create index reviews_approved_idx on public.reviews (product_id, is_approved);

-- ---------------------------------------------------------------------------
-- Return requests
-- ---------------------------------------------------------------------------
create table public.return_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  reason text not null,
  status public.return_status not null default 'pending',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index return_requests_user_id_idx on public.return_requests (user_id);

-- ---------------------------------------------------------------------------
-- Newsletter
-- ---------------------------------------------------------------------------
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Auth trigger: auto-create profile on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'customer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger inventory_lots_updated_at
  before update on public.inventory_lots
  for each row execute function public.set_updated_at();

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create trigger payments_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

-- Full-text search vector
create or replace function public.products_search_vector_update()
returns trigger
language plpgsql
as $$
declare
  brand_name text;
begin
  select name into brand_name from public.brands where id = new.brand_id;
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(brand_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.inspired_by, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.notes::text, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(new.perfumers, ' '), '')), 'C');
  return new;
end;
$$;

create trigger products_search_vector_trigger
  before insert or update of name, description, notes, brand_id, perfumers, inspired_by
  on public.products
  for each row execute function public.products_search_vector_update();

-- Open sealed lot for decanting
create or replace function public.open_lot_for_decanting(lot_id uuid)
returns public.inventory_lots
language plpgsql
security definer
set search_path = public
as $$
declare
  lot public.inventory_lots;
begin
  update public.inventory_lots
  set
    status = 'open',
    remaining_ml = fill_ml,
    updated_at = now()
  where id = lot_id and status = 'sealed'
  returning * into lot;

  if lot is null then
    raise exception 'Lot not found or not sealed';
  end if;

  return lot;
end;
$$;

-- Fulfill inventory after payment (service role / security definer)
create or replace function public.fulfill_order_inventory(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item record;
  need_ml numeric;
  lot record;
  take_ml numeric;
  sealed_id uuid;
begin
  for item in
    select oi.*, pv.product_id
    from public.order_items oi
    left join public.product_variants pv on pv.id = oi.variant_id
    where oi.order_id = p_order_id
  loop
    if item.variant_type = 'full_size' then
      for i in 1..item.quantity loop
        select id into sealed_id
        from public.inventory_lots
        where product_id = item.product_id
          and status = 'sealed'
          and fill_ml = item.size_ml
        order by received_at asc
        limit 1
        for update skip locked;

        if sealed_id is null then
          select id into sealed_id
          from public.inventory_lots
          where product_id = item.product_id and status = 'sealed'
          order by received_at asc
          limit 1
          for update skip locked;
        end if;

        if sealed_id is null then
          raise exception 'Insufficient sealed stock for %', item.product_name;
        end if;

        update public.inventory_lots
        set status = 'depleted', remaining_ml = 0, updated_at = now()
        where id = sealed_id;
      end loop;
    else
      need_ml := item.size_ml * item.quantity;

      while need_ml > 0 loop
        select * into lot
        from public.inventory_lots
        where product_id = item.product_id
          and status = 'open'
          and remaining_ml > 0
        order by received_at asc
        limit 1
        for update skip locked;

        if lot is null then
          raise exception 'Insufficient decant stock for %', item.product_name;
        end if;

        take_ml := least(lot.remaining_ml, need_ml);

        update public.inventory_lots
        set
          remaining_ml = remaining_ml - take_ml,
          status = case
            when remaining_ml - take_ml <= 0 then 'depleted'::public.lot_status
            else status
          end,
          updated_at = now()
        where id = lot.id;

        need_ml := need_ml - take_ml;
      end loop;
    end if;
  end loop;
end;
$$;

-- Public stock summary (hides cost fields)
create or replace function public.product_stock_summary(p_product_id uuid)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'sealedBottles', (
      select count(*)::int from public.inventory_lots
      where product_id = p_product_id and status = 'sealed'
    ),
    'openMl', (
      select coalesce(sum(remaining_ml), 0) from public.inventory_lots
      where product_id = p_product_id and status = 'open'
    )
  );
$$;

-- Variant purchasable helper
create or replace function public.variant_is_purchasable(p_variant_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v record;
  sealed integer;
  open_ml numeric;
begin
  select * into v from public.product_variants where id = p_variant_id and is_active;
  if not found then
    return false;
  end if;

  select coalesce(sum(case when status = 'sealed' then 1 else 0 end), 0),
         coalesce(sum(case when status = 'open' then remaining_ml else 0 end), 0)
    into sealed, open_ml
  from public.inventory_lots
  where product_id = v.product_id;

  if v.type = 'full_size' then
    return sealed >= 1;
  end if;
  return open_ml >= v.size_ml;
end;
$$;

-- Product rating aggregate view (security_invoker → underlying RLS applies)
create or replace view public.product_rating_summary
with (security_invoker = true) as
select
  product_id,
  count(*)::integer as review_count,
  round(avg(rating)::numeric, 2) as avg_rating
from public.reviews
where is_approved = true
group by product_id;

-- Units sold from completed orders (service role only; popularity / best sellers)
create or replace view public.product_sales_summary
with (security_invoker = true) as
select
  pv.product_id,
  coalesce(sum(oi.quantity), 0)::integer as units_sold
from public.order_items oi
join public.orders o on o.id = oi.order_id
join public.product_variants pv on pv.id = oi.variant_id
where o.status in ('paid', 'packing', 'shipped', 'delivered')
group by pv.product_id;

revoke all on public.product_rating_summary from public;
grant select on public.product_rating_summary to anon, authenticated, service_role;

revoke all on public.product_sales_summary from public, anon, authenticated;
grant select on public.product_sales_summary to service_role;

-- Verified purchaser check for reviews
create or replace function public.user_has_purchased_product(
  p_product_id uuid,
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.orders o
    join public.order_items oi on oi.order_id = o.id
    left join public.product_variants pv on pv.id = oi.variant_id
    where o.user_id = p_user_id
      and o.status in ('paid', 'packing', 'shipped', 'delivered')
      and (
        pv.product_id = p_product_id
        or exists (
          select 1 from public.products p
          where p.id = p_product_id and p.name = oi.product_name
        )
      )
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory_lots enable row level security;
alter table public.inventory_events enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.addresses enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.reviews enable row level security;
alter table public.return_requests enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Profiles
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.profiles where id = auth.uid())
  );

create policy "Admins manage profiles"
  on public.profiles for all
  using (public.is_admin());

-- Brands / products / variants
create policy "Public read brands"
  on public.brands for select using (true);

create policy "Admins manage brands"
  on public.brands for all using (public.is_admin());

create policy "Public read active products"
  on public.products for select
  using (is_active = true or public.is_admin());

create policy "Admins manage products"
  on public.products for all using (public.is_admin());

create policy "Public read active variants"
  on public.product_variants for select
  using (is_active = true or public.is_admin());

create policy "Admins manage variants"
  on public.product_variants for all using (public.is_admin());

-- Inventory
create policy "Admins manage inventory"
  on public.inventory_lots for all using (public.is_admin());

create policy "Admins manage inventory events"
  on public.inventory_events for all
  using (public.is_admin())
  with check (public.is_admin());

-- Orders
create policy "Users read own orders"
  on public.orders for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users insert own orders"
  on public.orders for insert
  with check (user_id is null or auth.uid() = user_id or public.is_admin());

create policy "Admins update orders"
  on public.orders for update
  using (public.is_admin());

create policy "Users read own order items"
  on public.order_items for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "Insert order items with order"
  on public.order_items for insert
  with check (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or o.user_id is null)
    )
  );

create policy "Admins manage order items"
  on public.order_items for all using (public.is_admin());

-- Payments
create policy "Admins read payments"
  on public.payments for select using (public.is_admin());

create policy "Users read own payments"
  on public.payments for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

-- Addresses
create policy "Users manage own addresses"
  on public.addresses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins read addresses"
  on public.addresses for select
  using (public.is_admin());

-- Wishlist
create policy "Users manage own wishlist"
  on public.wishlist_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Reviews
create policy "Public read approved reviews"
  on public.reviews for select
  using (is_approved = true or auth.uid() = user_id or public.is_admin());

create policy "Users insert own reviews"
  on public.reviews for insert
  with check (
    auth.uid() = user_id
    and public.user_has_purchased_product(product_id)
  );

create policy "Users update own reviews"
  on public.reviews for update
  using (auth.uid() = user_id or public.is_admin());

create policy "Admins manage reviews"
  on public.reviews for all
  using (public.is_admin())
  with check (public.is_admin());

-- Returns
create policy "Users manage own returns"
  on public.return_requests for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users insert own returns"
  on public.return_requests for insert
  with check (auth.uid() = user_id);

create policy "Admins update returns"
  on public.return_requests for update
  using (public.is_admin());

-- Newsletter
create policy "Anyone can subscribe newsletter"
  on public.newsletter_subscribers for insert
  with check (true);

create policy "Admins read newsletter"
  on public.newsletter_subscribers for select
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
revoke execute on function public.fulfill_order_inventory(uuid) from public, anon, authenticated;
revoke execute on function public.open_lot_for_decanting(uuid) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.product_stock_summary(uuid) to anon, authenticated;
grant execute on function public.variant_is_purchasable(uuid) to anon, authenticated;
grant execute on function public.user_has_purchased_product(uuid, uuid) to authenticated;
grant execute on function public.fulfill_order_inventory(uuid) to service_role;
grant execute on function public.open_lot_for_decanting(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- Storage buckets + policies
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('brand-assets', 'brand-assets', true)
on conflict (id) do nothing;

create policy "Admins upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admins update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());

create policy "Admins delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

create policy "Public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admins upload brand assets"
  on storage.objects for insert
  with check (bucket_id = 'brand-assets' and public.is_admin());

create policy "Admins update brand assets"
  on storage.objects for update
  using (bucket_id = 'brand-assets' and public.is_admin());

create policy "Admins delete brand assets"
  on storage.objects for delete
  using (bucket_id = 'brand-assets' and public.is_admin());

create policy "Public read brand assets"
  on storage.objects for select
  using (bucket_id = 'brand-assets');
