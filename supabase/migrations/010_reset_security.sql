-- ============================================
-- RESET TOTAL DE SEGURANÇA (POWER WASH)
-- Executar para corrigir problemas de permissões "teimosos"
-- ============================================

-- 1. Tabela EXPENSES
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete their own expenses" ON expenses;

CREATE POLICY "Users can view their own expenses" ON expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own expenses" ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own expenses" ON expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expenses" ON expenses FOR DELETE USING (auth.uid() = user_id);


-- 2. Tabela RECEIPTS
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own receipts" ON receipts;
DROP POLICY IF EXISTS "Users can insert their own receipts" ON receipts;
DROP POLICY IF EXISTS "Users can update their own receipts" ON receipts;
DROP POLICY IF EXISTS "Users can delete their own receipts" ON receipts;

CREATE POLICY "Users can view their own receipts" ON receipts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own receipts" ON receipts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own receipts" ON receipts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own receipts" ON receipts FOR DELETE USING (auth.uid() = user_id);


-- 3. STORAGE (Bucket 'receipts')
-- Nota: Em storage, a tabela é `storage.objects`

DROP POLICY IF EXISTS "Users can view own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON storage.objects;

-- Criar policies abrangentes
CREATE POLICY "Users can select own receipts" ON storage.objects FOR SELECT USING (bucket_id = 'receipts' AND auth.uid() = owner);
CREATE POLICY "Users can insert own receipts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'receipts' AND auth.uid() = owner);
CREATE POLICY "Users can update own receipts" ON storage.objects FOR UPDATE USING (bucket_id = 'receipts' AND auth.uid() = owner);
CREATE POLICY "Users can delete own receipts" ON storage.objects FOR DELETE USING (bucket_id = 'receipts' AND auth.uid() = owner);

-- 4. FUNÇÃO RPC (Garantir que existe e está atualizada)
CREATE OR REPLACE FUNCTION delete_expense(expense_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM expenses WHERE id = expense_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
