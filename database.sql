-- Run this script in the Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  image_url text not null default '',
  price_gh numeric(10, 2) not null default 0 check (price_gh >= 0),
  price_ng numeric(12, 2) not null default 0 check (price_ng >= 0),
  active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  storage_path text,
  caption text not null default '',
  published boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gallery add column if not exists storage_path text;

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  review_date date,
  rating integer not null default 5 check (rating between 1 and 5),
  source text not null default '',
  original_url text not null default '',
  text text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

grant usage on schema public to anon, authenticated;
grant select on public.services, public.gallery, public.testimonials, public.site_settings to anon, authenticated;
grant insert, update, delete on public.services, public.gallery, public.testimonials, public.site_settings to authenticated;
grant select on public.admin_users to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.admin_users enable row level security;
alter table public.services enable row level security;
alter table public.gallery enable row level security;
alter table public.testimonials enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "Admins can read own admin record" on public.admin_users;
create policy "Admins can read own admin record"
on public.admin_users for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Public can read active services" on public.services;
drop policy if exists "Public can read published content" on public.services;
create policy "Public can read active services"
on public.services for select to anon, authenticated
using (active = true);

drop policy if exists "Admins can manage services" on public.services;
drop policy if exists "Admin can manage services" on public.services;
create policy "Admins can manage services"
on public.services for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Public can read published gallery" on public.gallery;
create policy "Public can read published gallery"
on public.gallery for select to anon, authenticated
using (published = true);

drop policy if exists "Admins can manage gallery" on public.gallery;
drop policy if exists "Admin can manage gallery" on public.gallery;
create policy "Admins can manage gallery"
on public.gallery for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Public can read approved reviews" on public.testimonials;
create policy "Public can read approved reviews"
on public.testimonials for select to anon, authenticated
using (approved = true);

drop policy if exists "Admins can manage testimonials" on public.testimonials;
drop policy if exists "Admin can manage testimonials" on public.testimonials;
create policy "Admins can manage testimonials"
on public.testimonials for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
on public.site_settings for select to anon, authenticated
using (true);

drop policy if exists "Admins can manage site settings" on public.site_settings;
drop policy if exists "Admin can manage site settings" on public.site_settings;
create policy "Admins can manage site settings"
on public.site_settings for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists services_updated_at on public.services;
create trigger services_updated_at
before update on public.services
for each row execute function public.handle_updated_at();

drop trigger if exists gallery_updated_at on public.gallery;
create trigger gallery_updated_at
before update on public.gallery
for each row execute function public.handle_updated_at();

drop trigger if exists testimonials_updated_at on public.testimonials;
create trigger testimonials_updated_at
before update on public.testimonials
for each row execute function public.handle_updated_at();

drop trigger if exists site_settings_updated_at on public.site_settings;
create trigger site_settings_updated_at
before update on public.site_settings
for each row execute function public.handle_updated_at();

insert into public.services (id, name, description, image_url, price_gh, price_ng, display_order)
values
  ('00000000-0000-4000-8000-000000000001', 'Deep Tissue Reset', 'A targeted therapy for muscle tension, stress and recovery.', 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80', 350, 45000, 1),
  ('00000000-0000-4000-8000-000000000002', 'Luxury Swedish Massage', 'A soothing full-body ritual designed to relax and restore the nervous system.', 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=900&q=80', 420, 56000, 2),
  ('00000000-0000-4000-8000-000000000003', 'Couples Wellness Escape', 'An indulgent shared experience for two, created for connection and calm.', 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80', 650, 86000, 3)
on conflict (id) do nothing;

insert into public.gallery (id, image_url, caption, display_order)
values
  ('00000000-0000-4000-8000-000000000011', 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80', 'Calm, restorative care', 1),
  ('00000000-0000-4000-8000-000000000012', 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=900&q=80', 'A discreet in-room ritual', 2),
  ('00000000-0000-4000-8000-000000000013', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80', 'Bodywork for recovery', 3),
  ('00000000-0000-4000-8000-000000000014', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80', 'Luxury wellness moments', 4)
on conflict (id) do nothing;

insert into public.testimonials (id, name, review_date, rating, source, original_url, text, approved)
values
  ('00000000-0000-4000-8000-000000000021', 'Ama K.', '2025-02-14', 5, 'Google', '', 'The massage was deeply relaxing and exactly what I needed after a long week. The mobile service was seamless and the atmosphere was beautifully calming.', true),
  ('00000000-0000-4000-8000-000000000022', 'Tobi A.', '2025-04-06', 5, 'Instagram', '', 'The treatment felt premium from start to finish. It was luxurious, professional and genuinely restorative.', true),
  ('00000000-0000-4000-8000-000000000023', 'Nadia M.', '2025-06-11', 4, 'Direct Client', '', 'Very thoughtful service with a calming aesthetic. I appreciated the care, the attention to detail and the relaxed energy.', true)
on conflict (id) do nothing;

insert into public.site_settings (key, value)
values
  ('site', '{"homepageHeadline":"Reset, restore and return to balance.","homepageIntro":"Bespoke massage and bodywork experiences designed to help you unwind, recover, and feel deeply cared for in the comfort of your home, hotel, or private retreat.","aboutTitle":"Personalised wellness, designed around your needs.","aboutText":["At The Era Wellness & Bodywork, we create mindful experiences that support stress relief, deep recovery and lasting calm. Our treatments are tailored to real life, blending luxury care with practical wellness support.","Whether you are seeking a restorative massage, a soothing after-work ritual or a premium mobile treatment for a special occasion, we bring professional care directly to your preferred space with warmth, discretion and attention to detail."],"whyChoose":[{"icon":"✦","title":"Tailored rituals","text":"Every session is designed around your body, pace, and goals."},{"icon":"✧","title":"Mobile convenience","text":"Receive premium bodywork in the comfort and privacy of your home or suite."},{"icon":"✷","title":"Luxury standards","text":"Fresh linens, elegant care and a restorative environment for every treatment."},{"icon":"✹","title":"Trusted professionals","text":"Thoughtful service, clear communication and a high-touch experience from start to finish."}],"bookingPolicy":"A 50% deposit is required to secure a booking. A booking is only confirmed after the business confirms availability and receives the required deposit.","footerCopy":"The Era Wellness & Bodywork offers luxury massage and wellness services across Ghana and Nigeria.","instagramUrl":"https://www.instagram.com/theera377/","googleMapsReviewUrl":""}'::jsonb),
  ('ghana', '{"location":"Kumasi, Ghana","currency":"GHS / GH₵","whatsapp":"+233543311806","email":"","bookingInstructions":"Share your preferred date, time and treatment and we will confirm availability and secure your booking with a 50% deposit.","contactCopy":"Luxury massage and wellness services in Kumasi, Ghana."}'::jsonb),
  ('nigeria', '{"location":"Lagos and Ilorin, Kwara State, Nigeria","currency":"NGN / ₦","whatsapp":"+2349137948427","email":"tera84345@gmail.com","bookingInstructions":"Share your location and preferred treatment, and our team will confirm availability and send booking details.","contactCopy":"Premium mobile bodywork services in Lagos and Ilorin, Nigeria."}'::jsonb)
on conflict (key) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('era-gallery', 'era-gallery', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view gallery images" on storage.objects;
create policy "Public can view gallery images"
on storage.objects for select to anon, authenticated
using (bucket_id = 'era-gallery');

drop policy if exists "Admins can upload gallery images" on storage.objects;
create policy "Admins can upload gallery images"
on storage.objects for insert to authenticated
with check (bucket_id = 'era-gallery' and (select public.is_admin()));

drop policy if exists "Admins can update gallery images" on storage.objects;
create policy "Admins can update gallery images"
on storage.objects for update to authenticated
using (bucket_id = 'era-gallery' and (select public.is_admin()))
with check (bucket_id = 'era-gallery' and (select public.is_admin()));

drop policy if exists "Admins can delete gallery images" on storage.objects;
create policy "Admins can delete gallery images"
on storage.objects for delete to authenticated
using (bucket_id = 'era-gallery' and (select public.is_admin()));

do $$
begin
  if to_regclass('public.bookings') is not null then
    execute 'alter table public.bookings enable row level security';
    execute 'drop policy if exists "Admin can manage bookings" on public.bookings';
    execute 'drop policy if exists "Public can insert bookings" on public.bookings';
    execute 'drop policy if exists "Admins can manage bookings" on public.bookings';
  end if;
end;
$$;
