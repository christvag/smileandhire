-- Update users table to add unique usernames for users who don't have them
DO $$
DECLARE
    user_record RECORD;
    base_username TEXT;
    final_username TEXT;
    counter INTEGER;
BEGIN
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
END $$;