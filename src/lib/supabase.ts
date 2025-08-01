import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if we have valid Supabase credentials
const hasValidCredentials = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_url_here' && 
  supabaseAnonKey !== 'your_supabase_anon_key_here'

if (!hasValidCredentials) {
  console.warn('⚠️ Supabase credentials not configured. Using mock authentication.')
  console.warn('Please set up your Supabase credentials in the .env file')
}

// Create a mock Supabase client for development
const createMockSupabaseClient = () => {
  let mockUser = null
  let mockSession = null
  let authStateCallbacks: Array<(event: string, session: any) => void> = []

  const triggerAuthStateChange = (event: string, session: any) => {
    authStateCallbacks.forEach(callback => callback(event, session))
  }

  return {
    auth: {
      getSession: async () => ({ data: { session: mockSession }, error: null }),
      signUp: async ({ email, password, options }: any) => {
        mockUser = { 
          id: 'mock-user-id', 
          email, 
          user_metadata: options?.data || {},
          created_at: new Date().toISOString()
        }
        mockSession = { user: mockUser }
        triggerAuthStateChange('SIGNED_IN', mockSession)
        return { data: { user: mockUser }, error: null }
      },
      signInWithPassword: async ({ email, password }: any) => {
        mockUser = { 
          id: 'mock-user-id', 
          email, 
          user_metadata: { name: email.split('@')[0] },
          created_at: new Date().toISOString()
        }
        mockSession = { user: mockUser }
        triggerAuthStateChange('SIGNED_IN', mockSession)
        return { data: { user: mockUser }, error: null }
      },
      signOut: async () => {
        mockUser = null
        mockSession = null
        triggerAuthStateChange('SIGNED_OUT', null)
        return { error: null }
      },
      updateUser: async (updates: any) => {
        if (mockUser) {
          mockUser.user_metadata = { ...mockUser.user_metadata, ...updates.data }
        }
        return { data: { user: mockUser }, error: null }
      },
      onAuthStateChange: (callback: any) => {
        authStateCallbacks.push(callback)
        // Trigger initial state
        callback('INITIAL_SESSION', mockSession)
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                const index = authStateCallbacks.indexOf(callback)
                if (index > -1) {
                  authStateCallbacks.splice(index, 1)
                }
              }
            }
          }
        }
      }
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null })
        })
      }),
      upsert: async (data: any) => ({ data, error: null }),
      insert: async (data: any) => ({ data, error: null }),
      update: async (data: any) => ({ data, error: null }),
      delete: async () => ({ error: null })
    })
  }
}

export const supabase = hasValidCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : createMockSupabaseClient()

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          avatar_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          avatar_url?: string
          updated_at?: string
        }
      }
      deadlines: {
        Row: {
          id: string
          user_id: string
          title: string
          description?: string
          course_id?: string
          due_date: string
          priority: 'low' | 'medium' | 'high'
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string
          course_id?: string
          due_date: string
          priority?: 'low' | 'medium' | 'high'
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string
          course_id?: string
          due_date?: string
          priority?: 'low' | 'medium' | 'high'
          completed?: boolean
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          description?: string
          progress: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          description?: string
          progress?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          color?: string
          description?: string
          progress?: number
          updated_at?: string
        }
      }
      study_sessions: {
        Row: {
          id: string
          user_id: string
          course_id: string
          duration: number
          notes?: string
          xp_earned: number
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          duration: number
          notes?: string
          xp_earned?: number
          date?: string
          created_at?: string
        }
        Update: {
          course_id?: string
          duration?: number
          notes?: string
          xp_earned?: number
          date?: string
        }
      }
    }
  }
}
