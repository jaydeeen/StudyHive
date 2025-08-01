import React, { useState } from 'react'
import { Calendar, Clock, Target, Plus, X, CheckCircle, Circle, AlertCircle } from 'lucide-react'
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns'
import { useStudy } from '../contexts/StudyContext'

interface StudyTask {
  id: string
  title: string
  course: string
  duration: number
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  date: Date
}

const StudyPlan: React.FC = () => {
  const { courses, deadlines } = useStudy()
  const [tasks, setTasks] = useState<StudyTask[]>([
    {
      id: '1',
      title: 'Review Chapter 5 - Calculus',
      course: 'Advanced Mathematics',
      duration: 60,
      completed: false,
      priority: 'high',
      date: new Date()
    },
    {
      id: '2',
      title: 'Practice Programming Problems',
      course: 'Computer Science',
      duration: 90,
      completed: false,
      priority: 'medium',
      date: new Date()
    },
    {
      id: '3',
      title: 'Read Physics Textbook',
      course: 'Physics',
      duration: 45,
      completed: true,
      priority: 'low',
      date: addDays(new Date(), 1)
    }
  ])

  const [showAddTask, setShowAddTask] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    course: '',
    duration: 30,
    priority: 'medium' as 'high' | 'medium' | 'low'
  })

  const handleAddTask = () => {
    if (newTask.title && newTask.course) {
      setTasks([
        ...tasks,
        {
          id: Date.now().toString(),
          ...newTask,
          completed: false,
          date: new Date()
        }
      ])
      setNewTask({ title: '', course: '', duration: 30, priority: 'medium' })
      setShowAddTask(false)
    }
  }

  const toggleTaskComplete = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfWeek(new Date()), i)
    return {
      date,
      dayName: format(date, 'EEE'),
      dayNumber: format(date, 'd'),
      isToday: format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    }
  })

  const todayTasks = tasks.filter(task => 
    format(task.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  )

  const totalStudyTime = todayTasks.reduce((sum, task) => sum + task.duration, 0)
  const completedTime = todayTasks
    .filter(task => task.completed)
    .reduce((sum, task) => sum + task.duration, 0)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <Calendar className="h-6 w-6 mr-2 text-primary-600" />
          AI-Powered Study Plan
        </h1>
        <p className="text-gray-600">Your personalized study schedule based on your courses and deadlines</p>
      </div>

      {/* Week Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">This Week</h2>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div
              key={day.date.toISOString()}
              className={`text-center p-3 rounded-lg ${
                day.isToday
                  ? 'bg-primary-100 text-primary-700 font-semibold'
                  : 'bg-gray-50 text-gray-600'
              }`}
            >
              <p className="text-sm">{day.dayName}</p>
              <p className="text-lg mt-1">{day.dayNumber}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Today's Study Tasks</h2>
            <button
              onClick={() => setShowAddTask(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </button>
          </div>

          {showAddTask && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={newTask.course}
                    onChange={(e) => setNewTask({ ...newTask, course: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.name}>{course.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Duration (min)"
                    value={newTask.duration}
                    onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) || 0 })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <label className="text-sm text-gray-600">Priority:</label>
                  {(['low', 'medium', 'high'] as const).map((priority) => (
                    <button
                      key={priority}
                      onClick={() => setNewTask({ ...newTask, priority })}
                      className={`px-3 py-1 rounded-full text-sm capitalize ${
                        newTask.priority === priority
                          ? priority === 'high' ? 'bg-red-100 text-red-700' :
                            priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddTask}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddTask(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center p-4 rounded-lg border ${
                  task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
                }`}
              >
                <button
                  onClick={() => toggleTaskComplete(task.id)}
                  className="mr-4"
                >
                  {task.completed ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-400" />
                  )}
                </button>
                <div className="flex-1">
                  <p className={`font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <span>{task.course}</span>
                    <span className="mx-2">•</span>
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{task.duration} min</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  task.priority === 'high' ? 'bg-red-100 text-red-700' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {task.priority}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Study Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Study Time</span>
                  <span className="text-sm font-medium text-gray-900">
                    {completedTime} / {totalStudyTime} min
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${totalStudyTime > 0 ? (completedTime / totalStudyTime) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Tasks Completed</span>
                  <span className="text-sm font-medium text-gray-900">
                    {todayTasks.filter(t => t.completed).length} / {todayTasks.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${todayTasks.length > 0 ? (todayTasks.filter(t => t.completed).length / todayTasks.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Target className="h-5 w-5 text-primary-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Focus on Mathematics</p>
                  <p className="text-xs text-gray-500 mt-1">You have an exam in 3 days</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Schedule break time</p>
                  <p className="text-xs text-gray-500 mt-1">Optimal study sessions are 45-90 minutes</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Best study time: 2-4 PM</p>
                  <p className="text-xs text-gray-500 mt-1">Based on your past performance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudyPlan
