-- Create test admin user
DO $$
DECLARE
  admin_uid uuid := gen_random_uuid();
  test_uid uuid := gen_random_uuid();
BEGIN
  -- Admin test account
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'testadmin@kenyashipment.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', admin_uid, 'authenticated', 'authenticated',
      'testadmin@kenyashipment.com', crypt('TestAdmin@2026', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Test Admin"}'::jsonb,
      false, '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), admin_uid,
      jsonb_build_object('sub', admin_uid::text, 'email', 'testadmin@kenyashipment.com'),
      'email', admin_uid::text, now(), now(), now());
    INSERT INTO public.profiles (id, full_name) VALUES (admin_uid, 'Test Admin') ON CONFLICT (id) DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (admin_uid, 'admin') ON CONFLICT DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (admin_uid, 'user') ON CONFLICT DO NOTHING;
  END IF;

  -- Buyer test account
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'testbuyer@kenyashipment.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', test_uid, 'authenticated', 'authenticated',
      'testbuyer@kenyashipment.com', crypt('TestBuyer@2026', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Test Buyer"}'::jsonb,
      false, '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), test_uid,
      jsonb_build_object('sub', test_uid::text, 'email', 'testbuyer@kenyashipment.com'),
      'email', test_uid::text, now(), now(), now());
    INSERT INTO public.profiles (id, full_name) VALUES (test_uid, 'Test Buyer') ON CONFLICT (id) DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (test_uid, 'user') ON CONFLICT DO NOTHING;
  END IF;
END $$;