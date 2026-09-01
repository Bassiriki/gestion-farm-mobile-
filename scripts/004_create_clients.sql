-- ============================================================
-- Création de la table des clients
-- ============================================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  telephone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Création de la table de liaison culture_clients
-- ============================================================
CREATE TABLE IF NOT EXISTS culture_clients (
  culture_id UUID REFERENCES cultures(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (culture_id, client_id)
);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE culture_clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all clients" ON clients;
DROP POLICY IF EXISTS "Allow all culture_clients" ON culture_clients;

CREATE POLICY "Allow all clients" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all culture_clients" ON culture_clients FOR ALL USING (true) WITH CHECK (true);
