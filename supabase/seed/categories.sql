-- ============================================
-- SEED DEFAULT CATEGORIES
-- Personal Assistant App
-- ============================================

-- Insert default expense categories (Portuguese)
INSERT INTO categories (name, icon, color, type, is_default) VALUES
  ('Alimentação', '🍔', '#D4A574', 'expense', true),
  ('Transporte', '🚗', '#4A5A6A', 'expense', true),
  ('Casa', '🏠', '#5A6A7A', 'expense', true),
  ('Saúde', '💊', '#6A7A8A', 'expense', true),
  ('Lazer', '🎮', '#3A4A5A', 'expense', true),
  ('Ginásio', '💪', '#6A7A8A', 'expense', true),
  ('Combustível', '⛽', '#4A5A6A', 'expense', true),
  ('Compras', '🛍️', '#5A6A7A', 'expense', true),
  ('Educação', '📚', '#6A7A8A', 'expense', true),
  ('Outros', '📌', '#707070', 'expense', true)
ON CONFLICT DO NOTHING;
