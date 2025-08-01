import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface Profile {
  id: string
  name: string
  email: string
  avatar_url?: string
  university?: string
  degree?: string
  modules?: string
  profilePicture?: string
}

interface UserWithProfile extends User {
  profile?: Profile; // Merge profile with the User
}

interface AuthContextType {
  user: UserWithProfile | null
  profile: Profile | null
  session: Session | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setUser: React.Dispatch<React.SetStateAction<User | null>>
}

export interface ProfileData {
  name: string;
  email: string;
  university: string;
  degree: string;
  modules: string;
  profilePicture: string;
}

export interface ProfileFormErrors {
  name?: string;
  university?: string;
  degree?: string;
  modules?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserWithProfile | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔐 AuthContext: Initializing authentication...')
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 AuthContext: Initial session:', session)
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 AuthContext: Auth state changed:', event, session?.user?.email)
      
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles') // Ensure this is your profiles table
        .select('*')
        .eq('id', userId)
        .single()
  
      if (error) {
        console.error('Error fetching profile:', error)
        setProfile(null)
      } else {
        // Merge user profile with the user data
        setUser(prev => ({
          ...prev,
          profile: data // Add the profile data here
        }))
      }
    } catch (error) {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const validatePassword = (password: string): { valid: boolean; message?: string } => {
    const requirements = [
      { test: (pwd: string) => pwd.length >= 8, message: 'Password must be at least 8 characters long' },
      { test: (pwd: string) => /[A-Z]/.test(pwd), message: 'Password must contain at least one uppercase letter' },
      { test: (pwd: string) => /[a-z]/.test(pwd), message: 'Password must contain at least one lowercase letter' },
      { test: (pwd: string) => /\d/.test(pwd), message: 'Password must contain at least one number' },
      { test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd), message: 'Password must contain at least one special character' }
    ]

    for (const req of requirements) {
      if (!req.test(password)) {
        return { valid: false, message: req.message }
      }
    }

    return { valid: true }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      console.log('Attempting registration:', { name, email })
      
      // Validate password
      const passwordValidation = validatePassword(password)
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.message)
      }

      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            fullName: name.trim() // Add this to ensure it's saved
          }
        }
      })

      if (error) {
        console.error('Registration error:', error)
        throw new Error(error.message)
      }

      if (!data.user) {
        throw new Error('Registration failed - no user returned')
      }

      console.log('Registration successful:', data.user.email)
      
    } catch (error: any) {
      console.error('Registration error:', error)
      throw new Error(error.message || 'Registration failed')
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error) {
        console.error('Login error:', error)
        throw new Error(error.message)
      }

      if (!data.user) {
        throw new Error('Login failed - no user returned')
      }

      console.log('Login successful:', data.user.email)
      
    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(error.message || 'Login failed')
    }
  }

  const logout = async () => {
    try {
      console.log('Attempting logout')
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Logout error:', error)
        throw new Error(error.message)
      }

      console.log('Logout successful')
      
    } catch (error: any) {
      console.error('Logout error:', error)
      throw new Error(error.message || 'Logout failed')
    }
  }

  const isAuthenticated = !!user
  console.log('🔐 AuthContext: Current state:', { user: !!user, loading, isAuthenticated })

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      isAuthenticated,
      loading,
      login,
      register,
      logout,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}
