-- Create depenses table for expenses tracking
CREATE TABLE IF NOT EXISTS depenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  montant INTEGER NOT NULL,
  categorie TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create benefices table for income tracking
CREATE TABLE IF NOT EXISTS benefices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  montant INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS but allow public access (no auth required for this simple app)
ALTER TABLE depenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefices ENABLE ROW LEVEL SECURITY;

-- Allow all operations for everyone (public app)
CREATE POLICY "Allow all depenses" ON depenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all benefices" ON benefices FOR ALL USING (true) WITH CHECK (true);
