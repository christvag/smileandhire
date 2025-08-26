-- Migrate CLIENT users to companies table
DO $$
DECLARE
    client_user RECORD;
    company_name TEXT;
    company_username TEXT;
    final_company_username TEXT;
    counter INTEGER;
    existing_company RECORD;
BEGIN
    -- Loop through CLIENT users
    FOR client_user IN 
        SELECT u.id, u.email, u."firstName", u."lastName", u.name, u.username
        FROM users u
        WHERE u.role = 'CLIENT'
    LOOP
        -- Check if company already exists for this user
        SELECT * INTO existing_company 
        FROM companies 
        WHERE "userId" = client_user.id;
        
        IF existing_company.id IS NOT NULL THEN
            -- Update existing company with username if missing
            IF existing_company.username IS NULL AND client_user.username IS NOT NULL THEN
                UPDATE companies 
                SET username = client_user.username
                WHERE id = existing_company.id;
                
                RAISE NOTICE 'Updated existing company username for user %: @%', client_user.email, client_user.username;
            ELSE
                RAISE NOTICE 'Company already exists for user %', client_user.email;
            END IF;
            CONTINUE;
        END IF;
        
        -- Generate company name
        IF client_user."firstName" IS NOT NULL AND client_user."lastName" IS NOT NULL THEN
            company_name := client_user."firstName" || ' ' || client_user."lastName" || ' Company';
        ELSIF client_user.name IS NOT NULL THEN
            company_name := client_user.name || ' Company';
        ELSE
            company_name := split_part(client_user.email, '@', 1) || ' Company';
        END IF;
        
        -- Generate company username
        IF client_user.username IS NOT NULL THEN
            company_username := LOWER(client_user.username);
        ELSE
            company_username := LOWER(regexp_replace(company_name, '[^a-z0-9]+', '-', 'g'));
            company_username := trim(both '-' from company_username);
        END IF;
        
        final_company_username := company_username;
        counter := 1;
        
        -- Ensure company username is unique
        WHILE EXISTS(SELECT 1 FROM companies WHERE username = final_company_username) LOOP
            final_company_username := company_username || counter::TEXT;
            counter := counter + 1;
        END LOOP;
        
        -- Create company record
        INSERT INTO companies (
            id,
            "userId",
            name,
            username,
            description,
            location,
            "companySize",
            "createdAt",
            "updatedAt"
        ) VALUES (
            'company_' || substr(md5(random()::text), 0, 25),
            client_user.id,
            company_name,
            final_company_username,
            'Professional services company managed by ' || COALESCE(client_user.name, client_user."firstName" || ' ' || client_user."lastName", client_user.email),
            'Not specified',
            '1-10',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created company: % (@%) for user %', company_name, final_company_username, client_user.email;
    END LOOP;
END $$;