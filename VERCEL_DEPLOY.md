# Vercel Deployment Guide

## Frontend Deployment on Vercel

### Prerequisites:
1. Vercel account (sign up at https://vercel.com)
2. GitHub repository with frontend code
3. Backend API URL (e.g., `https://store-repair.sagartmt.com/api`)

### Deployment Steps:

#### 1. Connect Repository to Vercel:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Select the `frontend` folder as the root directory (or configure it)

#### 2. Configure Build Settings:
- **Framework Preset**: Vite
- **Root Directory**: `frontend` (if deploying from monorepo)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

#### 3. Environment Variables:
Add these in Vercel Dashboard → Project Settings → Environment Variables:

```
VITE_API_URL=https://store-repair.sagartmt.com/api
```

**Important**: 
- Backend URL: `https://store-repair.sagartmt.com/api`
- Make sure to add this in Vercel Dashboard → Settings → Environment Variables
- Add for all environments: Production, Preview, and Development

#### 4. Deploy:
- Click "Deploy"
- Vercel will automatically build and deploy your frontend
- You'll get a URL like: `https://your-project.vercel.app`

### Configuration Files:

#### `vercel.json`:
- Handles SPA routing (all routes → `/index.html`)
- Sets up caching for static assets
- Auto-detects Vite framework

### Post-Deployment:

1. **Update CORS on Backend**:
   - Make sure your backend allows requests from your Vercel domain
   - Add your Vercel URL to CORS allowed origins

2. **Test the Application**:
   - Visit your Vercel URL
   - Test login functionality
   - Verify API calls are working

### Custom Domain (Optional):

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `VITE_API_URL` if needed

### Environment Variables for Different Environments:

- **Production**: `VITE_API_URL=https://store-repair.sagartmt.com/api`
- **Preview**: Can use same or different backend URL
- **Development**: `VITE_API_URL=http://localhost:3004`

### Troubleshooting:

1. **Build Fails**:
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`
   - Check for TypeScript errors

2. **API Calls Fail**:
   - Verify `VITE_API_URL` is set correctly
   - Check CORS settings on backend
   - Check browser console for errors

3. **Routing Issues**:
   - Ensure `vercel.json` has correct rewrites
   - Check that all routes redirect to `/index.html`

### Notes:

- Vercel automatically handles HTTPS
- Vercel provides CDN for static assets
- Automatic deployments on git push (if connected)
- Preview deployments for pull requests

