-- Friday Agent Dashboard - Supabase Setup
-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/YOUR_PROJECT/sql)

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'bot',
  use_cases TEXT[] DEFAULT '{}',
  trigger_keywords TEXT[] DEFAULT '{}',
  tools JSONB DEFAULT '[]',
  enabled BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  version TEXT DEFAULT '1.0.0',
  author TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_agents table (for per-user agent settings)
CREATE TABLE IF NOT EXISTS user_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, agent_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agents_slug ON agents(slug);
CREATE INDEX IF NOT EXISTS idx_agents_enabled_public ON agents(enabled, is_public);
CREATE INDEX IF NOT EXISTS idx_user_agents_user_id ON user_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_agents_agent_id ON user_agents(agent_id);

-- Enable Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_agents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agents table
-- Anyone can read public agents
CREATE POLICY "Anyone can read public agents" ON agents
  FOR SELECT USING (is_public = true);

-- Anyone can insert agents (for dashboard)
CREATE POLICY "Anyone can insert agents" ON agents
  FOR INSERT WITH CHECK (true);

-- Anyone can update agents (for dashboard)
CREATE POLICY "Anyone can update agents" ON agents
  FOR UPDATE USING (true) WITH CHECK (true);

-- Anyone can delete agents (for dashboard)
CREATE POLICY "Anyone can delete agents" ON agents
  FOR DELETE USING (true);

-- RLS Policies for user_agents table
-- Users can read their own settings
CREATE POLICY "Users can read own agent settings" ON user_agents
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own settings
CREATE POLICY "Users can insert own agent settings" ON user_agents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY "Users can update own agent settings" ON user_agents
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to agents
DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at trigger to user_agents
DROP TRIGGER IF EXISTS update_user_agents_updated_at ON user_agents;
CREATE TRIGGER update_user_agents_updated_at
  BEFORE UPDATE ON user_agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample agents
INSERT INTO agents (name, slug, url, description, icon, use_cases, trigger_keywords, enabled, is_public, version, author)
VALUES
  (
    'Code Suggester',
    'code-suggester',
    'https://friday-code-suggester.vercel.app/api/suggest',
    'Suggests code improvements and fixes based on your current coding context',
    'code',
    ARRAY['Code suggestions', 'Bug fixes', 'Refactoring help', 'Code completion'],
    ARRAY['code', 'function', 'class', 'error', 'bug', 'fix', 'refactor'],
    true,
    true,
    '1.0.0',
    'Friday Team'
  ),
  (
    'Linear Agent',
    'linear-agent',
    'https://friday-linear-agent.vercel.app/api/linear',
    'Manages Linear issues - creates, updates, and tracks your project tasks',
    'listchecks',
    ARRAY['Create issues', 'Update status', 'Track progress', 'Manage sprints'],
    ARRAY['linear', 'issue', 'ticket', 'task', 'sprint', 'backlog'],
    true,
    true,
    '1.0.0',
    'Friday Team'
  ),
  (
    'Calendar Agent',
    'calendar-agent',
    'https://friday-calendar-agent.vercel.app/api/calendar',
    'Helps schedule meetings and manage your calendar events',
    'calendar',
    ARRAY['Schedule meetings', 'Check availability', 'Create events', 'Set reminders'],
    ARRAY['meeting', 'calendar', 'schedule', 'event', 'appointment', 'remind'],
    true,
    true,
    '1.0.0',
    'Friday Team'
  ),
  (
    'GitHub Agent',
    'github-agent',
    'https://friday-github-agent.vercel.app/api/github',
    'Interacts with GitHub - creates PRs, reviews code, manages issues',
    'github',
    ARRAY['Create PRs', 'Review code', 'Manage issues', 'Check CI status'],
    ARRAY['github', 'pr', 'pull request', 'commit', 'branch', 'merge', 'repository'],
    true,
    true,
    '1.0.0',
    'Friday Team'
  )
ON CONFLICT (slug) DO NOTHING;

-- Verify setup
SELECT 'Setup complete! Found ' || COUNT(*) || ' agents.' as status FROM agents;
