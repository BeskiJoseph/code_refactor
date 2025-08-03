# Deployment Guide for CodeRefactor AI

## ✅ Frontend (Vercel) - DEPLOYED!
**Live URL:** https://h-3epfv4i8a-beskijosephs-projects.vercel.app

### Frontend Deployment Steps:
1. ✅ Installed Vercel CLI: `npm install -g vercel`
2. ✅ Deployed to Vercel: `vercel --prod`
3. ✅ Frontend is now live!

## 🔄 Backend (Railway) - Next Steps

### Option 1: Railway (Recommended for Resume)
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Set environment variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   GROQ_API_KEY=your_groq_api_key
   PORT=5000
   NODE_ENV=production
   ```
6. Deploy!

### Option 2: Render (Alternative)
1. Go to [Render.com](https://render.com)
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repo
5. Set build command: `npm install`
6. Set start command: `npm start`
7. Add environment variables
8. Deploy!

### Option 3: Heroku (Alternative)
1. Go to [Heroku.com](https://heroku.com)
2. Create new app
3. Connect GitHub repository
4. Set environment variables
5. Deploy!

## 🔧 Environment Variables Needed

### MongoDB
- Get free MongoDB Atlas cluster: https://www.mongodb.com/atlas
- Copy connection string
- Add to environment variables as `MONGODB_URI`

### Groq API Key
- Sign up at https://console.groq.com
- Get API key
- Add to environment variables as `GROQ_API_KEY`

## 🔗 Update Frontend API URL

Once backend is deployed, update the frontend environment variable:

1. Go to Vercel dashboard
2. Find your project
3. Go to Settings → Environment Variables
4. Add: `VITE_API_URL=https://your-backend-url.com/api`

## 📝 Resume Ready!

Once both frontend and backend are deployed:

**Frontend:** https://h-3epfv4i8a-beskijosephs-projects.vercel.app
**Backend:** https://your-backend-url.com

### Features to Showcase:
- ✅ AI-powered code refactoring
- ✅ Real-time code generation animation
- ✅ File upload (single files + ZIP archives)
- ✅ Code comparison (before/after)
- ✅ Multiple language support (JS, React, TS, Node.js)
- ✅ Download refactored code
- ✅ Modern React + TypeScript stack
- ✅ Clean, professional UI

### Tech Stack:
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Node.js, Express, MongoDB, Groq AI API
- **Deployment:** Vercel (Frontend), Railway/Render (Backend)
- **AI:** Groq LLaMA 3 for code refactoring

Perfect for your resume! 🚀 