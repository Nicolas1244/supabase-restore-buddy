/*
    # Create time_clock_summary table
    This migration creates the `time_clock_summary` table with the specified columns, data types, constraints, and RLS policies. Standard indexes are added for primary and foreign keys.
  */
  CREATE TABLE IF NOT EXISTS time_clock_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_hours NUMERIC NOT NULL,
    scheduled_hours NUMERIC NOT NULL,
    difference NUMERIC NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('on_time', 'late', 'early', 'overtime', 'undertime')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (employee_id, date)
  );
  CREATE INDEX time_clock_summary_employee_id_idx ON time_clock_summary (employee_id);
  CREATE INDEX time_clock_summary_restaurant_id_idx ON time_clock_summary (restaurant_id);
  ALTER TABLE time_clock_summary ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Employees can view their own time clock summaries" ON time_clock_summary FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM employees WHERE id = time_clock_summary.employee_id AND employees.id = (SELECT id FROM employees WHERE restaurant_id = time_clock_summary.restaurant_id AND id = time_clock_summary.employee_id)));
  CREATE POLICY "Restaurant owners and managers can manage time clock summaries" ON time_clock_summary FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_restaurant_access WHERE user_id = auth.uid() AND restaurant_id = time_clock_summary.restaurant_id AND role IN ('owner', 'manager')));
