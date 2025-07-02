/*
    # Create manual_data_entries table
    This migration creates the `manual_data_entries` table with the specified columns, data types, constraints, and RLS policies. Standard indexes are added for primary and foreign keys.
  */
  CREATE TABLE IF NOT EXISTS manual_data_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    entry_type TEXT NOT NULL,
    value NUMERIC NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  CREATE INDEX manual_data_entries_restaurant_id_idx ON manual_data_entries (restaurant_id);
  ALTER TABLE manual_data_entries ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Restaurant managers can manage manual data entries" ON manual_data_entries FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_restaurant_access WHERE user_id = auth.uid() AND restaurant_id = manual_data_entries.restaurant_id AND role IN ('owner', 'manager')));
