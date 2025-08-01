import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Enhanced CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// In-memory database (replace with real database in production)
const users = []
const deadlines = []
const courses = []
const studySessions = []

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: '7d' }
  )
}

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production')
    req.userId = decoded.id
    next()
  } catch (error) {
    console.error('Token verification error:', error)
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// Password validation function
const validatePassword = (password) => {
  const requirements = [
    { test: (pwd) => pwd.length >= 8, message: 'Password must be at least 8 characters long' },
    { test: (pwd) => /[A-Z]/.test(pwd), message: 'Password must contain at least one uppercase letter' },
    { test: (pwd) => /[a-z]/.test(pwd), message: 'Password must contain at least one lowercase letter' },
    { test: (pwd) => /\d/.test(pwd), message: 'Password must contain at least one number' },
    { test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd), message: 'Password must contain at least one special character' }
  ]

  for (const req of requirements) {
    if (!req.test(password)) {
      return { valid: false, message: req.message }
    }
  }

  return { valid: true }
}

// Health check endpoint (first route for easy testing)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    users: users.length,
    deadlines: deadlines.length,
    courses: courses.length,
    studySessions: studySessions.length,
    port: PORT
  })
})

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() })
})

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Registration attempt:', { body: req.body })
    
    const { name, email, password } = req.body

    // Validate input
    if (!name || !email || !password) {
      console.log('Missing fields:', { name: !!name, email: !!email, password: !!password })
      return res.status(400).json({ error: 'All fields are required' })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' })
    }

    // Validate password requirements
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message })
    }

    // Check if user exists
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (existingUser) {
      console.log('User already exists:', email)
      return res.status(400).json({ error: 'An account with this email already exists' })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const user = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      createdAt: new Date().toISOString()
    }

    users.push(user)
    console.log('User created successfully:', { id: user.id, email: user.email, name: user.name })

    // Generate token
    const token = generateToken(user)

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Server error occurred during registration' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login attempt:', { email: req.body.email })
    
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim())
    if (!user) {
      console.log('User not found:', email)
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      console.log('Invalid password for user:', email)
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Generate token
    const token = generateToken(user)
    console.log('Login successful:', { id: user.id, email: user.email })

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Server error occurred during login' })
  }
})

app.get('/api/auth/me', verifyToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Deadlines Routes
app.get('/api/deadlines', verifyToken, (req, res) => {
  try {
    const userDeadlines = deadlines.filter(d => d.userId === req.userId)
    res.json(userDeadlines)
  } catch (error) {
    console.error('Get deadlines error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/deadlines', verifyToken, (req, res) => {
  try {
    const { title, description, courseId, dueDate, priority } = req.body

    if (!title || !dueDate) {
      return res.status(400).json({ error: 'Title and due date are required' })
    }

    const deadline = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: req.userId,
      title: title.trim(),
      description: description ? description.trim() : '',
      courseId: courseId || null,
      dueDate: new Date(dueDate).toISOString(),
      priority: priority || 'medium',
      completed: false,
      createdAt: new Date().toISOString()
    }

    deadlines.push(deadline)
    res.status(201).json(deadline)
  } catch (error) {
    console.error('Create deadline error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.put('/api/deadlines/:id', verifyToken, (req, res) => {
  try {
    const deadlineIndex = deadlines.findIndex(
      d => d.id === req.params.id && d.userId === req.userId
    )

    if (deadlineIndex === -1) {
      return res.status(404).json({ error: 'Deadline not found' })
    }

    const updatedDeadline = {
      ...deadlines[deadlineIndex],
      ...req.body,
      id: deadlines[deadlineIndex].id,
      userId: deadlines[deadlineIndex].userId,
      updatedAt: new Date().toISOString()
    }

    deadlines[deadlineIndex] = updatedDeadline
    res.json(updatedDeadline)
  } catch (error) {
    console.error('Update deadline error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.delete('/api/deadlines/:id', verifyToken, (req, res) => {
  try {
    const deadlineIndex = deadlines.findIndex(
      d => d.id === req.params.id && d.userId === req.userId
    )

    if (deadlineIndex === -1) {
      return res.status(404).json({ error: 'Deadline not found' })
    }

    deadlines.splice(deadlineIndex, 1)
    res.status(204).send()
  } catch (error) {
    console.error('Delete deadline error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Courses Routes
app.get('/api/courses', verifyToken, (req, res) => {
  try {
    const userCourses = courses.filter(c => c.userId === req.userId)
    res.json(userCourses)
  } catch (error) {
    console.error('Get courses error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/courses', verifyToken, (req, res) => {
  try {
    const { name, color, description } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Course name is required' })
    }

    const course = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: req.userId,
      name: name.trim(),
      color: color || '#3b82f6',
      description: description ? description.trim() : '',
      progress: 0,
      createdAt: new Date().toISOString()
    }

    courses.push(course)
    res.status(201).json(course)
  } catch (error) {
    console.error('Create course error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Study Sessions Routes
app.get('/api/study-sessions', verifyToken, (req, res) => {
  try {
    const userSessions = studySessions.filter(s => s.userId === req.userId)
    res.json(userSessions)
  } catch (error) {
    console.error('Get study sessions error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/study-sessions', verifyToken, (req, res) => {
  try {
    const { courseId, duration, notes } = req.body

    if (!courseId || !duration) {
      return res.status(400).json({ error: 'Course and duration are required' })
    }

    const session = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: req.userId,
      courseId,
      duration: parseInt(duration),
      notes: notes ? notes.trim() : '',
      xpEarned: Math.floor(parseInt(duration) / 10) * 10, // 10 XP per 10 minutes
      date: new Date().toISOString()
    }

    studySessions.push(session)
    res.status(201).json(session)
  } catch (error) {
    console.error('Create study session error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Study data endpoint
app.get('/api/study-data', verifyToken, (req, res) => {
  try {
    const userSessions = studySessions.filter(s => s.userId === req.userId)
    const totalXP = userSessions.reduce((sum, session) => sum + (session.xpEarned || 0), 0)
    const totalHours = userSessions.reduce((sum, session) => sum + (session.duration || 0), 0) / 60
    
    // Calculate study streak (simplified)
    const today = new Date()
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const recentSessions = userSessions.filter(s => new Date(s.date) > lastWeek)
    const studyStreak = recentSessions.length > 0 ? Math.min(recentSessions.length, 7) : 0

    const userDeadlines = deadlines.filter(d => d.userId === req.userId)
    const completedGoals = userDeadlines.filter(d => d.completed).length

    res.json({
      totalXP,
      studyStreak,
      hoursStudied: totalHours.toFixed(1),
      goalsCompleted: completedGoals
    })
  } catch (error) {
    console.error('Get study data error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
app.use('*', (req, res) => {
  console.log('404 - Route not found:', req.originalUrl)
  res.status(404).json({ error: 'Route not found' })
})

// Start server with error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`)
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
})

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`)
    process.exit(1)
  } else {
    console.error('❌ Server error:', error)
  }
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('✅ Server closed')
    process.exit(0)
  })
})
