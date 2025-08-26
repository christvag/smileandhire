-- Create admin records for ADMIN users
DO $$
DECLARE
    admin_user RECORD;
    existing_admin RECORD;
BEGIN
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
END $$;