-- FIX: Drop conflicting old tables
DROP TABLE IF EXISTS goal_tasks;
DROP TABLE IF EXISTS goals CASCADE;

-- Re-Create goals table with correct schema
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('expense_budget', 'habit_target')) NOT NULL,
  target_value NUMERIC(10, 2) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL, 
  habit_id UUID REFERENCES habits(id) ON DELETE SET NULL, 
  month TEXT NOT NULL, -- Format: 'YYYY-MM'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Re-Enable RLS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals" ON goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON goals FOR DELETE USING (auth.uid() = user_id);
