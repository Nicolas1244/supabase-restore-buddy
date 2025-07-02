/*
    # Create user_restaurant_access table
    This migration creates the `user_restaurant_access` table with the specified columns, data types, constraints, and RLS policies. Standard indexes are added for primary keys.
  */
  CREATE TABLE IF NOT EXISTS user_restaurant_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ALTER TABLE user_restaurant_access ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users can read their own access" ON user_restaurant_access FOR SELECT TO authenticated USING (user_id = auth.uid());
  CREATE POLICY "Owners can manage access" ON user_restaurant_access FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_restaurant_access WHERE user_id = auth.uid() AND role = 'owner'));
