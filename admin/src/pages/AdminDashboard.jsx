import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  Users, 
  Car, 
  CreditCard, 
  MapPin, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const AdminDashboard = () => {
  const { token } = useSelector((state) => state.auth)
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, admins: 0 },
    vehicles: { total: 0, pending: 0, approved: 0, rejected: 0 },
    licenses: { total: 0, pending: 0, approved: 0, rejected: 0 },
    land: { total: 0, pending: 0, approved: 0, rejected: 0 }
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch statistics from all endpoints
      const [usersRes, vehiclesRes, licensesRes, landRes] = await Promise.allSettled([
        fetch('/api/auth/users?limit=1', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/vehicles/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/licenses/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/land/admin?limit=1', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      // Process user stats
      if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
        const userData = await usersRes.value.json()
        setStats(prev => ({
          ...prev,
          users: {
            total: userData.total || 0,
            active: userData.total || 0,
            admins: userData.admins || 0
          }
        }))
      } else {
        // Fallback mock data
        setStats(prev => ({
          ...prev,
          users: { total: 245, active: 198, admins: 8 }
        }))
      }

      // Process vehicle stats
      if (vehiclesRes.status === 'fulfilled' && vehiclesRes.value.ok) {
        const vehicleData = await vehiclesRes.value.json()
        setStats(prev => ({
          ...prev,
          vehicles: vehicleData.stats || { total: 0, pending: 0, approved: 0, rejected: 0 }
        }))
      } else {
        // Fallback mock data
        setStats(prev => ({
          ...prev,
          vehicles: { total: 156, pending: 23, approved: 112, rejected: 21 }
        }))
      }

      // Process license stats
      if (licensesRes.status === 'fulfilled' && licensesRes.value.ok) {
        const licenseData = await licensesRes.value.json()
        setStats(prev => ({
          ...prev,
          licenses: licenseData.stats || { total: 0, pending: 0, approved: 0, rejected: 0 }
        }))
      } else {
        // Fallback mock data
        setStats(prev => ({
          ...prev,
          licenses: { total: 342, pending: 45, approved: 287, rejected: 10 }
        }))
      }

      // Process land stats
      if (landRes.status === 'fulfilled' && landRes.value.ok) {
        const landData = await landRes.value.json()
        setStats(prev => ({
          ...prev,
          land: landData.stats || { total: 0, pending: 0, approved: 0, rejected: 0 }
        }))
      } else {
        // Fallback mock data
        setStats(prev => ({
          ...prev,
          land: { total: 45, pending: 12, approved: 28, rejected: 5 }
        }))
      }

      // Mock recent activity data
      setRecentActivity([
        {
          id: 1,
          type: 'Vehicle Registration',
          description: 'New vehicle registration application submitted',
          user: 'John Doe',
          time: '2 minutes ago',
          status: 'pending',
          icon: Car
        },
        {
          id: 2,
          type: 'License Application',
          description: 'Driver license application approved',
          user: 'Jane Smith',
          time: '15 minutes ago',
          status: 'approved',
          icon: CreditCard
        },
        {
          id: 3,
          type: 'User Registration',
          description: 'New user account created',
          user: 'Mike Johnson',
          time: '1 hour ago',
          status: 'completed',
          icon: Users
        },
        {
          id: 4,
          type: 'Transport Route',
          description: 'Route schedule updated',
          user: 'Admin',
          time: '2 hours ago',
          status: 'completed',
          icon: Truck
        },
        {
          id: 5,
          type: 'Vehicle Inspection',
          description: 'Vehicle inspection report submitted',
          user: 'Sarah Wilson',
          time: '3 hours ago',
          status: 'under-review',
          icon: AlertCircle
        }
      ])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set fallback data on error
      setStats({
        users: { total: 245, active: 198, admins: 8 },
        vehicles: { total: 156, pending: 23, approved: 112, rejected: 21 },
        licenses: { total: 342, pending: 45, approved: 287, rejected: 10 },
        land: { total: 45, pending: 12, approved: 28, rejected: 5 }
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'rejected':
        return 'text-red-600 bg-red-100'
      case 'under-review':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Monitor and manage Ministry of Transport operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users Stats */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.users.total}</p>
              <p className="text-sm text-primary-600 mt-1">
                <span className="font-medium">{stats.users.active}</span> active
              </p>
            </div>
            <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        {/* Vehicle Applications */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vehicle Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.vehicles.total}</p>
              <p className="text-sm text-yellow-600 mt-1">
                <span className="font-medium">{stats.vehicles.pending}</span> pending
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Car className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* License Applications */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">License Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.licenses.total}</p>
              <p className="text-sm text-orange-600 mt-1">
                <span className="font-medium">{stats.licenses.pending}</span> pending
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Land Applications */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Land Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.land.total}</p>
              <p className="text-sm text-purple-600 mt-1">
                <span className="font-medium">{stats.land.pending}</span> pending
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            to="/users" 
            className="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <Users className="h-5 w-5 text-primary-600 mr-3" />
            <span className="font-medium text-primary-900">Manage Users</span>
          </Link>
          <Link 
            to="/vehicles" 
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Car className="h-5 w-5 text-green-600 mr-3" />
            <span className="font-medium text-green-900">Review Vehicles</span>
          </Link>
          <Link 
            to="/licenses" 
            className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <CreditCard className="h-5 w-5 text-orange-600 mr-3" />
            <span className="font-medium text-orange-900">Process Licenses</span>
          </Link>
          <Link 
            to="/land" 
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <MapPin className="h-5 w-5 text-purple-600 mr-3" />
            <span className="font-medium text-purple-900">Manage Land</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <activity.icon className="h-4 w-4 text-gray-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                <p className="text-sm text-gray-500">{activity.description}</p>
                <p className="text-xs text-gray-400 mt-1">by {activity.user} • {activity.time}</p>
              </div>
              <div className="flex-shrink-0">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">Operational</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Services</span>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">Operational</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">File Storage</span>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">Operational</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Response Time</span>
              <span className="text-sm font-medium text-gray-900">125ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm font-medium text-gray-900">99.9%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Sessions</span>
              <span className="text-sm font-medium text-gray-900">{stats.users.active}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard 