/*
    # Create employee_preferences table
    This migration creates the `employee_preferences` table with the specified columns, data types, constraints, and RLS policies. Standard indexes are added for primary and foreign keys.
  */
  CREATE TABLE IF NOT EXISTS employee_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    preference_type TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  CREATE INDEX employee_preferences_employee_id_idx ON employee_preferences (employee_id);
  CREATE INDEX employee_preferences_restaurant_id_idx ON employee_preferences (restaurant_id);
  ALTER TABLE employee_preferences ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Restaurant staff can view employee preferences" ON employee_preferences FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM user_restaurant_access WHERE user_id = auth.uid() AND restaurant_id = employee_preferences.restaurant_id));
  CREATE POLICY "Restaurant managers can manage employee preferences" ON employee_preferences FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_restaurant_access WHERE user_id = auth.uid() AND restaurant_id = employee_preferences.restaurant_id AND role IN ('owner', 'manager')));
