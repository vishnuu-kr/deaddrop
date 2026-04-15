# DeadDrop Quick Start Guide

## ðŸš€ Get Started in 5 Minutes

### Step 1: Set Up Supabase (2 minutes)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for your database to be provisioned
4. Go to **Database** â†’ **Extensions** and enable **postgis**
5. Go to **SQL Editor** and paste the contents of `database/schema.sql`
6. Click **Run** to execute the schema

### Step 2: Get Your API Keys (1 minute)

1. In your Supabase project, go to **Project Settings** â†’ **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key**
   - **service_role key** (keep this secret!)

### Step 3: Configure Environment Variables (1 minute)

1. Copy the example env file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and update:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   NEXT_PUBLIC_ENCRYPTION_KEY=generate-a-random-256-bit-key-here
   ```

3. Generate an encryption key:
   - Visit [random.org](https://www.random.org/passwords/) or use any password generator
   - Create a random 32-character string
   - Example: `abc123def456ghi789jkl012mno345pq`

### Step 4: Install & Run (1 minute)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 5: Test It Out

1. **Create an account:**
   - Click "Sign up"
   - Enter email, password, and username

2. **Create a test drop:**
   - Click "Create Drop"
   - Enter your own username as the recipient
   - Write a test message
   - Set radius to 100m
   - Click on the map to select location
   - Click "Create Drop"

3. **Unlock the message:**
   - Go to "Messages"
   - Click on your message
   - If you're within 100m of the selected location, click "Unlock Message"

## ðŸ“± Deploy to Production

### Option 1: Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel settings
5. Deploy!

### Option 2: Railway

1. Push to GitHub
2. Connect to [railway.app](https://railway.app)
3. Add environment variables
4. Deploy

### Option 3: Self-Host

```bash
# Build for production
npm run build

# Start production server
npm start
```

Deploy on any Node.js hosting service.

## ðŸ”§ Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists and has valid values
- Restart the dev server after changing `.env.local`

### "Geolocation is not supported"
- Make sure you're using HTTPS (or localhost for development)
- Enable location permissions in your browser

### "Failed to fetch messages"
- Check your Supabase project is active
- Verify the schema was applied correctly
- Check browser console for detailed errors

### "You are not within the required radius"
- This is expected! You need to be physically near the selected location
- For testing, create messages very close to your current location
- Increase the unlock radius for easier testing

## ðŸ“š Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the `database/schema.sql` for database structure
- Check out the API routes in `app/api/`
- Customize the UI in the component files

## ðŸ’¡ Tips

- **Testing:** Use your own username to send messages to yourself for easy testing
- **Location:** The app works best outdoors with real GPS. Desktop browsers use less accurate IP-based location
- **PWA:** On mobile, "Add to Home Screen" for a native app experience
- **Security:** Change the encryption key before deploying to production!

## ðŸ†˜ Need Help?

- Check browser console (F12) for errors
- Review the Supabase logs in your dashboard
- Open an issue on the GitHub repository

---

Happy dropping! ðŸ“ðŸ”
