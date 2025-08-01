import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useStudy } from '../contexts/StudyContext'
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award,
  Calendar,
  AlertCircle,
  BookOpen,
  Users,
  Star,
  Trophy,
  Zap,
  ArrowUp,
  CheckCircle,
  Play,
  Plus
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { useNavigate } from 'react-router-dom'

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const { courses, totalXP, studyStreak, hoursStudied, goalsCompleted, deadlines } = useStudy()
  const navigate = useNavigate()

  const stats = [
    { label: 'Total XP', value: totalXP.toLocaleString(), icon: Award, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { label: 'Study Streak', value: `${studyStreak} days`, icon: TrendingUp, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'Hours Studied', value: hoursStudied, icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Goals Completed', value: goalsCompleted.toString(), icon: Target, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  ]

  const upcomingDeadlines = deadlines
    .filter(d => !d.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3)

  // Get user's full name or fallback to email
  const getUserDisplayName = () => {
    return user?.profile?.name || 
           user?.user_metadata?.name || 
           user?.email?.split('@')[0] || 
           'Student'
  }

  // Calculate overall progress
  const overallProgress = courses.length > 0 
    ? Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / courses.length)
    : 0

  // Quick actions
  const quickActions = [
    { name: 'Start Study Session', icon: Play, color: 'bg-blue-500', href: '/study-plan' },
    { name: 'Add Deadline', icon: Plus, color: 'bg-red-500', href: '/deadlines' },
    { name: 'Create Flashcards', icon: BookOpen, color: 'bg-green-500', href: '/flashcards' },
    { name: 'Generate Cheat Sheet', icon: Star, color: 'bg-purple-500', href: '/cheat-sheet' },
  ]

  // Achievements
  const achievements = [
    { name: 'First Steps', description: 'Complete your first study session', earned: totalXP > 0, icon: Star },
    { name: 'Streak Master', description: 'Maintain a 7-day study streak', earned: studyStreak >= 7, icon: Trophy },
    { name: 'Goal Crusher', description: 'Complete 5 deadlines', earned: goalsCompleted >= 5, icon: Target },
    { name: 'Time Warrior', description: 'Study for 10 hours', earned: parseFloat(hoursStudied) >= 10, icon: Clock },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section with Progress Ring */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Welcome back, {getUserDisplayName()}!</h1>
          <p className="text-primary-100 text-sm lg:text-base mb-4">Ready to continue your learning journey?</p>
          
          {/* Overall Progress Ring */}
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeDasharray={`${overallProgress}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-sm">{overallProgress}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-primary-100">Overall Progress</p>
              <p className="text-lg font-semibold">{courses.length} courses active</p>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 opacity-10">
          <div className="w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 lg:p-6">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Zap className="h-5 w-5 mr-2 text-yellow-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
                          <button
                key={action.name}
                onClick={() => navigate(action.href)}
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md transition-all duration-200 group"
              >
                <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">{action.name}</span>
              </button>
          ))}
        </div>
      </div>

              {/* Stats Grid with Enhanced Design */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 lg:p-6 flex flex-col items-start ${stat.bgColor} border-l-4 border-l-${stat.color.split('-')[1]}-500`}>
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`h-6 w-6 lg:h-8 lg:w-8 ${stat.color}`} />
                <span className="text-gray-600 dark:text-gray-300 text-sm lg:text-base font-medium">{stat.label}</span>
              </div>
              <span className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</span>
            </div>
          ))}
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Progress with Enhanced Design */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Course Progress
          </h2>
          <div className="space-y-4">
            {courses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No courses added yet.</p>
                <button 
                  onClick={() => navigate('/study-plan')}
                  className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Add your first course
                </button>
              </div>
            ) : (
              courses.map((course) => (
                <div key={course.id} className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700 text-sm lg:text-base">{course.name}</span>
                    <span className="text-sm font-semibold text-gray-900">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-300 shadow-sm"
                      style={{
                        width: `${course.progress}%`,
                        backgroundColor: course.color,
                      }}
                    />
                  </div>
                  {course.description && (
                    <p className="text-xs text-gray-500 mt-1">{course.description}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Upcoming Deadlines
          </h2>
          <div className="space-y-3">
            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-4">
                <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No upcoming deadlines</p>
              </div>
            ) : (
              upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <AlertCircle
                    className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                      deadline.priority === 'high'
                        ? 'text-red-500'
                        : deadline.priority === 'medium'
                        ? 'text-yellow-500'
                        : 'text-green-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium text-gray-900 text-sm lg:text-base break-words">{deadline.title}</p>
                    <p className="text-sm text-gray-500 break-words">{deadline.description || 'No description'}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Due {formatDistanceToNow(new Date(deadline.dueDate), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
          Achievements
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((achievement) => (
            <div key={achievement.name} className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              achievement.earned 
                ? 'border-green-200 bg-green-50' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  achievement.earned ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  {achievement.earned ? (
                    <CheckCircle className="h-4 w-4 text-white" />
                  ) : (
                    <achievement.icon className="h-4 w-4 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium text-sm ${
                    achievement.earned ? 'text-green-800' : 'text-gray-600'
                  }`}>
                    {achievement.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Study Group Activity
        </h2>
        <div className="space-y-4 pl-2 sm:pl-4 md:pl-6">
          <div className="flex items-center space-x-3 lg:space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
              alt="User"
              className="h-8 w-8 lg:h-10 lg:w-10 rounded-full flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 text-sm lg:text-base break-words">
                <span className="font-medium">Sarah Chen</span> completed a study session in Advanced Mathematics
              </p>
              <p className="text-sm text-gray-500">2 hours ago</p>
            </div>
            <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              +120 XP
            </div>
          </div>
          <div className="flex items-center space-x-3 lg:space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
              alt="User"
              className="h-8 w-8 lg:h-10 lg:w-10 rounded-full flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 text-sm lg:text-base break-words">
                <span className="font-medium">Mike Johnson</span> shared flashcards for Physics Chapter 5
              </p>
              <p className="text-sm text-gray-500">4 hours ago</p>
            </div>
            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              Shared
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
