-- ============================================================
-- ÉTAPE 1 : Créer la table cultures (si pas encore fait)
-- ============================================================
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

-- ============================================================
-- ÉTAPE 2 : Créer la table recettes (si pas encore fait)
-- ============================================================
CREATE TABLE IF NOT EXISTS recettes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  montant INTEGER NOT NULL,
  description TEXT,
  quantite NUMERIC,
  unite TEXT,
  culture_id UUID REFERENCES cultures(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- ÉTAPE 3 : Ajouter culture_id à depenses (si pas encore fait)
-- ============================================================
ALTER TABLE depenses
  ADD COLUMN IF NOT EXISTS culture_id UUID REFERENCES cultures(id) ON DELETE SET NULL;

-- ============================================================
-- ÉTAPE 4 : Activer RLS avec accès public
-- ============================================================
ALTER TABLE cultures ENABLE ROW LEVEL SECURITY;
ALTER TABLE recettes ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent déjà
DROP POLICY IF EXISTS "Allow all cultures" ON cultures;
DROP POLICY IF EXISTS "Allow all recettes" ON recettes;
DROP POLICY IF EXISTS "Allow all depenses" ON depenses;

-- Recréer les policies
CREATE POLICY "Allow all cultures" ON cultures FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all recettes" ON recettes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all depenses" ON depenses FOR ALL USING (true) WITH CHECK (true);
