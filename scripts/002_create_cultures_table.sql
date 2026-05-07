-- Create cultures table
CREATE TABLE IF NOT EXISTS cultures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  variete TEXT,
  surface TEXT,
  date_plantation DATE,
  date_recolte_prevue DATE,
  statut TEXT NOT NULL DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'recolte')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS but allow public access
ALTER TABLE cultures ENABLE ROW LEVEL SECURITY;

-- Allow all operations for everyone (public app)
CREATE POLICY "Allow all cultures" ON cultures FOR ALL USING (true) WITH CHECK (true);
