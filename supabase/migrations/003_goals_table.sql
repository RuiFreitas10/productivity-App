-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('expense_budget', 'habit_target')) NOT NULL,
  target_value NUMERIC(10, 2) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL, -- Optional: for expense budgets linked to a category
  habit_id UUID REFERENCES habits(id) ON DELETE SET NULL,     -- Optional: for habit targets linked to a habit
  month TEXT NOT NULL, -- Format: 'YYYY-MM'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals" ON goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON goals
  FOR DELETE USING (auth.uid() = user_id);
