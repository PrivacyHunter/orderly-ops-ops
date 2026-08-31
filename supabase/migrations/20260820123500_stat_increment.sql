create or replace function public.increment_video_stat(vid_id uuid, col text, val integer)
returns void
language plpgsql
security definer
as $$
begin
  execute format('update public.customization_videos set %I = %I + $1 where id = $2', col, col)
  using val, vid_id;
end;
$$;
