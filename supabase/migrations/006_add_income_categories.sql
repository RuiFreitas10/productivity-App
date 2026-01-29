-- ============================================
-- ADD DEFAULT INCOME CATEGORIES
-- ============================================

-- Insert default income categories (Portuguese)
INSERT INTO categories (name, icon, color, type, is_default) VALUES
  ('Salário', '💰', '#4CAF50', 'income', true),
  ('Freelance', '💼', '#66BB6A', 'income', true),
  ('Investimentos', '📈', '#81C784', 'income', true),
  ('Bónus', '🎁', '#A5D6A7', 'income', true),
  ('Vendas', '🛒', '#C8E6C9', 'income', true),
  ('Aluguer', '🏡', '#66BB6A', 'income', true),
  ('Prémios', '🏆', '#81C784', 'income', true),
  ('Outros', '💵', '#4CAF50', 'income', true)
ON CONFLICT DO NOTHING;
