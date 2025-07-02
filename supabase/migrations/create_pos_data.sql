/*
    # Create pos_data table
    This migration creates the `pos_data` table with the specified columns, data types, constraints, and RLS policies. Standard indexes are added for primary and foreign keys.
  */
  CREATE TABLE IF NOT EXISTS pos_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    transaction_id TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    amount NUMERIC NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  CREATE INDEX pos_data_restaurant_id_idx ON pos_data (restaurant_id);
  ALTER TABLE pos_data ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Restaurant staff can view POS data" ON pos_data FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM user_restaurant_access WHERE user_id = auth.uid() AND restaurant_id = pos_data.restaurant_id));
  CREATE POLICY "Restaurant owners and managers can manage POS data" ON pos_data FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_restaurant_access WHERE user_id = auth.uid() AND restaurant_id = pos_data.restaurant_id AND role IN ('owner', 'manager')));
