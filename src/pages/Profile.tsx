import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { ProfileData, ProfileFormErrors } from '../contexts/AuthContext'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const Profile: React.FC = () => {
  const { user, setUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formErrors, setFormErrors] = useState<ProfileFormErrors>({})
  
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    university: '',
    degree: '',
    modules: '',
    profilePicture: ''
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.profile?.name || user.user_metadata?.name || '',
        email: user.email || '',
        university: user.profile?.university || user.user_metadata?.university || '',
        degree: user.profile?.degree || user.user_metadata?.degree || '',
        modules: user.profile?.modules || user.user_metadata?.modules || '',
        profilePicture: user.profile?.profilePicture || user.user_metadata?.profilePicture || ''
      })
    }
  }, [user])

  const validateForm = (): boolean => {
    const errors: ProfileFormErrors = {}
    
    if (!profileData.name.trim()) {
      errors.name = 'Name is required'
    }
    
    if (profileData.name.length > 100) {
      errors.name = 'Name must be less than 100 characters'
    }
    
    if (profileData.university.length > 100) {
      errors.university = 'University name must be less than 100 characters'
    }
    
    if (profileData.degree.length > 100) {
      errors.degree = 'Degree must be less than 100 characters'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    setFormErrors(prev => ({ ...prev, [name]: undefined }))
    setError('')
    setSuccess('')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 5MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setProfileData(prev => ({ ...prev, profilePicture: reader.result as string }))
      setError('')
    }
    reader.onerror = () => {
      setError('Error reading file')
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!validateForm()) {
      return
    }

    if (!user) {
      setError('User not authenticated')
      return
    }

    setIsLoading(true)
    try {
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          name: profileData.name,
          university: profileData.university,
          degree: profileData.degree,
          modules: profileData.modules,
          profilePicture: profileData.profilePicture
        }
      })

      if (updateError) {
        throw updateError
      }

      // Update profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: profileData.name,
          email: profileData.email,
          university: profileData.university,
          degree: profileData.degree,
          modules: profileData.modules,
          profilePicture: profileData.profilePicture,
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('Profile update error:', profileError)
        // Don't throw here as the user metadata was updated successfully
      }

      // Update local user state
      setUser(prev => ({
        ...prev,
        user_metadata: {
          ...prev?.user_metadata,
          name: profileData.name,
          university: profileData.university,
          degree: profileData.degree,
          modules: profileData.modules,
          profilePicture: profileData.profilePicture
        }
      }))

      setSuccess('Profile updated successfully!')
    } catch (err: any) {
      console.error('Profile update error:', err)
      setError(err.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl lg:text-3xl font-bold mb-6">Profile Settings</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
        {/* Profile Picture */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" 
          />
          {profileData.profilePicture && (
            <img 
              src={profileData.profilePicture} 
              alt="Profile" 
              className="mt-4 h-20 w-20 lg:h-24 lg:w-24 rounded-full object-cover border-2 border-gray-200" 
            />
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            name="name"
            value={profileData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            className={`w-full px-4 py-3 border ${
              formErrors.name ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base`}
          />
          {formErrors.name && (
            <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
          )}
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={profileData.email}
            disabled
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-base"
          />
          <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
        </div>

        {/* University Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
          <input
            type="text"
            name="university"
            value={profileData.university}
            onChange={handleChange}
            placeholder="Enter your university name"
            className={`w-full px-4 py-3 border ${
              formErrors.university ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base`}
          />
          {formErrors.university && (
            <p className="mt-1 text-sm text-red-500">{formErrors.university}</p>
          )}
        </div>

        {/* Degree Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
          <input
            type="text"
            name="degree"
            value={profileData.degree}
            onChange={handleChange}
            placeholder="e.g., Bachelor of Science"
            className={`w-full px-4 py-3 border ${
              formErrors.degree ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base`}
          />
          {formErrors.degree && (
            <p className="mt-1 text-sm text-red-500">{formErrors.degree}</p>
          )}
        </div>

        {/* Modules */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Modules</label>
          <input
            type="text"
            name="modules"
            value={profileData.modules}
            onChange={handleChange}
            placeholder="e.g., Mathematics, Physics, Computer Science"
            className={`w-full px-4 py-3 border ${
              formErrors.modules ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base`}
          />
          {formErrors.modules && (
            <p className="mt-1 text-sm text-red-500">{formErrors.modules}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary-600 text-white py-3 lg:py-4 rounded-lg font-medium hover:bg-primary-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center text-base"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              Updating...
            </>
          ) : (
            'Update Profile'
          )}
        </button>
      </form>
    </div>
  )
}

export default Profile
