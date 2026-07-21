-- 🎁 Regala ARIA (Skeezu 22 lug 2026): premio manuale ai tester più attivi da ABO.
-- SOLO ARIA, mai ROBI (sarebbe unfair: i ROBI nascono solo dal motore airdrop).
-- Doppia scrittura ledger+profiles (schema attuale senza trigger di sync) +
-- notifica campanella opzionale con testo libero. Admin-only via is_admin().
create or replace function public.admin_gift_aria(
  p_email text, p_amount int, p_message text default null, p_notify boolean default true
) returns jsonb
language plpgsql security definer set search_path to 'public'
as $$
declare
  v_user uuid; v_balance int; v_admin_email text;
begin
  if not is_admin() then return jsonb_build_object('ok',false,'error','not_admin'); end if;
  if p_amount is null or p_amount <= 0 or p_amount > 1000000 then
    return jsonb_build_object('ok',false,'error','importo non valido (1 – 1.000.000 ARIA)');
  end if;
  select id into v_user from profiles where lower(email) = lower(trim(p_email));
  if v_user is null then
    return jsonb_build_object('ok',false,'error','utente non trovato: '||coalesce(trim(p_email),'?'));
  end if;
  select email into v_admin_email from profiles where id = auth.uid();
  insert into points_ledger(user_id, amount, reason, metadata)
  values (v_user, p_amount, 'admin_gift',
          jsonb_build_object('note', coalesce(p_message,'gift'),
                             'granted_by', coalesce(v_admin_email, auth.uid()::text),
                             'via', 'abo_regala_aria'));
  update profiles set total_points = total_points + p_amount
   where id = v_user
   returning total_points into v_balance;
  if p_notify then
    insert into notifications(user_id, title, body, type)
    values (v_user,
            '🎁 Hai ricevuto '||to_char(p_amount,'FM999G999G999')||' ARIA!',
            coalesce(nullif(trim(p_message),''),'Un regalo dal team AIROOBI 💛'),
            'admin_gift');
  end if;
  return jsonb_build_object('ok',true,'email',lower(trim(p_email)),
                            'amount',p_amount,'new_balance',v_balance,
                            'notified',p_notify);
end; $$;
grant execute on function public.admin_gift_aria(text,int,text,boolean) to authenticated;
