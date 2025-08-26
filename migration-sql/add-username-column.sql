-- Add username column to companies table and update existing records
-- Run this in Supabase SQL Editor

-- Step 1: Add username column to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS username TEXT;

-- Step 2: Create index for username
CREATE INDEX IF NOT EXISTS idx_companies_username ON companies(username);

-- Step 3: Add unique constraint for username
ALTER TABLE companies ADD CONSTRAINT companies_username_unique UNIQUE (username);

-- Step 4: Update existing companies with generated usernames
DO $$
DECLARE
    company_record RECORD;
    base_username TEXT;
    final_username TEXT;
    counter INTEGER;
BEGIN
    RAISE NOTICE 'Starting company username generation...';
    
    -- Loop through companies without usernames
    FOR company_record IN 
        SELECT id, name, "userId"
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
        SET username = final_username,
            "updatedAt" = NOW()
        WHERE id = company_record.id;
        
        RAISE NOTICE 'Updated company %: % -> @%', company_record.id, company_record.name, final_username;
    END LOOP;
    
    RAISE NOTICE 'Company username generation completed!';
END $$;

-- Step 5: Verify results
SELECT 
    'Companies with usernames' as status,
    COUNT(*) as count 
FROM companies 
WHERE username IS NOT NULL AND username != '';