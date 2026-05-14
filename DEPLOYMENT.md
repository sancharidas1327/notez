# Notez Public Deployment Guide

This project is a two-service app:

- `notez-frontend`: React/Vite app for users
- `notez-backend`: Express API for auth, notes, uploads, XP, and MongoDB

## Recommended MVP Hosting

- Database: MongoDB Atlas
- Backend API: Render or Railway
- Frontend: Vercel
- File storage: MongoDB GridFS through `STORAGE_DRIVER=gridfs`

GridFS is recommended for the first public version because local server disks are not reliable for uploaded notes on many hosted Node services.

## 1. Create MongoDB Atlas

Create a free/shared Atlas cluster, create a database user, and copy the connection string.

Use a URI like:

```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/notez?retryWrites=true&w=majority
```

Use the `notez` database name in the URI.

## 2. Deploy Backend

Create a new Node/Express web service from the `notez-backend` folder.

Backend settings:

```txt
Root directory: notez-backend
Build command: npm install
Start command: npm start
Health check path: /health
```

Backend environment variables:

```env
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=make_this_a_long_random_secret
CLIENT_URL=https://your-notez-frontend.vercel.app
STORAGE_DRIVER=gridfs
GRIDFS_BUCKET=noteUploads
NODE_ENV=production
```

After deployment, confirm these URLs work:

```txt
https://your-backend-url/health
https://your-backend-url/
```

## 3. Deploy Frontend

Create a Vercel project from the `notez-frontend` folder.

Frontend settings:

```txt
Root directory: notez-frontend
Build command: npm run build
Output directory: dist
```

Frontend environment variables:

```env
VITE_API_URL=https://your-backend-url/api
```

Redeploy the frontend after adding `VITE_API_URL`.

## 4. Update Backend CORS

After Vercel gives you the frontend URL, update the backend `CLIENT_URL` value to exactly that URL.

Example:

```env
CLIENT_URL=https://notez.vercel.app
```

For multiple frontend URLs, separate them with commas:

```env
CLIENT_URL=https://notez.vercel.app,https://notez-git-main-yourname.vercel.app
```

## 5. Smoke Test

Open the frontend URL and test:

- Register a new account
- Login
- Upload a small PDF
- Browse notes
- Open a note
- Download a note
- Check leaderboard

## 6. Before Real Users

Do these before sharing widely:

- Replace the local demo password and any test accounts
- Use a strong `JWT_SECRET`
- Keep `.env` files private
- Add a real privacy policy and terms page
- Add abuse/reporting or admin moderation for uploaded notes
- Decide whether copyrighted notes are allowed
- Add email verification if you want safer public signups
