import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { adminLogin, clearError } from '../store/slices/authSlice'
import { Eye, EyeOff, Shield, AlertCircle, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      await dispatch(adminLogin(formData)).unwrap()
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error) {
      // Error is handled by the Redux slice and useEffect above
      // Show instructions if access is denied due to non-admin role
      if (error.includes('Admin privileges required')) {
        setShowInstructions(true)
      }
    }
  }

  const handleCreateAdminAccount = () => {
    navigate('/signup')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Admin Panel Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ministry of Transport Administration
          </p>
        </div>

        {/* Instructions Banner */}
        {showInstructions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Need an Admin Account?
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  To access the admin panel, you need to create an account with "Administrator" role.
                </p>
                <button
                  onClick={handleCreateAdminAccount}
                  className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 underline"
                >
                  Create Admin Account →
                </button>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your admin email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <LoadingSpinner /> : 'Sign In to Admin Panel'}
              </button>
            </div>
          </div>
        </form>

        {/* Help Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            First time here?
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            You need an Administrator account to access this panel. If you don't have one:
          </p>
          <button
            onClick={handleCreateAdminAccount}
            className="w-full btn-secondary text-sm py-2"
          >
            Create Admin Account
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            This is a restricted area for authorized administrators only.
            <br />
            If you're a regular user, please use the{' '}
            <a 
              href="http://localhost:3000" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-500 underline"
            >
              main application portal
            </a>.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin 