-- Ensure DELETE policy exists for expenses
-- Re-applying policy to fix potential permission issues

DROP POLICY IF EXISTS "Users can delete their own expenses" ON expenses;

CREATE POLICY "Users can delete their own expenses"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);
