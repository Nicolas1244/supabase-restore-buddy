/*
    # Create restaurants table
    This migration creates the `restaurants` table with the specified columns, data types, and constraints.  A standard index is added for the primary key.  No RLS policies are initially defined.
  */
  CREATE TABLE IF NOT EXISTS restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
