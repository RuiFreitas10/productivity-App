-- ============================================
-- SECURE DELETE FUNCTION
-- ============================================

-- Function to securely delete an expense
-- This bypasses RLS policies but enforces its own security check
CREATE OR REPLACE FUNCTION delete_expense(expense_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Only delete if the expense belongs to the authenticated user
  DELETE FROM expenses
  WHERE id = expense_id AND user_id = auth.uid();
  
  -- If no row was deleted, it might mean the ID doesn't exist or belongs to another user
  -- We don't raise an error to avoid leaking existence of other users' data, 
  -- but the client will see 0 rows affected if we returned count (void here simplifies)
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
