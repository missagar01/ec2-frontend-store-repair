# Environment Variables Setup

## Production Environment Variables

### For Vercel Deployment:

**Vercel Dashboard → Project Settings → Environment Variables:**

```
VITE_API_URL=https://store-repair.sagartmt.com/api
```

Add this for:
- ✅ Production
- ✅ Preview  
- ✅ Development

### For AWS Deployment:

Create `frontend/.env.production` file:

```env
VITE_API_URL=https://store-repair.sagartmt.com/api
```

**Note**: `.env.production` file is in `.gitignore`, so you need to create it manually on the server.

### For Local Development:

Create `frontend/.env` file:

```env
VITE_API_URL=http://localhost:3004/api
```

## Current Configuration:

- **Default API** (in `src/config/api.ts`): `https://store-repair.sagartmt.com/api`
- **Vercel Config** (in `vercel.json`): `https://store-repair.sagartmt.com/api`
- **Backend URL**: `https://store-repair.sagartmt.com/api`

## How It Works:

1. **Vercel**: Uses environment variable from Vercel Dashboard
2. **AWS**: Uses `.env.production` file (created manually)
3. **Local**: Uses `.env` file or defaults to `https://store-repair.sagartmt.com/api`

## AWS Deployment Steps:

```bash
# On AWS server
cd /path/to/frontend

# Create .env.production file
echo "VITE_API_URL=https://store-repair.sagartmt.com/api" > .env.production

# Build with production env
npm run build

# The build will use .env.production automatically
```

