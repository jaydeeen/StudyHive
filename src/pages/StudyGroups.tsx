import React, { useState } from 'react'
import { Users, Clock, Trophy, MessageSquare, Video, Plus, Play, Pause, RotateCw, Trash2, Star, Zap } from 'lucide-react'
import { format } from 'date-fns'
import { useStudy } from '../contexts/StudyContext'

interface StudyRoom {
  id: string
  name: string
  subject: string
  participants: number
  maxParticipants: number
  isActive: boolean
  host: string
  xpReward: number
}

interface Message {
  id: string
  user: string
  avatar: string
  message: string
  timestamp: Date
}

interface Timer {
  room_id: string
  time_remaining: number
  is_running: boolean
}

interface XPNotification {
  id: string
  amount: number
  message: string
  type: 'success' | 'bonus'
}

const StudyGroups: React.FC = () => {
  const { awardXPForPomodoro, totalXP, xpRewards } = useStudy()
  const [activeRoom, setActiveRoom] = useState<StudyRoom | null>(null)
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60) // 25 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [originalTime, setOriginalTime] = useState(25 * 60) // Track the original timer duration
  const [isTimerCompleted, setIsTimerCompleted] = useState(false) // Prevent double XP awards
  const [xpNotifications, setXpNotifications] = useState<XPNotification[]>([])
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      user: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      message: 'Hey everyone! Ready for the study session?',
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: '2',
      user: 'Mike Johnson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      message: 'Just finished the flashcards for Chapter 5!',
      timestamp: new Date(Date.now() - 3 * 60 * 1000)
    }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [showCreateRoomForm, setShowCreateRoomForm] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomSubject, setNewRoomSubject] = useState('')
  const [newRoomMaxParticipants, setNewRoomMaxParticipants] = useState(10)

  const [studyRooms, setStudyRooms] = useState<StudyRoom[]>([
    {
      id: '1',
      name: 'Calculus Study Group',
      subject: 'Advanced Mathematics',
      participants: 5,
      maxParticipants: 8,
      isActive: true,
      host: 'Sarah Chen',
      xpReward: 50
    },
    {
      id: '2',
      name: 'CS Algorithm Practice',
      subject: 'Computer Science',
      participants: 3,
      maxParticipants: 6,
      isActive: true,
      host: 'Mike Johnson',
      xpReward: 75
    },
    {
      id: '3',
      name: 'Physics Problem Solving',
      subject: 'Physics',
      participants: 4,
      maxParticipants: 10,
      isActive: false,
      host: 'Emily Davis',
      xpReward: 60
    }
  ])

  // Calculate XP earned today
  const today = new Date().toISOString().split('T')[0]
  const xpEarnedToday = xpRewards
    .filter(reward => reward.date === today)
    .reduce((sum, reward) => sum + reward.amount, 0)

  // Handle timer completion and XP award
  const handleTimerComplete = async () => {
    if (originalTime > 0 && !isTimerCompleted) {
      setIsTimerCompleted(true) // Prevent double execution
      
      try {
        const xpEarned = await awardXPForPomodoro(originalTime, activeRoom?.name)
        
        // Show XP notification
        const notification: XPNotification = {
          id: Date.now().toString(),
          amount: xpEarned,
          message: `🎉 +${xpEarned} XP earned for completing your Pomodoro session!`,
          type: 'success'
        }
        
        setXpNotifications(prev => [notification, ...prev])
        
        // Auto-remove notification after 5 seconds
        setTimeout(() => {
          setXpNotifications(prev => prev.filter(n => n.id !== notification.id))
        }, 5000)
        
        // Show success message
        alert(`🎉 Great job! You earned ${xpEarned} XP for completing your ${Math.floor(originalTime / 60)}-minute Pomodoro session!`)
        
      } catch (error) {
        console.error('Error awarding XP:', error)
        alert('Error awarding XP. Please try again.')
        setIsTimerCompleted(false) // Reset on error
      }
    }
  }

  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime((time) => {
          if (time <= 1) {
            setIsTimerRunning(false)
            handleTimerComplete()
            return 0
          }
          return time - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, pomodoroTime])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          user: 'You',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
          message: newMessage,
          timestamp: new Date()
        }
      ])
      setNewMessage('')
    }
  }

  const handleCreateRoom = () => {
    if (newRoomName && newRoomSubject && newRoomMaxParticipants > 0) {
      const newRoom: StudyRoom = {
        id: Date.now().toString(),
        name: newRoomName,
        subject: newRoomSubject,
        participants: 1,
        maxParticipants: newRoomMaxParticipants,
        isActive: true,
        host: 'You',
        xpReward: 50
      }
      setStudyRooms([...studyRooms, newRoom])
      setShowCreateRoomForm(false)
      setNewRoomName('')
      setNewRoomSubject('')
      setNewRoomMaxParticipants(10)
    }
  }

  const handleDeleteRoom = (roomId: string) => {
    const updatedRooms = studyRooms.filter(room => room.id !== roomId)
    setStudyRooms(updatedRooms)
  }

  const handleJoinRoom = (roomId: string) => {
    if (activeRoom) {
      handleLeaveRoom()
    }

    setStudyRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.id === roomId && room.participants < room.maxParticipants
          ? { ...room, participants: room.participants + 1 }
          : room
      )
    )
    const roomToJoin = studyRooms.find(room => room.id === roomId)
    if (roomToJoin) {
      setActiveRoom(roomToJoin)
    }
  }

  const handleLeaveRoom = () => {
    if (activeRoom && activeRoom.participants > 0) {
      setStudyRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.id === activeRoom.id && room.participants > 0
            ? { ...room, participants: room.participants - 1 }
            : room
        )
      )
      setActiveRoom(null)
    }
  }

  const handleTimerStart = () => {
    setIsTimerRunning(true)
    setIsTimerCompleted(false) // Reset completion state when starting
  }

  const handleTimerPause = () => {
    setIsTimerRunning(false)
  }

  const handleTimerReset = () => {
    setPomodoroTime(originalTime)
    setIsTimerRunning(false)
    setIsTimerCompleted(false) // Reset completion state when resetting
  }

  const handleTimerDurationChange = (duration: number) => {
    setPomodoroTime(duration)
    setOriginalTime(duration)
    setIsTimerRunning(false)
    setIsTimerCompleted(false) // Reset completion state when changing duration
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* XP Notifications */}
      {xpNotifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {xpNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-in slide-in-from-right duration-300`}
            >
              <Star className="h-5 w-5" />
              <div>
                <div className="font-semibold">+{notification.amount} XP</div>
                <div className="text-sm opacity-90">{notification.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <Users className="h-6 w-6 mr-2 text-primary-600" />
          Collaborative Study Groups
        </h1>
        <p className="text-gray-600">Join study rooms with Pomodoro timers, earn XP, and collaborate with peers</p>
        
        {/* XP Display */}
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-yellow-50 px-4 py-2 rounded-lg">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <span className="font-semibold text-yellow-800">{totalXP.toLocaleString()} XP</span>
          </div>
          <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
            <Zap className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-blue-800">Earn XP with Pomodoro sessions!</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Study Rooms List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Active Study Rooms</h2>
              <button
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                onClick={() => setShowCreateRoomForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Room
              </button>
            </div>

            <div className="space-y-4">
              {studyRooms.map((room) => (
                <div
                  key={room.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    activeRoom?.id === room.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveRoom(room)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{room.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{room.subject}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{room.participants}/{room.maxParticipants} participants</span>
                        <span className="mx-2">•</span>
                        <span>Host: {room.host}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        room.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {room.isActive ? 'Active' : 'Scheduled'}
                      </div>
                      <div className="flex items-center mt-2 text-sm text-yellow-600">
                        <Trophy className="h-4 w-4 mr-1" />
                        <span>{room.xpReward} XP</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room.id) }}
                        className="text-red-600 hover:text-red-700 mt-2"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleJoinRoom(room.id) }}
                        disabled={room.participants >= room.maxParticipants || activeRoom !== null}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300"
                      >
                        {room.participants >= room.maxParticipants ? 'Room Full' : 'Join Room'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Room Details */}
          {activeRoom && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{activeRoom.name}</h3>
                <button
                  onClick={handleLeaveRoom}
                  disabled={activeRoom.participants === 0}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Leave Room
                </button>
              </div>

              {/* Chat */}
              <div className="border rounded-lg">
                <div className="h-64 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex items-start space-x-3">
                      <img
                        src={msg.avatar}
                        alt={msg.user}
                        className="h-8 w-8 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-baseline space-x-2">
                          <span className="font-medium text-gray-900">{msg.user}</span>
                          <span className="text-xs text-gray-500">
                            {format(msg.timestamp, 'HH:mm')}
                          </span>
                        </div>
                        <p className="text-gray-700 mt-1">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <MessageSquare className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pomodoro Timer */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pomodoro Timer</h3>
            
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-6">
                {formatTime(pomodoroTime)}
              </div>

              <div className="flex items-center justify-center space-x-4 mb-6">
                <button
                  onClick={isTimerRunning ? handleTimerPause : handleTimerStart}
                  className={`p-3 rounded-full ${
                    isTimerRunning
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white transition-colors`}
                >
                  {isTimerRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </button>
                <button
                  onClick={handleTimerReset}
                  className="p-3 rounded-full bg-gray-600 hover:bg-gray-700 text-white transition-colors"
                >
                  <RotateCw className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleTimerDurationChange(25 * 60)}
                  className="py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
                >
                  25 min
                </button>
                <button
                  onClick={() => handleTimerDurationChange(0.1 * 60)}
                  className="py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
                >
                  5 min
                </button>
                <button
                  onClick={() => handleTimerDurationChange(15 * 60)}
                  className="py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
                >
                  15 min
                </button>
              </div>

              {/* XP Info */}
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center justify-center space-x-2 text-sm text-yellow-800">
                  <Trophy className="h-4 w-4" />
                  <span>Complete timer to earn XP!</span>
                </div>
                <div className="text-xs text-yellow-600 mt-1 text-center">
                  {Math.floor(originalTime / 60)} min = ~{Math.max(Math.floor(originalTime / 60), 10)} XP
                </div>
              </div>
            </div>
          </div>

          {/* Study Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Focus Time</span>
                <span className="font-semibold">2h 45m</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pomodoros Completed</span>
                <span className="font-semibold">6</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">XP Earned Today</span>
                <span className="font-semibold text-yellow-600">+{xpEarnedToday} XP</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total XP</span>
                <span className="font-semibold text-green-600">{totalXP.toLocaleString()} XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Room Form Modal */}
      {showCreateRoomForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Create New Study Room</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600">Room Name</label>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600">Subject</label>
              <input
                type="text"
                value={newRoomSubject}
                onChange={(e) => setNewRoomSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600">Max Participants</label>
              <input
                type="number"
                value={newRoomMaxParticipants}
                onChange={(e) => setNewRoomMaxParticipants(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min={1}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCreateRoomForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRoom}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg"
              >
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudyGroups

