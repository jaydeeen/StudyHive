import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Brain, Mail, Lock, User, Eye, EyeOff, Check, X } from 'lucide-react'

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
  { label: 'Contains uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
  { label: 'Contains lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
  { label: 'Contains number', test: (pwd) => /\d/.test(pwd) },
  { label: 'Contains special character', test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) }
]

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const validatePassword = (password: string): boolean => {
    return passwordRequirements.every(req => req.test(password))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validate password requirements for sign up
    if (isSignUp && !validatePassword(formData.password)) {
      setError('Password does not meet all requirements')
      return
    }

    // Basic validation
    if (!formData.email.trim()) {
      setError('Email is required')
      return
    }

    if (!formData.password.trim()) {
      setError('Password is required')
      return
    }

    if (isSignUp && !formData.name.trim()) {
      setError('Name is required')
      return
    }

    setLoading(true)

    try {
      if (isSignUp) {
        console.log('🔐 Login: Attempting registration...')
        await register(formData.name.trim(), formData.email.trim(), formData.password)
        setSuccess('Account created successfully! You can now sign in.')
        // Switch to sign in mode
        setIsSignUp(false)
        setFormData({ name: '', email: formData.email, password: '' })
      } else {
        console.log('🔐 Login: Attempting login...')
        await login(formData.email.trim(), formData.password)
        console.log('🔐 Login: Login successful, navigating to dashboard...')
        navigate('/')
      }
    } catch (err: any) {
      console.error('🔐 Login: Auth error:', err)
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setFormData({ ...formData, password: newPassword })
    
    if (isSignUp && newPassword.length > 0) {
      setShowPasswordRequirements(true)
    } else {
      setShowPasswordRequirements(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 lg:p-8">
        <div className="text-center mb-6 lg:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 bg-primary-100 rounded-full mb-4">
            <Brain className="h-6 w-6 lg:h-8 lg:w-8 text-primary-600" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">StudyHive</h1>
          <p className="text-gray-600 mt-2 text-sm lg:text-base">
            {isSignUp ? 'Create your account' : 'Welcome back!'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                  placeholder="John Doe"
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handlePasswordChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Password Requirements */}
            {isSignUp && showPasswordRequirements && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                <div className="space-y-1">
                  {passwordRequirements.map((req, index) => {
                    const isValid = req.test(formData.password)
                    return (
                      <div key={index} className="flex items-center text-sm">
                        {isValid ? (
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <X className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        <span className={isValid ? 'text-green-700' : 'text-red-700'}>
                          {req.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || (isSignUp && !validatePassword(formData.password))}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium"
          >
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setSuccess('')
                setShowPasswordRequirements(false)
                setFormData({ name: '', email: '', password: '' })
              }}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
