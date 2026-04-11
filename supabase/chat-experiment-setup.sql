create extension if not exists pgcrypto;

create table if not exists chat_rooms (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('direct', 'group')),
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists chat_room_members (
  room_id uuid not null references chat_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references chat_rooms(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete restrict,
  client_id text,
  content text not null,
  message_type text not null default 'text' check (message_type in ('text')),
  created_at timestamptz not null default now()
);

create table if not exists conversation_summaries (
  conversation_id uuid not null references chat_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  kind text not null check (kind in ('direct', 'group')),
  last_message_id uuid null references messages(id) on delete set null,
  last_message_text text null,
  last_message_at timestamptz null,
  unread_count integer not null default 0,
  last_read_message_id uuid null references messages(id) on delete set null,
  last_read_at timestamptz null,
  updated_at timestamptz not null default now(),
  primary key (user_id, conversation_id)
);

create index if not exists idx_messages_room_created_at
  on messages(room_id, created_at desc);

create unique index if not exists idx_messages_sender_client_id
  on messages(sender_id, client_id)
  where client_id is not null;

create index if not exists idx_conversation_summaries_user_last_message_at
  on conversation_summaries(user_id, last_message_at desc nulls last);

create index if not exists idx_conversation_summaries_conversation
  on conversation_summaries(conversation_id);

create index if not exists idx_conversation_summaries_user_unread_last_message
  on conversation_summaries(user_id, unread_count desc, last_message_at desc nulls last);

create or replace function public.sync_conversation_summary_for_member(
  member_room_id uuid,
  member_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  room_record chat_rooms%rowtype;
  latest_message_record record;
begin
  select *
  into room_record
  from public.chat_rooms
  where id = member_room_id;

  if not found then
    return;
  end if;

  select
    m.id,
    m.content,
    m.created_at
  into latest_message_record
  from public.messages m
  where m.room_id = member_room_id
  order by m.created_at desc
  limit 1;

  insert into public.conversation_summaries (
    conversation_id,
    user_id,
    title,
    kind,
    last_message_id,
    last_message_text,
    last_message_at,
    unread_count,
    updated_at
  )
  values (
    member_room_id,
    member_user_id,
    room_record.title,
    room_record.type,
    latest_message_record.id,
    latest_message_record.content,
    latest_message_record.created_at,
    0,
    coalesce(latest_message_record.created_at, now())
  )
  on conflict (user_id, conversation_id) do update
  set
    title = excluded.title,
    kind = excluded.kind,
    last_message_id = excluded.last_message_id,
    last_message_text = excluded.last_message_text,
    last_message_at = excluded.last_message_at,
    updated_at = excluded.updated_at;
end;
$$;

create or replace function public.handle_chat_room_member_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sync_conversation_summary_for_member(new.room_id, new.user_id);
  return new;
end;
$$;

create or replace function public.handle_chat_room_member_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.conversation_summaries
  where conversation_id = old.room_id
    and user_id = old.user_id;

  return old;
end;
$$;

create or replace function public.handle_message_insert_update_summaries()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversation_summaries
  set
    last_message_id = new.id,
    last_message_text = new.content,
    last_message_at = new.created_at,
    unread_count = case
      when user_id = new.sender_id then 0
      else unread_count + 1
    end,
    updated_at = new.created_at
  where conversation_id = new.room_id;

  return new;
end;
$$;

create or replace function public.handle_chat_room_update_sync_summaries()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversation_summaries
  set
    title = new.title,
    kind = new.type,
    updated_at = greatest(updated_at, now())
  where conversation_id = new.id;

  return new;
end;
$$;

create or replace function public.mark_conversation_read(conversation_uuid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  latest_message_record record;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1
    from public.chat_room_members
    where room_id = conversation_uuid
      and user_id = auth.uid()
  ) then
    raise exception 'Not a member of this conversation';
  end if;

  select
    m.id,
    m.created_at
  into latest_message_record
  from public.messages m
  where m.room_id = conversation_uuid
  order by m.created_at desc
  limit 1;

  update public.conversation_summaries
  set
    unread_count = 0,
    last_read_message_id = latest_message_record.id,
    last_read_at = now(),
    updated_at = greatest(updated_at, now())
  where conversation_id = conversation_uuid
    and user_id = auth.uid();
end;
$$;

drop trigger if exists chat_room_members_after_insert_summary on chat_room_members;
create trigger chat_room_members_after_insert_summary
after insert on chat_room_members
for each row
execute function public.handle_chat_room_member_insert();

drop trigger if exists chat_room_members_after_delete_summary on chat_room_members;
create trigger chat_room_members_after_delete_summary
after delete on chat_room_members
for each row
execute function public.handle_chat_room_member_delete();

drop trigger if exists messages_after_insert_summary on messages;
create trigger messages_after_insert_summary
after insert on messages
for each row
execute function public.handle_message_insert_update_summaries();

drop trigger if exists chat_rooms_after_update_summary on chat_rooms;
create trigger chat_rooms_after_update_summary
after update of title, type on chat_rooms
for each row
execute function public.handle_chat_room_update_sync_summaries();

insert into public.conversation_summaries (
  conversation_id,
  user_id,
  title,
  kind,
  last_message_id,
  last_message_text,
  last_message_at,
  unread_count,
  updated_at
)
select
  crm.room_id,
  crm.user_id,
  cr.title,
  cr.type,
  latest_message.id,
  latest_message.content,
  latest_message.created_at,
  0,
  coalesce(latest_message.created_at, now())
from public.chat_room_members crm
join public.chat_rooms cr on cr.id = crm.room_id
left join lateral (
  select
    m.id,
    m.content,
    m.created_at
  from public.messages m
  where m.room_id = crm.room_id
  order by m.created_at desc
  limit 1
) latest_message on true
on conflict (user_id, conversation_id) do update
set
  title = excluded.title,
  kind = excluded.kind,
  last_message_id = excluded.last_message_id,
  last_message_text = excluded.last_message_text,
  last_message_at = excluded.last_message_at,
  updated_at = excluded.updated_at;

alter table chat_rooms enable row level security;
alter table chat_room_members enable row level security;
alter table messages enable row level security;
alter table conversation_summaries enable row level security;

drop policy if exists "members can read their memberships" on chat_room_members;
create policy "members can read their memberships"
on chat_room_members
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "members can read their rooms" on chat_rooms;
create policy "members can read their rooms"
on chat_rooms
for select
to authenticated
using (
  exists (
    select 1
    from chat_room_members m
    where m.room_id = chat_rooms.id
      and m.user_id = auth.uid()
  )
);

drop policy if exists "members can read messages in their rooms" on messages;
create policy "members can read messages in their rooms"
on messages
for select
to authenticated
using (
  exists (
    select 1
    from chat_room_members m
    where m.room_id = messages.room_id
      and m.user_id = auth.uid()
  )
);

drop policy if exists "members can send messages to their rooms" on messages;
create policy "members can send messages to their rooms"
on messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1
    from chat_room_members m
    where m.room_id = messages.room_id
      and m.user_id = auth.uid()
  )
);

drop policy if exists "members can read their conversation summaries" on conversation_summaries;
create policy "members can read their conversation summaries"
on conversation_summaries
for select
to authenticated
using (user_id = auth.uid());

revoke all on function public.mark_conversation_read(uuid) from public;
grant execute on function public.mark_conversation_read(uuid) to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'conversation_summaries'
  ) then
    alter publication supabase_realtime add table public.conversation_summaries;
  end if;
end
$$;

alter table realtime.messages enable row level security;

drop policy if exists "chat members can receive room realtime events" on realtime.messages;
create policy "chat members can receive room realtime events"
on realtime.messages
for select
to authenticated
using (
  realtime.messages.extension in ('broadcast', 'presence')
  and exists (
    select 1
    from public.chat_room_members m
    where m.user_id = auth.uid()
      and ('room:' || m.room_id::text) = realtime.topic()
  )
);

drop policy if exists "chat members can send room realtime events" on realtime.messages;
create policy "chat members can send room realtime events"
on realtime.messages
for insert
to authenticated
with check (
  realtime.messages.extension in ('broadcast', 'presence')
  and exists (
    select 1
    from public.chat_room_members m
    where m.user_id = auth.uid()
      and ('room:' || m.room_id::text) = realtime.topic()
  )
);

select id, email, created_at
from auth.users
order by created_at desc;

insert into chat_rooms (id, type, title)
values ('11111111-1111-1111-1111-111111111111', 'direct', 'Google Test Room')
on conflict (id) do nothing;

insert into chat_room_members (room_id, user_id)
values
  ('11111111-1111-1111-1111-111111111111', 'USER_ID_ACCOUNT_A'),
  ('11111111-1111-1111-1111-111111111111', 'USER_ID_ACCOUNT_B')
on conflict do nothing;
