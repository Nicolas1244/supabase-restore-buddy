/*
      # Create financial_data table
      This migration creates the financial_data table with necessary columns for storing financial information, including a unique constraint to prevent duplicate entries.  It also enables row-level security (RLS) and sets up a read policy for authenticated users.
    */
    CREATE TABLE IF NOT EXISTS public.financial_data (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      date DATE NOT NULL,
      original_pennylane_account TEXT NOT NULL,
      category_mapped_to_kpi TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      restaurant_id UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS financial_data_unique_constraint ON public.financial_data (date, original_pennylane_account, restaurant_id);
    ALTER TABLE public.financial_data ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Financial Data Read" ON public.financial_data FOR SELECT TO authenticated USING (auth.uid() = restaurant_id);
