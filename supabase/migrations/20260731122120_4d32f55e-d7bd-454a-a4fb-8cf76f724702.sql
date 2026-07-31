DO $$
DECLARE
  t record;
  pol record;
  priv text;
  qual_txt text;
  chk_txt text;
BEGIN
  FOR t IN
    SELECT c.oid, c.relname
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND c.relkind = 'r'
  LOOP
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', t.relname);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t.relname);

    FOR pol IN
      SELECT p.polcmd,
             pg_get_expr(p.polqual, p.polrelid) AS qual,
             pg_get_expr(p.polwithcheck, p.polrelid) AS wc,
             CASE WHEN p.polroles = '{0}'::oid[] THEN ARRAY['anon','authenticated']
                  ELSE ARRAY(SELECT r.rolname FROM pg_roles r WHERE r.oid = ANY(p.polroles)) END AS roles
        FROM pg_policy p
       WHERE p.polrelid = t.oid AND p.polpermissive
    LOOP
      qual_txt := coalesce(pol.qual, '');
      chk_txt := coalesce(pol.wc, '');
      IF qual_txt = 'false' OR chk_txt = 'false' THEN
        CONTINUE;
      END IF;

      priv := CASE pol.polcmd
                WHEN 'r' THEN 'SELECT'
                WHEN 'a' THEN 'INSERT'
                WHEN 'w' THEN 'UPDATE'
                WHEN 'd' THEN 'DELETE'
                ELSE 'SELECT, INSERT, UPDATE, DELETE'
              END;

      IF 'anon' = ANY(pol.roles) THEN
        EXECUTE format('GRANT %s ON public.%I TO anon', priv, t.relname);
      END IF;
      IF 'authenticated' = ANY(pol.roles) THEN
        EXECUTE format('GRANT %s ON public.%I TO authenticated', priv, t.relname);
      END IF;
    END LOOP;
  END LOOP;
END;
$$;

-- Les comptes connectés (administrateurs) doivent pouvoir lire leur rôle.
GRANT SELECT ON public.user_roles TO authenticated;