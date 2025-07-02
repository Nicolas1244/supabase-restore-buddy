/*
    # Create forecasts table
    This migration creates the `forecasts` table with the specified columns, data types, constraints, and RLS policies. Standard indexes are added for primary and foreign keys.
  */
  CREATE TABLE IF NOT EXISTS forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    forecast_type TEXT NOT NULL,
    value NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  CREATE INDEX forecasts_restaurant_id_idx ON forecasts (restaurant_id);
  ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Restaurant staff can view forecasts" ON forecasts FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM user_restaurant_access WHERE user_id = auth.uid() AND restaurant_id = forecasts.restaurant_id));
  CREATE POLICY "Restaurant managers can manage forecasts" ON forecasts FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_restaurant_access WHERE user_id = auth.uid() AND restaurant_id = forecasts.restaurant_id AND role IN ('owner', 'manager')));
