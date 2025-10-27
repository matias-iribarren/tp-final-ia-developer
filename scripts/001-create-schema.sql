-- Create main schema for Clockify clone
CREATE SCHEMA IF NOT EXISTS clockify;

-- Users table (extends neon_auth.users_sync)
CREATE TABLE IF NOT EXISTS clockify.users (
  id TEXT PRIMARY KEY REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
  default_workspace_id TEXT,
  settings JSONB DEFAULT '{"timeFormat": "12h", "dateFormat": "MM/DD/YYYY", "weekStart": "monday"}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workspaces table
CREATE TABLE IF NOT EXISTS clockify.workspaces (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  owner_id TEXT NOT NULL REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workspace members table
CREATE TABLE IF NOT EXISTS clockify.workspace_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  workspace_id TEXT NOT NULL REFERENCES clockify.workspaces(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  hourly_rate DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Clients table
CREATE TABLE IF NOT EXISTS clockify.clients (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  workspace_id TEXT NOT NULL REFERENCES clockify.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  address TEXT,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS clockify.projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  workspace_id TEXT NOT NULL REFERENCES clockify.workspaces(id) ON DELETE CASCADE,
  client_id TEXT REFERENCES clockify.clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#4CAF50',
  is_public BOOLEAN DEFAULT TRUE,
  billable BOOLEAN DEFAULT TRUE,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS clockify.tasks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id TEXT NOT NULL REFERENCES clockify.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'done')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags table
CREATE TABLE IF NOT EXISTS clockify.tags (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  workspace_id TEXT NOT NULL REFERENCES clockify.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workspace_id, name)
);

-- Time entries table
CREATE TABLE IF NOT EXISTS clockify.time_entries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  workspace_id TEXT NOT NULL REFERENCES clockify.workspaces(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES clockify.projects(id) ON DELETE SET NULL,
  task_id TEXT REFERENCES clockify.tasks(id) ON DELETE SET NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  billable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time entry tags (many-to-many)
CREATE TABLE IF NOT EXISTS clockify.time_entry_tags (
  time_entry_id TEXT NOT NULL REFERENCES clockify.time_entries(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES clockify.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (time_entry_id, tag_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON clockify.workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON clockify.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON clockify.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_workspace ON clockify.clients(workspace_id);
CREATE INDEX IF NOT EXISTS idx_projects_workspace ON clockify.projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_projects_client ON clockify.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON clockify.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tags_workspace ON clockify.tags(workspace_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_workspace ON clockify.time_entries(workspace_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user ON clockify.time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project ON clockify.time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON clockify.time_entries(start_time);
CREATE INDEX IF NOT EXISTS idx_time_entries_end_time ON clockify.time_entries(end_time);

-- Add foreign key constraint for default workspace
ALTER TABLE clockify.users 
  DROP CONSTRAINT IF EXISTS fk_users_default_workspace,
  ADD CONSTRAINT fk_users_default_workspace 
  FOREIGN KEY (default_workspace_id) 
  REFERENCES clockify.workspaces(id) 
  ON DELETE SET NULL;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION clockify.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON clockify.users
  FOR EACH ROW EXECUTE FUNCTION clockify.update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON clockify.workspaces
  FOR EACH ROW EXECUTE FUNCTION clockify.update_updated_at_column();

CREATE TRIGGER update_workspace_members_updated_at BEFORE UPDATE ON clockify.workspace_members
  FOR EACH ROW EXECUTE FUNCTION clockify.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clockify.clients
  FOR EACH ROW EXECUTE FUNCTION clockify.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON clockify.projects
  FOR EACH ROW EXECUTE FUNCTION clockify.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON clockify.tasks
  FOR EACH ROW EXECUTE FUNCTION clockify.update_updated_at_column();

CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON clockify.tags
  FOR EACH ROW EXECUTE FUNCTION clockify.update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON clockify.time_entries
  FOR EACH ROW EXECUTE FUNCTION clockify.update_updated_at_column();
