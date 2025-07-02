/*
    # Create time_clock table
    This migration creates the `time_clock` table with the specified columns, data types, constraints, and RLS policies. Standard indexes are added for primary and foreign keys.
  */
  CREATE TABLE IF NOT EXISTS time_clock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    clock_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
    clock_out_time TIMESTAMP WITH TIME ZONE,
    total_hours NUMERIC,
    status TEXT NOT NULL CHECK (status IN ('active', 'completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  CREATE INDEX time_clock_employee_id_idx ON time_clock (employee_id);
  CREATE INDEX time_clock_restaurant_id_idx ON time_clock (restaurant_id);
  ALTER TABLE time_clock ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Employees can view and create their own time clock records" ON time_clock FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM employees WHERE id = time_clock.employee_id AND employees.id = (SELECT id FROM employees WHERE restaurant_id = time_clock.restaurant_id AND id = time_clock.employee_id)));
  CREATE POLICY "Employees can insert their own time clock records" ON time_clock FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM employees WHERE id = time_clock.employee_id AND employees.id = (SELECT id FROM employees WHERE restaurant_id = time_clock.restaurant_id AND id = time_clock.employee_id)));
  CREATE POLICY "Restaurant owners and managers can manage time clock records" ON time_clock FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_restaurant_access WHERE user_id = auth.uid() AND restaurant_id = time_clock.restaurant_id AND role IN ('owner', 'manager')));
