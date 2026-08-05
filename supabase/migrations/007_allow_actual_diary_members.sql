CREATE OR REPLACE FUNCTION public.is_shared_diary_member()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $function$
  SELECT COALESCE(
    (auth.jwt() ->> 'email') = ANY (
      ARRAY['love@qq.cl', 'test@qq.com', 'us@journey.app']::text[]
    ),
    false
  );
$function$;
