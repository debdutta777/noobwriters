# Supabase Configuration Guide

## Issue Identified

We've identified that the provided Supabase API key is not working properly. The API key is in a valid JWT format and has not expired, but all requests to the Supabase API return "Invalid API key" errors.

## Troubleshooting Results

1. The API key is in a valid JWT format
2. The token contains the correct information (anon role, Supabase issuer)
3. The token has not expired (expires on July 15, 2034)
4. The Supabase API endpoint is reachable
5. All API queries fail with "Invalid API key" error

## Possible Causes

1. The API key has been revoked or reset in the Supabase project
2. The Supabase project may have been deleted or restarted
3. There may be IP restrictions on the API key
4. The project reference ID in the key may no longer match the actual project

## Recommended Steps

1. **Log in to your Supabase dashboard** at https://app.supabase.com
2. **Check your project status** - verify it's active and running
3. **Go to Project Settings > API**
4. **Review the Project API keys** - check if they match what's in your .env file
5. **Generate new API keys if necessary**
6. **Update your environment variables** with the new keys

Update your `.env` file with:

```
# Supabase Config - Replace with new values from dashboard
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-new-anon-key
SUPABASE_SERVICE_ROLE=your-new-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Public environment variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key
```

## Testing the Connection

After updating the keys, you can test the connection using:

```bash
curl http://localhost:3000/api/supabase-test
```

or

```bash
curl http://localhost:3000/api/check-supabase
```

If you're still experiencing issues after updating the keys, please check:

1. **CORS Settings** - Ensure your domains are allowed in the Supabase CORS settings
2. **RLS Policies** - Verify that Row Level Security policies allow the anon role to access the tables
3. **Network Settings** - Check if there are any IP allow/deny lists configured 