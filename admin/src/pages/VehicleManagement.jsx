import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  Car, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  Check,
  X,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  User,
  Calendar,
  Hash,
  MapPin,
  MessageSquare,
  Download,
  FileImage
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const VehicleManagement = () => {
  const { token } = useSelector((state) => state.auth)
  const [vehicles, setVehicles] = useState([])
  const [filteredVehicles, setFilteredVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('view') // 'view', 'edit', 'notes', 'approve'
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterApplicationType, setFilterApplicationType] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0
  })
  const [adminNote, setAdminNote] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  const applicationTypes = [
    'Annual Inspection',
    'New Registration', 
    'Service Type Change',
    'Ownership Transfer',
    'Name Change',
    'Lost Libri Replacement',
    'Lost Bolo Replacement',
    'Lost Plate Replacement'
  ]

  useEffect(() => {
    fetchVehicles()
    fetchStats()
  }, [currentPage])

  useEffect(() => {
    filterVehicles()
  }, [vehicles, searchTerm, filterStatus, filterApplicationType])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/vehicles?page=${currentPage}&limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setVehicles(data.vehicles || [])
        setTotalPages(Math.ceil((data.total || 0) / 20))
      } else {
        console.error('Failed to fetch vehicles')
        setVehicles([])
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/vehicles/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats || {})
      }
    } catch (error) {
      console.error('Error fetching vehicle stats:', error)
    }
  }

  const filterVehicles = () => {
    let filtered = vehicles

    if (searchTerm) {
      filtered = filtered.filter(vehicle => 
        vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.engineNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.chassisNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.applicationType?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.status === filterStatus)
    }

    if (filterApplicationType !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.applicationType === filterApplicationType)
    }

    setFilteredVehicles(filtered)
  }

  const openModal = (type, vehicle = null) => {
    setModalType(type)
    setSelectedVehicle(vehicle)
    setAdminNote('')
    setRejectionReason('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedVehicle(null)
    setModalType('view')
    setAdminNote('')
    setRejectionReason('')
  }

  const updateVehicleStatus = async (vehicleId, newStatus, note = '') => {
    try {
      const body = { status: newStatus }
      if (note) {
        body.adminNote = note
      }

      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        fetchVehicles()
        fetchStats()
        closeModal()
        alert(`Vehicle application ${newStatus.toLowerCase()} successfully!`)
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to update vehicle status')
      }
    } catch (error) {
      console.error('Error updating vehicle status:', error)
      alert('An error occurred while updating vehicle status')
    }
  }

  const addAdminNote = async (vehicleId, note) => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ note })
      })

      if (response.ok) {
        fetchVehicles()
        setAdminNote('')
        alert('Admin note added successfully!')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to add admin note')
      }
    } catch (error) {
      console.error('Error adding admin note:', error)
      alert('An error occurred while adding admin note')
    }
  }

  const deleteVehicle = async (vehicleId, vehicleInfo) => {
    if (window.confirm(`Are you sure you want to delete vehicle "${vehicleInfo}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/vehicles/${vehicleId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (response.ok) {
          fetchVehicles()
          fetchStats()
          alert('Vehicle deleted successfully')
        } else {
          const error = await response.json()
          alert(error.message || 'Failed to delete vehicle')
        }
      } catch (error) {
        console.error('Error deleting vehicle:', error)
        alert('An error occurred while deleting vehicle')
      }
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Approved':
        return 'bg-green-100 text-green-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      case 'Completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-4 h-4" />
      case 'Approved':
        return <CheckCircle className="w-4 h-4" />
      case 'Rejected':
        return <XCircle className="w-4 h-4" />
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getApplicationTypeColor = (type) => {
    switch (type) {
      case 'New Registration':
        return 'bg-blue-100 text-blue-800'
      case 'Annual Inspection':
        return 'bg-green-100 text-green-800'
      case 'Service Type Change':
        return 'bg-purple-100 text-purple-800'
      case 'Ownership Transfer':
        return 'bg-orange-100 text-orange-800'
      case 'Name Change':
        return 'bg-pink-100 text-pink-800'
      case 'Lost Libri Replacement':
      case 'Lost Bolo Replacement':
      case 'Lost Plate Replacement':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const downloadDocument = (documentPath) => {
    if (documentPath) {
      // Remove /api prefix if it exists and construct the correct URL
      const cleanPath = documentPath.startsWith('/api') ? documentPath.substring(4) : documentPath
      const fullUrl = `${window.location.origin}${cleanPath}`
      
      // Create a temporary link element to trigger download
      const link = document.createElement('a')
      link.href = fullUrl
      link.download = documentPath.split('/').pop() || 'document'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const renderDocuments = (documents) => {
    if (!documents) return <p className="text-gray-500">No documents uploaded</p>
    
    return (
      <div className="space-y-2">
        {Object.entries(documents).map(([key, value]) => {
          if (!value) return null
          return (
            <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <FileImage className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
              <button
                onClick={() => downloadDocument(value)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    )
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Applications Management</h1>
        <p className="text-gray-600">Manage and review vehicle registration applications and services</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by make, model, registration, user, or application type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Completed">Completed</option>
            </select>
            <select
              value={filterApplicationType}
              onChange={(e) => setFilterApplicationType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {applicationTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getApplicationTypeColor(vehicle.applicationType)}`}>
                        {vehicle.applicationType}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {vehicle.user?.firstName} {vehicle.user?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{vehicle.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {vehicle.make && vehicle.model ? (
                        <>
                          <div className="font-medium">{vehicle.make} {vehicle.model}</div>
                          <div className="text-gray-500">{vehicle.year} • {vehicle.color}</div>
                          {vehicle.engineNumber && (
                            <div className="text-gray-500">Engine: {vehicle.engineNumber}</div>
                          )}
                          {vehicle.chassisNumber && (
                            <div className="text-gray-500">Chassis: {vehicle.chassisNumber}</div>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-500">Service application only</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                      {getStatusIcon(vehicle.status)}
                      <span className="ml-1">{vehicle.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(vehicle.submissionDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal('view', vehicle)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {vehicle.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => openModal('approve', vehicle)}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openModal('reject', vehicle)}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => openModal('notes', vehicle)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Add Note"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteVehicle(vehicle._id, `${vehicle.applicationType} - ${vehicle.user?.firstName} ${vehicle.user?.lastName}`)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedVehicle && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {modalType === 'view' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Vehicle Application Details
                    </h3>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Application Information</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Type:</span> {selectedVehicle.applicationType}</div>
                          <div><span className="font-medium">Status:</span> {selectedVehicle.status}</div>
                          <div><span className="font-medium">Submitted:</span> {formatDate(selectedVehicle.submissionDate)}</div>
                          {selectedVehicle.approvalDate && (
                            <div><span className="font-medium">Approved:</span> {formatDate(selectedVehicle.approvalDate)}</div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">User Information</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Name:</span> {selectedVehicle.user?.firstName} {selectedVehicle.user?.lastName}</div>
                          <div><span className="font-medium">Email:</span> {selectedVehicle.user?.email}</div>
                          <div><span className="font-medium">Phone:</span> {selectedVehicle.user?.phone}</div>
                        </div>
                      </div>
                    </div>

                    {selectedVehicle.make && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Vehicle Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div><span className="font-medium">Make:</span> {selectedVehicle.make}</div>
                          <div><span className="font-medium">Model:</span> {selectedVehicle.model}</div>
                          <div><span className="font-medium">Year:</span> {selectedVehicle.year}</div>
                          <div><span className="font-medium">Color:</span> {selectedVehicle.color}</div>
                          <div><span className="font-medium">Type:</span> {selectedVehicle.vehicleType}</div>
                          <div><span className="font-medium">Engine Number:</span> {selectedVehicle.engineNumber}</div>
                          <div><span className="font-medium">Chassis Number:</span> {selectedVehicle.chassisNumber}</div>
                          {selectedVehicle.registrationNumber && (
                            <div><span className="font-medium">Registration:</span> {selectedVehicle.registrationNumber}</div>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Documents</h4>
                      {renderDocuments(selectedVehicle.documents)}
                    </div>

                    {selectedVehicle.adminNotes && selectedVehicle.adminNotes.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Admin Notes</h4>
                        <div className="space-y-2">
                          {selectedVehicle.adminNotes.map((note, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                              <div className="text-sm text-gray-600 mb-1">
                                {formatDate(note.addedAt)} by {note.addedBy?.firstName} {note.addedBy?.lastName}
                              </div>
                              <div className="text-sm">{note.note}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {modalType === 'approve' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Approve Application
                    </h3>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      Approve the {selectedVehicle.applicationType} application for {selectedVehicle.user?.firstName} {selectedVehicle.user?.lastName}?
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Admin Note (Optional)
                      </label>
                      <textarea
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Add any notes about this approval..."
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={closeModal}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => updateVehicleStatus(selectedVehicle._id, 'Approved', adminNote)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {modalType === 'reject' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Reject Application
                    </h3>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      Reject the {selectedVehicle.applicationType} application for {selectedVehicle.user?.firstName} {selectedVehicle.user?.lastName}?
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rejection Reason *
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Please provide a reason for rejection..."
                        required
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={closeModal}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => updateVehicleStatus(selectedVehicle._id, 'Rejected', rejectionReason)}
                        disabled={!rejectionReason.trim()}
                        className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {modalType === 'notes' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Add Admin Note
                    </h3>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      Add a note to the {selectedVehicle.applicationType} application for {selectedVehicle.user?.firstName} {selectedVehicle.user?.lastName}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Note
                      </label>
                      <textarea
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your note..."
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={closeModal}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => addAdminNote(selectedVehicle._id, adminNote)}
                        disabled={!adminNote.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Note
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VehicleManagement 