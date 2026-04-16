-- Fix missing read-tracking columns required by mark_conversation_read().
-- Safe to run multiple times.

alter table public.conversation_summaries
  add column if not exists last_read_message_id uuid null references public.messages(id) on delete set null,
  add column if not exists last_read_at timestamptz null;
