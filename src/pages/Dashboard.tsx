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
  const { courses, totalXP, studyStreak, hoursStudied, goalsCompleted, deadlines, xpRewards } = useStudy()
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

  // Get recent XP rewards (last 5)
  const recentXPRewards = xpRewards.slice(0, 5)

  // Calculate XP earned today
  const today = new Date().toISOString().split('T')[0]
  const xpEarnedToday = xpRewards
    .filter(reward => reward.date === today)
    .reduce((sum, reward) => sum + reward.amount, 0)

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

  const getXPSourceIcon = (source: string) => {
    switch (source) {
      case 'pomodoro':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'study_session':
        return <BookOpen className="h-4 w-4 text-green-500" />
      case 'deadline_completion':
        return <CheckCircle className="h-4 w-4 text-purple-500" />
      case 'streak_bonus':
        return <Trophy className="h-4 w-4 text-yellow-500" />
      default:
        return <Star className="h-4 w-4 text-gray-500" />
    }
  }

  const getXPSourceColor = (source: string) => {
    switch (source) {
      case 'pomodoro':
        return 'bg-blue-50 text-blue-700'
      case 'study_session':
        return 'bg-green-50 text-green-700'
      case 'deadline_completion':
        return 'bg-purple-50 text-purple-700'
      case 'streak_bonus':
        return 'bg-yellow-50 text-yellow-700'
      default:
        return 'bg-gray-50 text-gray-700'
    }
  }

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
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Zap className="h-5 w-5 mr-2 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.name}
              onClick={() => navigate(action.href)}
              className="flex flex-col items-center p-4 rounded-xl hover:shadow-md transition-all duration-200 group"
            >
              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">{action.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Progress */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center mb-4">
            <BookOpen className="h-5 w-5 mr-2 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Course Progress</h2>
          </div>
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: course.color }}
                  />
                  <span className="font-medium text-gray-900">{course.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600">{course.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent XP Rewards */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Recent XP Rewards</h2>
            </div>
            <div className="text-sm text-gray-500">
              +{xpEarnedToday} today
            </div>
          </div>
          <div className="space-y-3">
            {recentXPRewards.length > 0 ? (
              recentXPRewards.map((reward) => (
                <div key={reward.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    {getXPSourceIcon(reward.source)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{reward.description}</p>
                      <p className="text-xs text-gray-500">{format(new Date(reward.date), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getXPSourceColor(reward.source)}`}>
                    +{reward.amount} XP
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No XP rewards yet</p>
                <p className="text-sm">Complete Pomodoro sessions to earn XP!</p>
              </div>
            )}
          </div>
          {recentXPRewards.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button 
                onClick={() => navigate('/study-groups')}
                className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Earn more XP with Pomodoro sessions →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h2>
          </div>
          <button
            onClick={() => navigate('/deadlines')}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View all →
          </button>
        </div>
        <div className="space-y-3">
          {upcomingDeadlines.length > 0 ? (
            upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    deadline.priority === 'high' ? 'bg-red-500' :
                    deadline.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">{deadline.title}</p>
                    <p className="text-sm text-gray-500">{deadline.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(deadline.dueDate), 'MMM d')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(deadline.dueDate), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No upcoming deadlines</p>
              <p className="text-sm">Add deadlines to stay organized</p>
            </div>
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Award className="h-5 w-5 mr-2 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Achievements</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.name}
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                achievement.earned 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                achievement.earned ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <achievement.icon className={`h-5 w-5 ${
                  achievement.earned ? 'text-green-600' : 'text-gray-400'
                }`} />
              </div>
              <div className="flex-1">
                <p className={`font-medium ${
                  achievement.earned ? 'text-green-900' : 'text-gray-700'
                }`}>
                  {achievement.name}
                </p>
                <p className={`text-sm ${
                  achievement.earned ? 'text-green-700' : 'text-gray-500'
                }`}>
                  {achievement.description}
                </p>
              </div>
              {achievement.earned && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
