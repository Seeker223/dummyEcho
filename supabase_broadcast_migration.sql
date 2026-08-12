-- 1. Enable realtime messages table for broadcast authorization
begin;
  create policy "Authenticated users can receive broadcasts"
  on "realtime"."messages"
  for select
  to authenticated
  using ( true );
commit;

-- 2. Create the broadcast function
create or replace function public.call_queue_changes()
returns trigger
security definer
language plpgsql
as $$
begin
  perform realtime.broadcast_changes(
    'call_queue_topic:' || coalesce(NEW.id, OLD.id)::text,
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );
  -- Also broadcast to a general topic for DoctorHomeScreen (which needs all queue changes)
  perform realtime.broadcast_changes(
    'call_queue_all',
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );
  return null;
end;
$$;

-- 3. Create the trigger on the call_queue table
drop trigger if exists handle_call_queue_changes on public.call_queue;
create trigger handle_call_queue_changes
after insert or update or delete
on public.call_queue
for each row
execute function call_queue_changes();
