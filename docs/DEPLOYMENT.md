# Deployment Guide

This guide explains how to deploy the Clockify clone to Vercel.

## Prerequisites

- A Vercel account
- A Neon PostgreSQL database (already connected)
- Git repository (optional, for continuous deployment)

## Deployment Steps

### Option 1: Deploy from v0

1. Click the "Publish" button in the top right of the v0 interface
2. Follow the prompts to deploy to Vercel
3. Your app will be deployed automatically

### Option 2: Deploy via Vercel CLI

1. Install the Vercel CLI:
\`\`\`bash
npm install -g vercel
\`\`\`

2. Login to Vercel:
\`\`\`bash
vercel login
\`\`\`

3. Deploy:
\`\`\`bash
vercel
\`\`\`

4. Follow the prompts to configure your deployment

### Option 3: Deploy via GitHub

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure the project settings
6. Click "Deploy"

## Environment Variables

The following environment variables are automatically configured through the Neon integration:

- `NEON_NEON_DATABASE_URL` - PostgreSQL connection string
- `NEON_POSTGRES_URL` - Alternative connection string
- Additional Neon-specific variables

No additional environment variables are required for basic functionality.

## Database Setup

After deployment, you need to run the database migrations:

1. The SQL scripts in the `scripts` folder need to be executed
2. You can run these directly from the v0 interface
3. Or connect to your Neon database and run them manually

Execute in order:
1. `scripts/001-create-schema.sql` - Creates tables and schema
2. `scripts/002-seed-data.sql` - Seeds initial data (optional)

## Post-Deployment

After deployment:

1. Visit your deployed URL
2. Create an account at `/signup`
3. Start tracking time!

## Custom Domain

To add a custom domain:

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## Monitoring

Vercel provides built-in monitoring:

- View logs in the Vercel dashboard
- Monitor performance metrics
- Set up error tracking

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Verify the Neon integration is properly connected
2. Check that environment variables are set correctly
3. Ensure the database schema has been created

### Authentication Issues

If authentication isn't working:

1. Check that cookies are enabled
2. Verify the session middleware is running
3. Check browser console for errors

### Build Failures

If the build fails:

1. Check the build logs in Vercel
2. Verify all dependencies are installed
3. Ensure TypeScript types are correct

## Scaling

The application is designed to scale automatically with Vercel:

- Serverless functions scale automatically
- Neon database scales with your usage
- Static assets are served via CDN

## Security Considerations

For production deployment:

1. Replace SHA-256 password hashing with bcrypt
2. Enable HTTPS (automatic with Vercel)
3. Set up proper CORS policies
4. Implement rate limiting
5. Add CSRF protection
6. Enable database connection pooling

## Backup and Recovery

To backup your data:

1. Use Neon's built-in backup features
2. Export data regularly via CSV
3. Consider implementing automated backups

## Updates and Maintenance

To update your deployment:

1. Make changes in v0 or your local environment
2. Push to GitHub (if using Git deployment)
3. Or redeploy via Vercel CLI
4. Vercel will automatically build and deploy

## Support

For deployment issues:

- Check Vercel documentation
- Review Neon documentation
- Open a support ticket at vercel.com/help
