/*
    # Create pos_credentials table
    This migration creates the `pos_credentials` table with the specified columns, data types, constraints, and RLS policies. Standard indexes are added for primary keys.
  */
  CREATE TABLE IF NOT EXISTS pos_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  CREATE INDEX pos_credentials_restaurant_id_idx ON pos_credentials (restaurant_id);
  ALTER TABLE pos_credentials ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Restaurant owners and managers can manage POS credentials" ON pos_credentials FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_restaurant_access WHERE user_id = auth.uid() AND restaurant_id = pos_credentials.restaurant_id AND role IN ('owner', 'manager')));
