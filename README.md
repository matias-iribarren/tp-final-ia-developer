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
   - The Neon integration should already be connected
   - Verify environment variables in the Vercel dashboard

4. Run the database migrations:
   - The SQL scripts in the `scripts` folder will set up your database schema
   - Execute them in order: `001-create-schema.sql`, then `002-seed-data.sql`

5. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Creating an Admin User

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

## License

This project is for educational purposes.

## Support

For issues or questions, please open an issue in the repository.
