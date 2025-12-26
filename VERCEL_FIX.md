# Vercel 404 Error Fix

## Problem:
Getting 404 error when refreshing pages on Vercel (e.g., `/signin`, `/login`)

## Solution:

### Step 1: Verify Root Directory in Vercel
1. Go to Vercel Dashboard → Your Project → Settings → General
2. **IMPORTANT**: Set **Root Directory** to `frontend`
3. Save changes

### Step 2: Verify vercel.json Location
- `vercel.json` should be in `frontend/` directory ✅
- File is already created and configured correctly

### Step 3: Redeploy
1. Go to Vercel Dashboard → Deployments
2. Click on latest deployment → "Redeploy"
3. Or push a new commit to trigger auto-deploy

### Step 4: Clear Cache (if still not working)
1. Vercel Dashboard → Settings → General
2. Click "Clear Build Cache"
3. Redeploy

## Current Configuration:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This configuration ensures:
- All routes (like `/signin`, `/login`, `/store/dashboard`) redirect to `/index.html`
- React Router handles client-side routing
- No 404 errors on page refresh

## If Still Not Working:

1. **Check Vercel Build Logs**:
   - Go to Deployment → Build Logs
   - Verify `vercel.json` is being read
   - Check for any errors

2. **Verify File Structure**:
   ```
   frontend/
   ├── vercel.json  ✅ (must be here)
   ├── package.json
   ├── vite.config.ts
   └── dist/ (after build)
   ```

3. **Manual Test**:
   - After redeploy, test these URLs:
   - `https://your-app.vercel.app/` (should work)
   - `https://your-app.vercel.app/signin` (should work, no 404)
   - `https://your-app.vercel.app/login` (should work, no 404)

## Alternative: Use Vercel CLI

If dashboard doesn't work, try Vercel CLI:

```bash
cd frontend
npm i -g vercel
vercel --prod
```

This will use the `vercel.json` from the current directory.



