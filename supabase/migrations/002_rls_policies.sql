-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Personal Assistant App
-- ============================================

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES
-- ============================================

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- CATEGORIES
-- ============================================

CREATE POLICY "Users can view their own categories and defaults"
  ON categories FOR SELECT
  USING (auth.uid() = user_id OR is_default = true);

CREATE POLICY "Users can insert their own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own non-default categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id AND is_default = false);

-- ============================================
-- RECEIPTS
-- ============================================

CREATE POLICY "Users can view their own receipts"
  ON receipts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own receipts"
  ON receipts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own receipts"
  ON receipts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- EXPENSES
-- ============================================

CREATE POLICY "Users can view their own expenses"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- EVENTS
-- ============================================

CREATE POLICY "Users can manage their own events"
  ON events FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TASKS
-- ============================================

CREATE POLICY "Users can manage their own tasks"
  ON tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- REMINDERS
-- ============================================

CREATE POLICY "Users can manage their own reminders"
  ON reminders FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- GOALS
-- ============================================

CREATE POLICY "Users can manage their own goals"
  ON goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- GOAL_TASKS
-- ============================================

CREATE POLICY "Users can manage their own goal tasks"
  ON goal_tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM goals
      WHERE goals.id = goal_tasks.goal_id
      AND goals.user_id = auth.uid()
    )
  );

-- ============================================
-- HABITS
-- ============================================

CREATE POLICY "Users can manage their own habits"
  ON habits FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- HABIT_LOGS
-- ============================================

CREATE POLICY "Users can manage their own habit logs"
  ON habit_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- AI_INSIGHTS
-- ============================================

CREATE POLICY "Users can view their own insights"
  ON ai_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert insights"
  ON ai_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights"
  ON ai_insights FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- AI_CHAT_HISTORY
-- ============================================

CREATE POLICY "Users can manage their own chat history"
  ON ai_chat_history FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
