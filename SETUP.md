# StudyHive Setup Guide

## 🚀 Quick Start (Demo Mode)

The application is now configured to work in **demo mode** without requiring Supabase setup. You can:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Visit the application:**
   - Open `http://localhost:5173` in your browser
   - Register with any email and password
   - Explore the dashboard with sample data

3. **Test the features:**
   - Dashboard shows sample courses and deadlines
   - Profile page allows updating information
   - Deadlines page shows sample assignments
   - All features work with mock data

## 🔧 Full Setup (With Supabase)

To use the application with real data persistence:

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key from Settings > API

### 2. Update Environment Variables
Replace the placeholder values in `.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

### 3. Set Up Database Tables
Run the SQL from `supabase/migrations/create_initial_schema.sql` in your Supabase SQL editor.

### 4. Configure Row Level Security (RLS)
Enable RLS policies for your tables in Supabase.

## 🎯 Current Status

✅ **Working Features:**
- User authentication (mock mode)
- Dashboard with sample data
- Profile management
- Deadlines management
- Course progress tracking
- Study session tracking

⚠️ **Demo Mode:**
- All data is stored in memory (resets on page refresh)
- Sample data is displayed for demonstration
- No real database persistence

## 🔍 Troubleshooting

### Blank Screen After Login
- **Cause**: Missing Supabase credentials
- **Solution**: The app now uses mock authentication and sample data

### Console Warnings
- **Expected**: You'll see warnings about using mock authentication
- **Action**: No action needed for demo mode

### Data Not Persisting
- **Expected**: In demo mode, data resets on page refresh
- **Solution**: Set up Supabase for real data persistence

## 📱 Testing the Application

1. **Register/Login:**
   - Use any email format (e.g., `test@example.com`)
   - Use any password (e.g., `Password123!`)

2. **Dashboard:**
   - View sample courses and progress
   - See upcoming deadlines
   - Check study statistics

3. **Profile:**
   - Update your name and information
   - Upload a profile picture
   - Save changes

4. **Deadlines:**
   - Add new deadlines
   - Edit existing ones
   - Mark as completed
   - Filter by priority

## 🚀 Next Steps

1. **For Demo/Testing**: The app is ready to use as-is
2. **For Production**: Set up Supabase following the full setup guide
3. **For Development**: Continue building features with the current setup

The application should now load properly and show content after login! 