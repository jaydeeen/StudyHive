import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useStudy } from '../contexts/StudyContext'
import { 
  Calendar,
  Clock,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Filter
} from 'lucide-react'
import { format, formatDistanceToNow, isPast, isToday, isTomorrow, isThisWeek } from 'date-fns'

interface Deadline {
  id: string
  title: string
  description?: string
  courseId?: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  completed: boolean
}

const Deadlines: React.FC = () => {
  const { user } = useAuth()
  const { deadlines, addDeadline, updateDeadline, deleteDeadline } = useStudy()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'overdue'>('all')
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as 'high' | 'medium' | 'low'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingId) {
        await updateDeadline(editingId, {
          title: formData.title,
          description: formData.description,
          dueDate: formData.dueDate,
          priority: formData.priority
        })
        setEditingId(null)
      } else {
        await addDeadline({
          title: formData.title,
          description: formData.description,
          dueDate: formData.dueDate,
          priority: formData.priority,
          completed: false
        })
      }
      
      setFormData({ title: '', description: '', dueDate: '', priority: 'medium' })
      setShowAddForm(false)
    } catch (error) {
      console.error('Failed to save deadline:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deadline?')) return
    
    try {
      await deleteDeadline(id)
    } catch (error) {
      console.error('Failed to delete deadline:', error)
    }
  }

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      await updateDeadline(id, { completed })
    } catch (error) {
      console.error('Failed to update deadline:', error)
    }
  }

  const handleEdit = (deadline: Deadline) => {
    setFormData({
      title: deadline.title,
      description: deadline.description || '',
      dueDate: format(new Date(deadline.dueDate), 'yyyy-MM-dd'),
      priority: deadline.priority
    })
    setEditingId(deadline.id)
    setShowAddForm(true)
  }

  const getFilteredDeadlines = () => {
    const now = new Date()
    
    return deadlines.filter(deadline => {
      const dueDate = new Date(deadline.dueDate)
      
      switch (filter) {
        case 'today':
          return isToday(dueDate)
        case 'week':
          return isThisWeek(dueDate)
        case 'overdue':
          return isPast(dueDate) && !isToday(dueDate)
        default:
          return true
      }
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getDeadlineStatus = (dueDate: string) => {
    const date = new Date(dueDate)
    if (isPast(date) && !isToday(date)) return 'overdue'
    if (isToday(date)) return 'today'
    if (isTomorrow(date)) return 'tomorrow'
    return 'upcoming'
  }

  const filteredDeadlines = getFilteredDeadlines()

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Deadlines</h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">Manage your assignments and due dates</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm lg:text-base"
        >
          <Plus className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
          Add Deadline
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'today', 'week', 'overdue'] as const).map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-3 py-2 lg:px-4 lg:py-2 rounded-lg font-medium transition-colors text-sm lg:text-base ${
              filter === filterOption
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </button>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Deadline' : 'Add New Deadline'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'high' | 'medium' | 'low' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm lg:text-base"
              >
                {editingId ? 'Update' : 'Add'} Deadline
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingId(null)
                  setFormData({ title: '', description: '', dueDate: '', priority: 'medium' })
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm lg:text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Deadlines List */}
      <div className="space-y-4">
        {filteredDeadlines.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-sm lg:text-base">No deadlines found</p>
            <p className="text-sm text-gray-500 mt-1">
              {filter !== 'all' ? 'Try changing the filter or ' : ''}
              Click "Add Deadline" to create your first deadline
            </p>
          </div>
        ) : (
          filteredDeadlines.map((deadline) => {
            const status = getDeadlineStatus(deadline.dueDate)
            const dueDate = new Date(deadline.dueDate)
            
            return (
              <div
                key={deadline.id}
                className={`bg-white rounded-xl shadow-sm p-4 lg:p-6 ${
                  deadline.completed ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <button
                      onClick={() => handleToggleComplete(deadline.id, !deadline.completed)}
                      className={`mt-1 p-1 rounded-full transition-colors flex-shrink-0 ${
                        deadline.completed
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {deadline.completed ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-current" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <h3 className={`text-base lg:text-lg font-semibold text-gray-900 ${
                        deadline.completed ? 'line-through' : ''
                      }`}>
                        {deadline.title}
                      </h3>
                      
                      {deadline.description && (
                        <p className="text-gray-600 mt-1 text-sm lg:text-base">{deadline.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 lg:gap-4 mt-3">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                          {format(dueDate, 'MMM d, yyyy')}
                        </div>

                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                          getPriorityColor(deadline.priority)
                        }`}>
                          {deadline.priority} priority
                        </span>

                        {status === 'overdue' && !deadline.completed && (
                          <span className="inline-flex items-center text-sm text-red-600">
                            <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                            Overdue
                          </span>
                        )}

                        {status === 'today' && !deadline.completed && (
                          <span className="inline-flex items-center text-sm text-orange-600">
                            <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                            Due today
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-3 lg:ml-4">
                    <button
                      onClick={() => handleEdit(deadline)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(deadline.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default Deadlines
