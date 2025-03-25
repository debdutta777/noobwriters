# Supabase Environment Setup Guide

## Environment Variables

To use Supabase in your Next.js project, you need to set up the following environment variables in your `.env.local` file:

```bash
# Public variables (can be exposed to the browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key

# Private variables (server-side only, never expose to the browser)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Getting Your Supabase Keys

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Project Settings > API
4. Under "Project API keys" you'll find:
   - `Project URL` → Use this for `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → Use this for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → Use this for `SUPABASE_SERVICE_ROLE_KEY`

## Important Notes

- The `NEXT_PUBLIC_` prefix is required for variables that need to be accessible in browser/client code
- The `SUPABASE_SERVICE_ROLE_KEY` should NEVER be exposed to the client-side code
- After updating your `.env` file, restart your development server

## Testing Your Configuration

After setting up your environment variables, you can test if they're correctly configured by visiting:

- `/admin/supabase-config` - UI for testing and updating Supabase configuration
- `/api/check-env` - API endpoint that checks if environment variables are set
- `/api/test-supabase` - API endpoint that tests Supabase connection

## Troubleshooting

If you're getting "Invalid API key" errors:

1. Verify that you've copied the keys correctly from Supabase dashboard
2. Ensure no extra spaces or characters were added
3. Check that you're using the correct keys for client-side vs server-side operations
4. Restart your Next.js development server after updating environment variables

## Legacy Variables

If you're updating from an older setup, you may have been using these variables:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_public_anon_key
SUPABASE_SERVICE_ROLE=your_service_role_key
```

These should be updated to the new format as they may be deprecated in the future. 