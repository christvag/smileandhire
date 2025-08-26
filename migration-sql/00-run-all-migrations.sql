-- Complete Migration Script for Worky Happy Database
-- Run this in your Supabase SQL Editor or PostgreSQL client

-- ==================================================
-- MIGRATION 1: Create admins table
-- ==================================================

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY DEFAULT ('admin_' || substr(md5(random()::text), 0, 25)),
    "userId" TEXT NOT NULL UNIQUE,
    permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
    department TEXT,
    "accessLevel" INTEGER DEFAULT 1,
    "lastLoginAt" TIMESTAMPTZ,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_admin_user FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admins_userId ON admins("userId");
CREATE INDEX IF NOT EXISTS idx_admins_isActive ON admins("isActive");

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==================================================
-- MIGRATION 2: Update user usernames
-- ==================================================

DO $$
DECLARE
    user_record RECORD;
    base_username TEXT;
    final_username TEXT;
    counter INTEGER;
BEGIN
    RAISE NOTICE 'Starting username update...';
    
    -- Loop through users who don't have usernames
    FOR user_record IN 
        SELECT id, email, "firstName", "lastName", name 
        FROM users 
        WHERE username IS NULL
    LOOP
        -- Generate base username from email
        base_username := LOWER(split_part(user_record.email, '@', 1));
        final_username := base_username;
        counter := 1;
        
        -- Ensure username is unique
        WHILE EXISTS(SELECT 1 FROM users WHERE username = final_username) LOOP
            final_username := base_username || counter::TEXT;
            counter := counter + 1;
        END LOOP;
        
        -- Update the user with the unique username
        UPDATE users 
        SET username = final_username 
        WHERE id = user_record.id;
        
        RAISE NOTICE 'Updated user % -> @%', user_record.email, final_username;
    END LOOP;
    
    RAISE NOTICE 'Username update completed!';
END $$;

-- ==================================================
-- MIGRATION 3: Migrate CLIENT users to companies table
-- ==================================================

DO $$
DECLARE
    client_user RECORD;
    company_name TEXT;
    company_username TEXT;
    final_company_username TEXT;
    counter INTEGER;
    existing_company RECORD;
BEGIN
    RAISE NOTICE 'Starting CLIENT users migration...';
    
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
                SET username = client_user.username,
                    "updatedAt" = NOW()
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
    
    RAISE NOTICE 'CLIENT users migration completed!';
END $$;

-- ==================================================
-- MIGRATION 4: Create admin records
-- ==================================================

DO $$
DECLARE
    admin_user RECORD;
    existing_admin RECORD;
BEGIN
    RAISE NOTICE 'Starting admin records creation...';
    
    -- Loop through ADMIN users
    FOR admin_user IN 
        SELECT id, email, role
        FROM users 
        WHERE role = 'ADMIN'
    LOOP
        -- Check if admin record already exists
        SELECT * INTO existing_admin 
        FROM admins 
        WHERE "userId" = admin_user.id;
        
        IF existing_admin.id IS NOT NULL THEN
            RAISE NOTICE 'Admin record already exists for user %', admin_user.email;
            CONTINUE;
        END IF;
        
        -- Create admin record
        INSERT INTO admins (
            id,
            "userId",
            permissions,
            department,
            "accessLevel",
            "isActive",
            "createdAt",
            "updatedAt"
        ) VALUES (
            'admin_' || substr(md5(random()::text), 0, 25),
            admin_user.id,
            ARRAY['MANAGE_USERS', 'MANAGE_JOBS', 'MANAGE_COMPANIES', 'VIEW_ANALYTICS', 'MANAGE_APPLICATIONS', 'SYSTEM_SETTINGS'],
            'ADMINISTRATION',
            5,
            true,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created admin record for user %', admin_user.email;
    END LOOP;
    
    RAISE NOTICE 'Admin records creation completed!';
END $$;

-- ==================================================
-- VERIFICATION QUERIES
-- ==================================================

-- Check results
SELECT 'Users with usernames' as check_type, COUNT(*) as count FROM users WHERE username IS NOT NULL
UNION ALL
SELECT 'CLIENT users' as check_type, COUNT(*) as count FROM users WHERE role = 'CLIENT'
UNION ALL
SELECT 'Companies created' as check_type, COUNT(*) as count FROM companies
UNION ALL
SELECT 'ADMIN users' as check_type, COUNT(*) as count FROM users WHERE role = 'ADMIN'
UNION ALL
SELECT 'Admin records' as check_type, COUNT(*) as count FROM admins;

-- Show some sample data
SELECT 
    u.email,
    u.role,
    u.username as user_username,
    c.name as company_name,
    c.username as company_username
FROM users u
LEFT JOIN companies c ON u.id = c."userId"
WHERE u.role = 'CLIENT'
LIMIT 5;