# Wedding Invites - Full Stack Setup Guide

## Project Overview
- **Frontend**: React + Vite + Tailwind CSS (deployed on Vercel)
- **Backend**: Node.js + Express (deployed on Vercel API Routes)
- **Database**: MongoDB Atlas
- **Domain**: weddinginvites.online

---

## ⚙️ Backend Setup

### 1. MongoDB Atlas Configuration

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or log in
3. Create a new cluster
4. Set up database access (username & password)
5. Allow your IP addresses to access (or use 0.0.0.0/0 for development)
6. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/wedding_invites?retryWrites=true&w=majority`

### 2. Backend Environment Variables

Create/Update `backend/.env`:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/wedding_invites?retryWrites=true&w=majority

# Node Environment
NODE_ENV=production

# Server Port
PORT=5000

# JWT Secret - Generate a strong random string
JWT_SECRET=your-secure-jwt-secret-key-change-this

# Email Service (Gmail SMTP)
EMAIL_SERVICE=gmail
EMAIL_FROM=your-email@gmail.com
EMAIL_PASSWORD=your_app_password

# Frontend URL
FRONTEND_URL=https://weddinginvites.online

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
```

**How to get Gmail App Password:**
1. Enable 2-Factor Authentication on your Google Account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Select "Mail" and "Windows Computer"
4. Copy the generated password and use it in EMAIL_PASSWORD

### 3. Local Development

```bash
cd backend
npm install
npm run dev
```

The backend will run on `http://localhost:5000`

---

## 🎨 Frontend Setup

### 1. Install Dependencies

```bash
cd WEDINVITES
npm install
```

### 2. Frontend Environment Variables

Create/Update `WEDINVITES/.env.local`:

```env
# For local development
VITE_API_BASE_URL=http://localhost:5000

# For production
# VITE_API_BASE_URL=https://api.weddinginvites.online
```

### 3. Local Development

```bash
cd WEDINVITES
npm run dev
```

The frontend will run on `http://localhost:3000`

---

## 🚀 Production Deployment

### Domain Setup

1. **weddinginvites.online** → Points to Frontend (Vercel)
2. **api.weddinginvites.online** → Points to Backend (Vercel)

### Update DNS Records

Add the following DNS records to your domain registrar:

```
Type: CNAME
Name: @
Value: cname.vercel.com

Type: CNAME
Name: api
Value: cname.vercel.com (or your backend deployment URL)
```

### Deploy Frontend to Vercel

1. Push code to GitHub repository
2. Go to [Vercel](https://vercel.com)
3. Click "New Project"
4. Select your GitHub repository
5. Configure project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add Environment Variables:
   - `VITE_API_BASE_URL`: `https://api.weddinginvites.online`
7. Click "Deploy"

### Deploy Backend to Vercel

1. Create a separate Vercel project for backend
2. Add Environment Variables in Vercel dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Your JWT secret
   - `FRONTEND_URL`: https://weddinginvites.online
   - `EMAIL_SERVICE`: gmail
   - `EMAIL_FROM`: your email
   - `EMAIL_PASSWORD`: your app password
   - `NODE_ENV`: production
3. Vercel will automatically detect `vercel.json` configuration

### Custom Domain Setup in Vercel

**Frontend:**
1. Go to Project Settings > Domains
2. Add `weddinginvites.online`
3. Follow the DNS configuration

**Backend:**
1. Go to Project Settings > Domains
2. Add `api.weddinginvites.online`
3. Follow the DNS configuration

---

## 📡 API Integration

The frontend uses a custom API client (`src/utils/api.js`) that:
- Automatically handles authentication tokens
- Makes requests to the backend API
- Handles errors and unauthorized access
- Works in both development and production

### Example Usage:

```javascript
import { apiClient } from './utils/api';

// Login
const result = await apiClient.login(email, password);

// Create invitation
const invitation = await apiClient.createInvitation(data);

// Upload file
const uploaded = await apiClient.uploadFile(file);
```

---

## 🔒 Security Checklist

- [ ] Update `JWT_SECRET` with a strong random string
- [ ] Update `EMAIL_PASSWORD` with Gmail app password
- [ ] Set `NODE_ENV=production` in backend
- [ ] Enable HTTPS everywhere
- [ ] Configure CORS for your domain only
- [ ] Keep `.env` files out of version control
- [ ] Use environment variables for all secrets
- [ ] Enable MongoDB authentication
- [ ] Restrict MongoDB access to your IP/Vercel IPs

---

## 📝 File Structure

```
WEDINVITES/
├── .env.local                 # Frontend environment variables
├── vite.config.js            # Vite configuration with API proxy
├── vercel.json               # Frontend deployment config
└── src/
    ├── utils/api.js          # API client for backend communication
    └── ...

backend/
├── .env                      # Backend environment variables
├── vercel.json               # Backend deployment config
├── src/
│   ├── index.js             # Main Express server
│   ├── config/db.js         # MongoDB connection
│   ├── models/              # Database schemas
│   ├── controllers/         # Route handlers
│   ├── routes/              # API routes
│   └── middleware/          # Express middleware
└── ...
```

---

## 🧪 Testing the Connection

### Local Development:

1. Ensure backend is running: `npm run dev` (backend folder)
2. Ensure frontend is running: `npm run dev` (WEDINVITES folder)
3. Open browser: `http://localhost:3000`
4. Check Network tab in DevTools to verify API calls to `http://localhost:5000/api/*`

### Production:

1. Visit `https://weddinginvites.online`
2. Check Network tab in DevTools to verify API calls to `https://api.weddinginvites.online/api/*`

---

## 🐛 Troubleshooting

### CORS Error
- Check `backend/src/index.js` for allowed origins
- Ensure frontend is making requests to correct API URL
- Verify `.env.local` has correct `VITE_API_BASE_URL`

### MongoDB Connection Failed
- Verify connection string in `.env`
- Check IP whitelist in MongoDB Atlas
- Ensure username/password are correct

### 404 on API Endpoints
- Check that backend routes are properly defined
- Verify API URL in frontend matches backend server URL
- Check Vercel logs for backend errors

### Images/Uploads Not Working
- Verify `/uploads` directory exists on backend
- Check file permissions
- For production, consider using cloud storage (S3, Cloudinary)

---

## 📚 Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Express.js Documentation](https://expressjs.com/)
- [React & Vite Documentation](https://vitejs.dev/guide/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## ✅ Next Steps

1. Set up MongoDB Atlas cluster
2. Configure environment variables
3. Test locally (backend + frontend)
4. Deploy frontend to Vercel
5. Deploy backend to Vercel
6. Configure custom domains
7. Test production deployment
8. Set up email notifications
9. Monitor logs and errors
10. Optimize performance

