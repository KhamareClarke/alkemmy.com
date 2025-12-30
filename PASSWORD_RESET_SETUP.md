# Password Reset Setup Guide

## Required Configuration

The password reset functionality requires the **Supabase Service Role Key** to update user passwords.

### How to Get Your Service Role Key

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **API**
4. Find the **service_role** key (NOT the anon key)
5. Copy the key

### Add to Environment Variables

Add the service role key to your `.env.local` file:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**⚠️ IMPORTANT SECURITY NOTES:**
- Never commit the service role key to version control
- The service role key has full admin access - keep it secret
- Only use it in server-side code (API routes)
- Add `.env.local` to your `.gitignore` file

### Verify Setup

After adding the key:
1. Restart your Next.js development server
2. Try the password reset flow again
3. The password update should work without errors

### Troubleshooting

If you still see "User not allowed" errors:
1. Verify the service role key is correct (not the anon key)
2. Make sure there are no extra spaces or quotes in `.env.local`
3. Restart the development server after adding the key
4. Check that the key starts with `eyJ` (it's a JWT token)

### Alternative: Use Supabase's Built-in Reset

If you can't use the service role key, you can use Supabase's built-in password reset:
- Users receive a reset link via email
- They click the link and set a new password
- This doesn't require admin API access

However, the custom code-based reset (current implementation) requires the service role key for security and functionality.



