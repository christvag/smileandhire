-- COMPREHENSIVE SUPABASE MIGRATION SCRIPT
-- Run this entire script in your Supabase SQL Editor
-- This will add username columns and populate them with data

-- ================================================
-- STEP 1: Add username column to users table
-- ================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ================================================
-- STEP 2: Add username column to companies table
-- ================================================
ALTER TABLE companies ADD COLUMN IF NOT EXISTS username TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_companies_username ON companies(username);

-- ================================================
-- STEP 3: Add userId column to companies table (to link companies to users)
-- ================================================
ALTER TABLE companies ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_companies_userId ON companies("userId");

-- ================================================
-- STEP 4: Generate usernames for all existing users
-- ================================================
DO $$
DECLARE
    user_record RECORD;
    base_username TEXT;
    final_username TEXT;
    counter INTEGER;
BEGIN
    RAISE NOTICE 'Starting username generation for users...';
    
    -- Loop through users without usernames
    FOR user_record IN 
        SELECT id, "firstName", "lastName", email
        FROM users 
        WHERE username IS NULL OR username = ''
    LOOP
        -- Generate base username from name
        IF user_record."firstName" IS NOT NULL AND user_record."lastName" IS NOT NULL THEN
            base_username := LOWER(
                regexp_replace(
                    user_record."firstName" || '-' || user_record."lastName", 
                    '[^a-z0-9]+', 
                    '-', 
                    'g'
                )
            );
        ELSIF user_record."firstName" IS NOT NULL THEN
            base_username := LOWER(regexp_replace(user_record."firstName", '[^a-z0-9]+', '-', 'g'));
        ELSIF user_record."lastName" IS NOT NULL THEN
            base_username := LOWER(regexp_replace(user_record."lastName", '[^a-z0-9]+', '-', 'g'));
        ELSIF user_record.email IS NOT NULL THEN
            base_username := LOWER(regexp_replace(SPLIT_PART(user_record.email, '@', 1), '[^a-z0-9]+', '-', 'g'));
        ELSE
            base_username := 'user';
        END IF;
        
        -- Clean up the username
        base_username := trim(both '-' from base_username);
        
        -- Ensure it's not empty
        IF base_username = '' OR base_username IS NULL THEN
            base_username := 'user';
        END IF;
        
        final_username := base_username;
        counter := 1;
        
        -- Ensure username is unique
        WHILE EXISTS(SELECT 1 FROM users WHERE username = final_username AND id != user_record.id) LOOP
            final_username := base_username || counter::TEXT;
            counter := counter + 1;
        END LOOP;
        
        -- Update the user with the unique username
        UPDATE users 
        SET username = final_username
        WHERE id = user_record.id;
        
        RAISE NOTICE 'Updated user %: % -> @%', user_record.id, user_record."firstName", final_username;
    END LOOP;
    
    RAISE NOTICE 'User username generation completed!';
END $$;

-- ================================================
-- STEP 5: Generate usernames for all existing companies
-- ================================================
DO $$
DECLARE
    company_record RECORD;
    base_username TEXT;
    final_username TEXT;
    counter INTEGER;
BEGIN
    RAISE NOTICE 'Starting username generation for companies...';
    
    -- Loop through companies without usernames
    FOR company_record IN 
        SELECT id, name
        FROM companies 
        WHERE username IS NULL OR username = ''
    LOOP
        -- Generate base username from company name
        base_username := LOWER(regexp_replace(company_record.name, '[^a-z0-9]+', '-', 'g'));
        base_username := trim(both '-' from base_username);
        
        -- Ensure it's not empty
        IF base_username = '' OR base_username IS NULL THEN
            base_username := 'company';
        END IF;
        
        final_username := base_username;
        counter := 1;
        
        -- Ensure username is unique
        WHILE EXISTS(SELECT 1 FROM companies WHERE username = final_username AND id != company_record.id) LOOP
            final_username := base_username || counter::TEXT;
            counter := counter + 1;
        END LOOP;
        
        -- Update the company with the unique username
        UPDATE companies 
        SET username = final_username
        WHERE id = company_record.id;
        
        RAISE NOTICE 'Updated company %: % -> @%', company_record.id, company_record.name, final_username;
    END LOOP;
    
    RAISE NOTICE 'Company username generation completed!';
END $$;

-- ================================================
-- STEP 6: Link companies to their CLIENT users
-- ================================================
DO $$
DECLARE
    client_record RECORD;
    company_record RECORD;
BEGIN
    RAISE NOTICE 'Starting to link companies to CLIENT users...';
    
    -- Loop through CLIENT users
    FOR client_record IN 
        SELECT id, "firstName", "lastName"
        FROM users 
        WHERE role = 'CLIENT'
    LOOP
        -- Find matching company by name
        SELECT id INTO company_record
        FROM companies
        WHERE name = CONCAT(client_record."firstName", ' ', client_record."lastName")
           OR name = client_record."firstName"
           OR name = client_record."lastName"
        LIMIT 1;
        
        -- If a matching company was found, update it with the userId
        IF company_record.id IS NOT NULL THEN
            UPDATE companies
            SET "userId" = client_record.id
            WHERE id = company_record.id
              AND ("userId" IS NULL OR "userId" = '');
            
            RAISE NOTICE 'Linked company % to user %', company_record.id, client_record.id;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Company linking completed!';
END $$;

-- ================================================
-- STEP 7: Verify the migration
-- ================================================
SELECT 
    'Users with usernames' as check_type,
    COUNT(*) as count 
FROM users 
WHERE username IS NOT NULL AND username != ''

UNION ALL

SELECT 
    'Companies with usernames' as check_type,
    COUNT(*) as count 
FROM companies 
WHERE username IS NOT NULL AND username != ''

UNION ALL

SELECT 
    'Companies linked to users' as check_type,
    COUNT(*) as count 
FROM companies 
WHERE "userId" IS NOT NULL AND "userId" != ''

UNION ALL

SELECT 
    'CLIENT users' as check_type,
    COUNT(*) as count 
FROM users 
WHERE role = 'CLIENT';

-- ================================================
-- STEP 8: Show sample data
-- ================================================
SELECT 
    'Sample Users' as data_type,
    id,
    "firstName",
    "lastName",
    username,
    role
FROM users
LIMIT 5;

SELECT 
    'Sample Companies' as data_type,
    id,
    name,
    username,
    "userId"
FROM companies
LIMIT 5;