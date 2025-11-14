# Clockify Clone

A full-featured time tracking application built with Next.js, TypeScript, and PostgreSQL (Neon). This is a clone of Clockify with core time tracking, project management, and reporting features.

## Features

### Authentication
- Email/password authentication
- Secure session management
- Protected routes with middleware

### Time Tracking
- Real-time timer with start/stop functionality
- Manual time entry creation
- Time entry editing and deletion
- Project and task association
- Billable/non-billable tracking

### Project Management
- Create and manage projects
- Assign projects to clients
- Color-coded project organization
- Archive and delete projects

### Client Management
- Create and manage clients
- Associate clients with projects
- Store client contact information

### Tags
- Create custom tags
- Categorize time entries with tags

### Reporting & Analytics
- Date range filtering
- Summary statistics (total, billable, non-billable time)
- Project breakdown with percentages
- CSV export functionality

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Database**: PostgreSQL (Neon)
- **Authentication**: Custom session-based auth
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Neon PostgreSQL database

### Installation

1. Clone the repository or download the code

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up your environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Neon connection string:
     \`\`\`
     NEON_POSTGRES_URL="your_neon_connection_string_here"
     \`\`\`

4. Run the database migrations:
   \`\`\`bash
   npm run create-schema
   \`\`\`
   This will create all necessary tables and structures in your database.

5. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Creating an Admin User

**⚠️ Important**: Make sure you've run `npm run create-schema` first!

To create an admin user for testing, run:

\`\`\`bash
npm run create-admin
\`\`\`

This will create an admin user with the following credentials:
- **Email**: admin@clockify.com
- **Password**: admin123

⚠️ **Important**: Change the password after your first login for security purposes.

## Database Schema

The application uses the following main tables:

- `clockify.users` - User profiles and settings
- `clockify.workspaces` - Multi-tenant workspaces
- `clockify.workspace_members` - Workspace membership and roles
- `clockify.projects` - Projects for organizing time entries
- `clockify.clients` - Client information
- `clockify.tasks` - Tasks within projects
- `clockify.tags` - Tags for categorizing time entries
- `clockify.time_entries` - Time tracking records

## Project Structure

\`\`\`
├── app/
│   ├── actions/          # Server actions for data mutations
│   ├── dashboard/        # Main dashboard page
│   ├── projects/         # Projects management page
│   ├── clients/          # Clients management page
│   ├── tags/             # Tags management page
│   ├── reports/          # Reports and analytics page
│   ├── login/            # Login page
│   └── signup/           # Signup page
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   └── ...              # Custom components
├── lib/
│   ├── db.ts            # Database client and queries
│   ├── auth.ts          # Authentication logic
│   ├── session.ts       # Session management
│   ├── reports.ts       # Reporting logic
│   └── types.ts         # TypeScript types
├── scripts/             # Database migration scripts
└── middleware.ts        # Route protection middleware
\`\`\`

## Usage

### Creating an Account

1. Navigate to `/signup`
2. Enter your name, email, and password
3. A default workspace will be created automatically

### Tracking Time

1. Go to the dashboard
2. Enter a description and select a project (optional)
3. Click the play button to start the timer
4. Click the stop button to end the timer

### Manual Time Entry

1. Click "Add Time Entry" on the dashboard
2. Fill in the details including start and end times
3. Click "Create Entry"

### Managing Projects

1. Navigate to the Projects page
2. Click "New Project" to create a project
3. Assign a client, choose a color, and set billable status

### Viewing Reports

1. Navigate to the Reports page
2. Select a date range
3. View summary statistics and project breakdown
4. Export to CSV for detailed analysis

## API Routes

The application uses Next.js Server Actions for API functionality:

### Authentication
- `signUp(formData)` - Create a new user account
- `signIn(formData)` - Sign in with email/password
- `signOut()` - Sign out current user

### Time Entries
- `startTimer(formData)` - Start a new timer
- `stopTimer(timeEntryId)` - Stop an active timer
- `createManualEntry(formData)` - Create a manual time entry
- `updateTimeEntry(timeEntryId, formData)` - Update a time entry
- `deleteTimeEntry(timeEntryId)` - Delete a time entry

### Projects
- `createProject(formData)` - Create a new project
- `updateProject(projectId, formData)` - Update a project
- `archiveProject(projectId)` - Archive a project
- `deleteProject(projectId)` - Delete a project

### Clients
- `createClient(formData)` - Create a new client
- `updateClient(clientId, formData)` - Update a client
- `deleteClient(clientId)` - Delete a client

### Tags
- `createTag(formData)` - Create a new tag
- `deleteTag(tagId)` - Delete a tag

### Reports
- `getReport(workspaceId, startDate, endDate)` - Generate a report
- `exportToCSV(workspaceId, startDate, endDate)` - Export report to CSV

### Automation with n8n

A new API has been added to facilitate time logging from external systems through [n8n](https://n8n.io/), a workflow automation tool.

#### Time Entries API

- **Endpoint**: `POST /api/time-entries`
  - **Description**: Allows creating one or more time entries in a single request.
  - **Authentication**: Requires an API Key in the `Authorization` header.
    ```
    Authorization: Bearer <N8N_API_KEY>
    ```
  - **Payload**: An array of `TimeEntry` objects, where each object represents a time entry.
    ```json
    [
      {
        "workspace_id": "...",
        "user_id": "...",
        "project_id": "...",
        "description": "...",
        "start_time": "YYYY-MM-DDTHH:mm:ssZ",
        "end_time": "YYYY-MM-DDTHH:mm:ssZ",
        "billable": true,
        "tag_ids": ["..."]
      }
    ]
    ```

- **Endpoint**: `GET /api/time-entries`
  - **Description**: Retrieves projects, clients, and tags associated with a workspace to facilitate selection in n8n.
  - **Query Params**:
    - `workspace_id` (required): The workspace ID.

## Architecture

For a detailed description of the current and future architecture of the solution, see the [ARCHITECTURE.md](./ARCHITECTURE.md) document.

## Security

- Passwords are hashed before storage (using SHA-256 for demo; use bcrypt in production)
- Session tokens are stored in HTTP-only cookies
- Middleware protects all authenticated routes
- All database queries use parameterized queries to prevent SQL injection

## Future Enhancements

Potential features to add:

- OAuth authentication (Google, GitHub)
- Team collaboration features
- Hourly rate tracking and invoicing
- Calendar view for time entries
- Mobile app
- Real-time collaboration
- Advanced reporting with charts
- Time entry templates
- Integrations with other tools

### Next Steps: Automated Integrations

The n8n integration is just the first step. The architecture is designed to expand and connect with other development and project management tools. The next steps include:

- **GitLab/GitHub**:
  - **Objective**: Automatically log time spent on commits and merge requests.
  - **Flow**:
    1. A developer makes a commit with a message that follows a specific format (e.g., `feat: TICKET-123 - description of work`).
    2. A webhook notifies an application endpoint.
    3. The system extracts the ticket ID, time (if included), and author, and creates a time entry associated with the correct project.

- **Jira/Trello**:
  - **Objective**: Synchronize time logged in tickets or cards with the application.
  - **Flow**:
    1. A user logs hours on a Jira task.
    2. A webhook sends the data to the API.
    3. The application creates or updates the time entry, associating it with the corresponding project and task.

- **Google Drive/Calendar**:
  - **Objective**: Create draft time entries from events in Google Calendar or activity in Google Drive documents.
  - **Flow**:
    1. A new event is detected in the calendar with a specific tag (e.g., `#work`).
    2. The Google API notifies the application.
    3. A draft time entry is created for the user to confirm.

## License

This project is for educational purposes.

## Support

For issues or questions, please open an issue in the repository.
