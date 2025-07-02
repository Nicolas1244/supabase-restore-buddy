/*
    # Create employees table
    This migration creates the `employees` table with the specified columns, data types, constraints, and RLS policies.  Standard indexes are added for primary and foreign keys.
  */
  CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    street_address TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    phone TEXT NOT NULL,
    contract_type TEXT NOT NULL CHECK (contract_type IN ('CDI', 'CDD', 'Extra')),
    start_date DATE NOT NULL,
    end_date DATE,
    position TEXT NOT NULL,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notification_days INTEGER DEFAULT 30,
    CONSTRAINT end_date_required CHECK ((contract_type = 'CDI') OR (contract_type IN ('CDD', 'Extra') AND end_date IS NOT NULL))
  );
  CREATE INDEX employees_restaurant_id_idx ON employees (restaurant_id);
  ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Restaurant staff can view employees" ON employees FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM user_restaurant_access WHERE user_id = auth.uid() AND restaurant_id = employees.restaurant_id));
  CREATE POLICY "Restaurant managers can manage employees" ON employees FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_restaurant_access WHERE user_id = auth.uid() AND restaurant_id = employees.restaurant_id AND role IN ('owner', 'manager')));
