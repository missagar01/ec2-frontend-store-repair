# Vercel Environment Variables Setup

## Required Environment Variable:

### For Production, Preview, and Development:

**Variable Name:**
```
VITE_API_URL
```

**Variable Value:**
```
https://store-repair.sagartmt.com/api
```

## How to Add in Vercel Dashboard:

### Step-by-Step:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: `repair-and-store-frontend-aws`

2. **Navigate to Settings**
   - Click on your project
   - Go to **Settings** tab (left sidebar)
   - Click on **Environment Variables** (under "General")

3. **Add Environment Variable**
   - Click **"Add New"** button
   - **Key**: `VITE_API_URL`
   - **Value**: `https://store-repair.sagartmt.com/api`
   - **Environment**: Select all three:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Click **"Save"**

4. **Redeploy**
   - Go to **Deployments** tab
   - Click on latest deployment
   - Click **"Redeploy"** button
   - Or push a new commit to trigger auto-deploy

## Current Configuration:

### Already Set in `vercel.json`:
```json
{
  "env": {
    "VITE_API_URL": "https://store-repair.sagartmt.com/api"
  }
}
```

**Note**: Even though it's in `vercel.json`, it's better to also set it in Vercel Dashboard for:
- Better visibility
- Easy updates without code changes
- Environment-specific overrides

## Environment Variables Summary:

| Variable Name | Value | Required For |
|--------------|-------|--------------|
| `VITE_API_URL` | `https://store-repair.sagartmt.com/api` | All environments |

## Verification:

After adding the environment variable:

1. **Check Build Logs**
   - Go to Deployment → Build Logs
   - Verify `VITE_API_URL` is being used

2. **Test Application**
   - Visit your Vercel URL
   - Open browser console (F12)
   - Check network requests
   - API calls should go to: `https://store-repair.sagartmt.com/api`

3. **Check Runtime**
   - The app should connect to backend successfully
   - Login should work
   - No CORS errors

## Troubleshooting:

### If API calls fail:
1. Verify environment variable is set correctly
2. Check for typos in URL
3. Ensure backend CORS allows Vercel domain
4. Check browser console for errors

### If variable not working:
1. Redeploy after adding variable
2. Clear Vercel build cache
3. Verify variable name is exactly: `VITE_API_URL` (case-sensitive)

## Quick Copy-Paste:

**Key:**
```
VITE_API_URL
```

**Value:**
```
https://store-repair.sagartmt.com/api
```

**Environments:** Production, Preview, Development (all three)




