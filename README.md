# StudyHive - Study Management Application

A modern study management application built with React, TypeScript, and Supabase.

## Features

- **Dashboard**: Overview of study progress, XP, and upcoming deadlines
- **Profile Management**: Update personal information and profile picture
- **Deadlines**: Manage assignments and due dates with priority levels
- **Cheat Sheet Generator**: Create organized study materials
- **Flashcards**: Generate and study with flashcards
- **Study Plan**: Create and track study plans
- **Study Groups**: Collaborate with other students

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory with your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# API Configuration
VITE_API_URL=http://localhost:3001
```

### 3. Supabase Setup
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Update the `.env` file with your credentials
4. Run the database migrations in the `supabase/migrations/` folder

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Database Schema

The application uses the following tables:
- `profiles`: User profile information
- `courses`: Study courses and progress
- `deadlines`: Assignment due dates
- `study_sessions`: Study session tracking

## Authentication

The app uses Supabase Auth for user authentication. Users can:
- Register with email and password
- Login with existing credentials
- Update profile information
- Logout securely

## Study Features

### Dashboard
- View total XP earned
- Track study streaks
- Monitor course progress
- See upcoming deadlines

### Profile
- Update personal information
- Upload profile picture
- Manage academic details

### Deadlines
- Add, edit, and delete deadlines
- Set priority levels
- Mark as completed
- Filter by date ranges

## Technical Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Supabase (Database + Auth)
- **Routing**: React Router DOM
- **State Management**: React Context API

## Development

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

### Project Structure
```
src/
├── components/     # Reusable UI components
├── contexts/       # React context providers
├── lib/           # Utility libraries (Supabase client)
├── pages/         # Page components
└── main.tsx       # Application entry point
```

## Troubleshooting

### Common Issues

1. **Environment Variables Missing**
   - Ensure `.env` file exists with correct Supabase credentials
   - Restart the development server after adding environment variables

2. **Database Connection Issues**
   - Verify Supabase credentials are correct
   - Check if database tables exist
   - Ensure RLS policies are configured

3. **Authentication Problems**
   - Clear browser cache and cookies
   - Check Supabase Auth settings
   - Verify email confirmation if required

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure Supabase project is properly configured
4. Check that all dependencies are installed

## License

This project is for educational purposes. 