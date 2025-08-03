import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Users, 
  Car, 
  CreditCard, 
  MapPin, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

// --- NEW: Import for blockchain connection ---
import { connectWalletAndContract } from '../utils/blockchainService';

const AdminDashboard = () => {
  const { token } = useSelector((state) => state.auth);
  // Your original state remains unchanged
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, admins: 0 },
    vehicles: { total: 0, pending: 0, approved: 0, rejected: 0 },
    licenses: { total: 0, pending: 0, approved: 0, rejected: 0 },
    land: { total: 0, pending: 0, approved: 0, rejected: 0 }
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [token]); // Added token dependency

  // --- MODIFIED: This function now fetches from both the blockchain and your API ---
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Connect to the smart contract first
      const { contract } = await connectWalletAndContract();

      // Create a list of promises to fetch data from all sources
      const promises = [
        contract.getTotalUsers(), // From Blockchain
        contract.getTotalLands(), // From Blockchain
        contract.getVerifiedLandsCount(), // From Blockchain
        fetch('/api/vehicles/stats', { headers: { 'Authorization': `Bearer ${token}` } }), // From API
        fetch('/api/licenses/stats', { headers: { 'Authorization': `Bearer ${token}` } }) // From API
      ];

      const results = await Promise.allSettled(promises);
      
      const [
          usersResult,
          landsResult,
          verifiedLandsResult,
          vehiclesResult,
          licensesResult
      ] = results;

      const newStats = { ...stats };

      // Process User and Land stats from the blockchain
      if (usersResult.status === 'fulfilled') {
        const totalUsers = Number(usersResult.value);
        newStats.users = { total: totalUsers, active: totalUsers, admins: 0 }; // Contract doesn't track admins
      }
      if (landsResult.status === 'fulfilled' && verifiedLandsResult.status === 'fulfilled') {
        const totalLands = Number(landsResult.value);
        const verifiedLands = Number(verifiedLandsResult.value);
        newStats.land = { total: totalLands, approved: verifiedLands, pending: totalLands - verifiedLands, rejected: 0 };
      }

      // Process Vehicle stats from your API
      if (vehiclesResult.status === 'fulfilled' && vehiclesResult.value.ok) {
        const vehicleData = await vehiclesResult.value.json();
        newStats.vehicles = vehicleData.stats || newStats.vehicles;
      }

      // Process License stats from your API
      if (licensesResult.status === 'fulfilled' && licensesResult.value.ok) {
        const licenseData = await licensesResult.value.json();
        newStats.licenses = licenseData.stats || newStats.licenses;
      }

      setStats(newStats);

      // Your original mock recent activity data (unchanged)
      setRecentActivity([
        { id: 1, type: 'Vehicle Registration', description: 'New vehicle application submitted', user: 'John Doe', time: '2 minutes ago', status: 'pending', icon: Car },
        { id: 2, type: 'License Application', description: 'Driver license application approved', user: 'Jane Smith', time: '15 minutes ago', status: 'approved', icon: CreditCard },
        { id: 3, type: 'User Registration', description: 'New blockchain user registered', user: 'Mike Johnson', time: '1 hour ago', status: 'completed', icon: Users },
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error("Could not fetch dashboard data. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // The rest of your file remains EXACTLY THE SAME
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'under-review': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return ( <div className="flex items-center justify-center h-64"><LoadingSpinner /></div> );
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
              <p className="text-sm text-primary-600 mt-1"><span className="font-medium">{stats.users.active}</span> active</p>
            </div>
            <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center"><Users className="h-6 w-6 text-primary-600" /></div>
          </div>
        </div>

        {/* Vehicle Applications */}
        <div className="card">
           <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vehicle Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.vehicles.total}</p>
              <p className="text-sm text-yellow-600 mt-1"><span className="font-medium">{stats.vehicles.pending}</span> pending</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center"><Car className="h-6 w-6 text-green-600" /></div>
          </div>
        </div>

        {/* License Applications */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">License Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.licenses.total}</p>
              <p className="text-sm text-orange-600 mt-1"><span className="font-medium">{stats.licenses.pending}</span> pending</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center"><CreditCard className="h-6 w-6 text-orange-600" /></div>
          </div>
        </div>

        {/* Land Applications */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Land Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.land.total}</p>
              <p className="text-sm text-purple-600 mt-1"><span className="font-medium">{stats.land.pending}</span> pending</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center"><MapPin className="h-6 w-6 text-purple-600" /></div>
          </div>
        </div>
      </div>

      {/* Quick Actions and the rest of your UI... */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/users" className="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100"><Users className="h-5 w-5 text-primary-600 mr-3" /><span>Manage Users</span></Link>
          <Link to="/vehicles" className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100"><Car className="h-5 w-5 text-green-600 mr-3" /><span>Review Vehicles</span></Link>
          <Link to="/licenses" className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100"><CreditCard className="h-5 w-5 text-orange-600 mr-3" /><span>Process Licenses</span></Link>
          <Link to="/land" className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100"><MapPin className="h-5 w-5 text-purple-600 mr-3" /><span>Manage Land</span></Link>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0"><div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center"><activity.icon className="h-4 w-4 text-gray-600" /></div></div>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900">{activity.type}</p><p className="text-sm text-gray-500">{activity.description}</p><p className="text-xs text-gray-400 mt-1">by {activity.user} • {activity.time}</p></div>
              <div className="flex-shrink-0"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>{activity.status}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard;