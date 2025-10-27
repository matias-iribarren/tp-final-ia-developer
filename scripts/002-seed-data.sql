-- Seed some initial data for testing

-- Insert a test workspace (you'll need to replace the owner_id with an actual user id after authentication)
-- This is just example data structure
INSERT INTO clockify.workspaces (id, name, owner_id, settings)
VALUES 
  ('workspace-1', 'My Workspace', 'user-placeholder', '{"timeFormat": "24h", "currency": "USD"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Insert example client
INSERT INTO clockify.clients (id, workspace_id, name, email)
VALUES 
  ('client-1', 'workspace-1', 'Acme Corporation', 'contact@acme.com')
ON CONFLICT (id) DO NOTHING;

-- Insert example project
INSERT INTO clockify.projects (id, workspace_id, client_id, name, color, billable)
VALUES 
  ('project-1', 'workspace-1', 'client-1', 'Website Redesign', '#2196F3', true),
  ('project-2', 'workspace-1', NULL, 'Internal Development', '#4CAF50', false)
ON CONFLICT (id) DO NOTHING;

-- Insert example tasks
INSERT INTO clockify.tasks (id, project_id, name, status)
VALUES 
  ('task-1', 'project-1', 'Design mockups', 'active'),
  ('task-2', 'project-1', 'Frontend development', 'active'),
  ('task-3', 'project-1', 'Backend API', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert example tags
INSERT INTO clockify.tags (id, workspace_id, name)
VALUES 
  ('tag-1', 'workspace-1', 'Development'),
  ('tag-2', 'workspace-1', 'Design'),
  ('tag-3', 'workspace-1', 'Meeting')
ON CONFLICT (id) DO NOTHING;
