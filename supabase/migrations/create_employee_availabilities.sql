/*
    # Create employee_availabilities table
    This migration creates the `employee_availabilities` table with the specified columns, data types, constraints, and RLS policies. Standard indexes are added for primary and foreign keys.
  */
  CREATE TABLE IF NOT EXISTS employee_availabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME WITH TIME ZONE NOT NULL,
    end_time TIME WITH TIME ZONE NOT NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  CREATE INDEX employee_availabilities_employee_id_idx ON employee_availabilities (employee_id);
  CREATE INDEX employee_availabilities_restaurant_id_idx ON employee_availabilities (restaurant_id);
  ALTER TABLE employee_availabilities ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Restaurant staff can view employee availabilities" ON employee_availabilities FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM user_restaurant_access WHERE user_id = auth.uid() AND restaurant_id = employee_availabilities.restaurant_id));
  CREATE POLICY "Restaurant managers can manage employee availabilities" ON employee_availabilities FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_restaurant_access WHERE user_id = auth.uid() AND restaurant_id = employee_availabilities.restaurant_id AND role IN ('owner', 'manager')));
