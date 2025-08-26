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

-- Create index for performance
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