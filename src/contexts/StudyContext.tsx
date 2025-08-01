import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

interface Course {
  id: string
  name: string
  color: string
  description?: string
  progress: number
}

interface Deadline {
  id: string
  title: string
  description?: string
  courseId?: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
}

interface StudySession {
  id: string
  courseId: string
  duration: number
  notes?: string
  xpEarned: number
  date: string
}

interface StudyData {
  totalXP: number
  studyStreak: number
  hoursStudied: string
  goalsCompleted: number
}

interface StudyContextType {
  courses: Course[]
  totalXP: number
  studyStreak: number
  hoursStudied: string
  goalsCompleted: number
  fetchStudyData: () => void
  deadlines: Deadline[]
  studySessions: StudySession[]
  studyData: StudyData
  loading: boolean
  
  // Course methods
  addCourse: (course: Omit<Course, 'id'>) => Promise<void>
  updateCourse: (id: string, updates: Partial<Course>) => Promise<void>
  deleteCourse: (id: string) => Promise<void>
  
  // Deadline methods
  addDeadline: (deadline: Omit<Deadline, 'id'>) => Promise<void>
  updateDeadline: (id: string, updates: Partial<Deadline>) => Promise<void>
  deleteDeadline: (id: string) => Promise<void>
  
  // Study session methods
  addStudySession: (session: Omit<StudySession, 'id' | 'xpEarned'>) => Promise<void>
  
  // Data refresh
  refreshData: () => Promise<void>
}

const StudyContext = createContext<StudyContextType | undefined>(undefined)

export const useStudy = () => {
  const context = useContext(StudyContext)
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider')
  }
  return context
}

// Sample data for demonstration
const sampleCourses: Course[] = [
  { id: '1', name: 'Mathematics', color: '#3b82f6', description: 'Advanced calculus and algebra', progress: 75 },
  { id: '2', name: 'Physics', color: '#ef4444', description: 'Classical mechanics and thermodynamics', progress: 45 },
  { id: '3', name: 'Computer Science', color: '#10b981', description: 'Data structures and algorithms', progress: 90 }
]

const sampleDeadlines: Deadline[] = [
  { id: '1', title: 'Calculus Final Exam', description: 'Comprehensive exam covering all topics from calculus I and II', dueDate: '2025-12-15', priority: 'high', completed: false },
  { id: '2', title: 'Physics Lab Report', description: 'Write up the pendulum experiment with detailed analysis', dueDate: '2025-11-20', priority: 'medium', completed: false },
  { id: '3', title: 'Programming Assignment', description: 'Implement binary search tree with full documentation', dueDate: '2024-12-05', priority: 'low', completed: true }
]

const sampleStudySessions: StudySession[] = [
  { id: '1', courseId: '1', duration: 120, notes: 'Reviewed derivatives and integrals', xpEarned: 120, date: '2024-01-08' },
  { id: '2', courseId: '2', duration: 90, notes: 'Studied Newton\'s laws', xpEarned: 90, date: '2024-01-07' },
  { id: '3', courseId: '3', duration: 180, notes: 'Implemented sorting algorithms', xpEarned: 180, date: '2024-01-06' }
]

export const StudyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [studySessions, setStudySessions] = useState<StudySession[]>([])
  const [studyData, setStudyData] = useState<StudyData>({
    totalXP: 0,
    studyStreak: 0,
    hoursStudied: '0.0',
    goalsCompleted: 0
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user) {
      refreshData()
    } else {
      // Clear data when not authenticated
      setCourses([])
      setDeadlines([])
      setStudySessions([])
      setStudyData({
        totalXP: 0,
        studyStreak: 0,
        hoursStudied: '0.0',
        goalsCompleted: 0
      })
    }
  }, [isAuthenticated, user])

  const refreshData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // For demo purposes, use sample data if no real data is available
      const hasRealData = await checkForRealData()
      
      if (hasRealData) {
        await Promise.all([
          fetchCourses(),
          fetchDeadlines(),
          fetchStudySessions()
        ])
      } else {
        // Use sample data for demonstration
        setCourses(sampleCourses)
        setDeadlines(sampleDeadlines)
        setStudySessions(sampleStudySessions)
        calculateStudyData(sampleStudySessions)
      }
    } catch (error) {
      console.error('Error refreshing data:', error)
      // Fallback to sample data
      setCourses(sampleCourses)
      setDeadlines(sampleDeadlines)
      setStudySessions(sampleStudySessions)
      calculateStudyData(sampleStudySessions)
    } finally {
      setLoading(false)
    }
  }

  const checkForRealData = async () => {
    try {
      // For now, always return false to use sample data
      // This will be replaced when real Supabase is configured
      return false
    } catch {
      return false
    }
  }

  const fetchCourses = async () => {
    try {
      // For demo purposes, always use sample data
      setCourses(sampleCourses)
    } catch (error) {
      console.error('Error fetching courses:', error)
      setCourses(sampleCourses)
    }
  }

  const fetchDeadlines = async () => {
    try {
      // For demo purposes, always use sample data
      setDeadlines(sampleDeadlines)
    } catch (error) {
      console.error('Error fetching deadlines:', error)
      setDeadlines(sampleDeadlines)
    }
  }

  const fetchStudySessions = async () => {
    try {
      // For demo purposes, always use sample data
      setStudySessions(sampleStudySessions)
      calculateStudyData(sampleStudySessions)
    } catch (error) {
      console.error('Error fetching study sessions:', error)
      setStudySessions(sampleStudySessions)
      calculateStudyData(sampleStudySessions)
    }
  }

  const calculateStudyData = (sessions: StudySession[]) => {
    const totalXP = sessions.reduce((sum, session) => sum + session.xpEarned, 0)
    const totalMinutes = sessions.reduce((sum, session) => sum + session.duration, 0)
    const hoursStudied = (totalMinutes / 60).toFixed(1)
    
    // Calculate study streak (simplified - days with sessions in last 7 days)
    const today = new Date()
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const recentSessions = sessions.filter(s => new Date(s.date) > lastWeek)
    const studyStreak = Math.min(recentSessions.length, 7)
    
    const goalsCompleted = deadlines.filter(d => d.completed).length

    setStudyData({
      totalXP,
      studyStreak,
      hoursStudied,
      goalsCompleted
    })
  }

  // Course methods
  const addCourse = async (course: Omit<Course, 'id'>) => {
    try {
      const newCourse = {
        id: Date.now().toString(),
        name: course.name,
        color: course.color,
        description: course.description || '',
        progress: course.progress
      }

      setCourses(prev => [newCourse, ...prev])
    } catch (error) {
      console.error('Error adding course:', error)
      throw error
    }
  }

  const updateCourse = async (id: string, updates: Partial<Course>) => {
    try {
      setCourses(prev => prev.map(course => 
        course.id === id ? { ...course, ...updates } : course
      ))
    } catch (error) {
      console.error('Error updating course:', error)
      throw error
    }
  }

  const deleteCourse = async (id: string) => {
    try {
      setCourses(prev => prev.filter(course => course.id !== id))
    } catch (error) {
      console.error('Error deleting course:', error)
      throw error
    }
  }

  // Deadline methods
  const addDeadline = async (deadline: Omit<Deadline, 'id'>) => {
    try {
      const newDeadline = {
        id: Date.now().toString(),
        title: deadline.title,
        description: deadline.description || '',
        courseId: deadline.courseId || undefined,
        dueDate: deadline.dueDate,
        priority: deadline.priority,
        completed: deadline.completed
      }

      setDeadlines(prev => [...prev, newDeadline].sort((a, b) => 
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      ))
    } catch (error) {
      console.error('Error adding deadline:', error)
      throw error
    }
  }

  const updateDeadline = async (id: string, updates: Partial<Deadline>) => {
    try {
      setDeadlines(prev => prev.map(deadline => 
        deadline.id === id ? { ...deadline, ...updates } : deadline
      ).sort((a, b) => 
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      ))
    } catch (error) {
      console.error('Error updating deadline:', error)
      throw error
    }
  }

  const deleteDeadline = async (id: string) => {
    try {
      setDeadlines(prev => prev.filter(deadline => deadline.id !== id))
    } catch (error) {
      console.error('Error deleting deadline:', error)
      throw error
    }
  }

  // Study session methods
  const addStudySession = async (session: Omit<StudySession, 'id' | 'xpEarned'>) => {
    try {
      const xpEarned = Math.floor(session.duration / 10) * 10 // 10 XP per 10 minutes

      const newSession = {
        id: Date.now().toString(),
        courseId: session.courseId,
        duration: session.duration,
        notes: session.notes || '',
        xpEarned: xpEarned,
        date: session.date
      }

      setStudySessions(prev => [newSession, ...prev])
      calculateStudyData([newSession, ...studySessions])
    } catch (error) {
      console.error('Error adding study session:', error)
      throw error
    }
  }

  return (
    <StudyContext.Provider value={{
      courses,
      deadlines,
      studySessions,
      studyData,
      loading,
      addCourse,
      updateCourse,
      deleteCourse,
      addDeadline,
      updateDeadline,
      deleteDeadline,
      addStudySession,
      refreshData,
      totalXP: studyData.totalXP,
      studyStreak: studyData.studyStreak,
      hoursStudied: studyData.hoursStudied,
      goalsCompleted: studyData.goalsCompleted,
      fetchStudyData: refreshData
    }}>
      {children}
    </StudyContext.Provider>
  )
}
