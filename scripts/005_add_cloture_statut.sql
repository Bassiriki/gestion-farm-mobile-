-- ============================================================
-- Ajouter le statut 'cloture' à la table cultures
-- ============================================================
ALTER TABLE cultures DROP CONSTRAINT IF EXISTS cultures_statut_check;
ALTER TABLE cultures ADD CONSTRAINT cultures_statut_check CHECK (statut IN ('en_cours', 'recolte', 'cloture'));
