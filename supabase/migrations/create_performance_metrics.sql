/*
    # Create performance_metrics table
    This migration creates the `performance_metrics` table with the specified columns, data types, constraints, and RLS policies. Standard indexes are added for primary and foreign keys.
  */
  CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    metric_type TEXT NOT NULL,
    value NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  CREATE INDEX performance_metrics_restaurant_id_idx ON performance_metrics (restaurant_id);
  ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Restaurant staff can view performance metrics" ON performance_metrics FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM user_restaurant_access WHERE user_id = auth.uid() AND restaurant_id = performance_metrics.restaurant_id));
  CREATE POLICY "Restaurant managers can manage performance metrics" ON performance_metrics FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_restaurant_access WHERE user_id = auth.uid() AND restaurant_id = performance_metrics.restaurant_id AND role IN ('owner', 'manager')));
