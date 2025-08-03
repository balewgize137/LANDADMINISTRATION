import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  CreditCard, 
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
  Award,
  BookOpen,
  Car
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const LicenseManagement = () => {
  const { token } = useSelector((state) => state.auth)
  const [licenses, setLicenses] = useState([])
  const [filteredLicenses, setFilteredLicenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLicense, setSelectedLicense] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('view') // 'view', 'edit', 'notes'
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    issued: 0
  })
  const [adminNote, setAdminNote] = useState('')

  useEffect(() => {
    fetchLicenses()
    fetchStats()
  }, [currentPage])

  useEffect(() => {
    filterLicenses()
  }, [licenses, searchTerm, filterStatus, filterType])

  const fetchLicenses = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/licenses?page=${currentPage}&limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setLicenses(data.licenses || [])
        setTotalPages(Math.ceil((data.total || 0) / 20))
      } else {
        console.error('Failed to fetch licenses')
        setLicenses([])
      }
    } catch (error) {
      console.error('Error fetching licenses:', error)
      setLicenses([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/licenses/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats || {})
      }
    } catch (error) {
      console.error('Error fetching license stats:', error)
    }
  }

  const filterLicenses = () => {
    let filtered = licenses

    if (searchTerm) {
      filtered = filtered.filter(license => 
        license.licenseType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        license.licenseDetails?.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        license.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        license.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        license.user?.nationalId?.includes(searchTerm)
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(license => license.status === filterStatus)
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(license => license.licenseType === filterType)
    }

    setFilteredLicenses(filtered)
  }

  const openModal = (type, license = null) => {
    setModalType(type)
    setSelectedLicense(license)
    setAdminNote('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedLicense(null)
    setModalType('view')
    setAdminNote('')
  }

  const updateLicenseStatus = async (licenseId, newStatus, rejectReason = '') => {
    try {
      const body = { status: newStatus }
      if (rejectReason) {
        body.rejectionReason = rejectReason
      }

      const response = await fetch(`/api/licenses/${licenseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        fetchLicenses()
        fetchStats()
        closeModal()
        alert(`License application ${newStatus.toLowerCase()} successfully!`)
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to update license status')
      }
    } catch (error) {
      console.error('Error updating license status:', error)
      alert('An error occurred while updating license status')
    }
  }

  const updateTestResults = async (licenseId, testType, results) => {
    try {
      const body = {
        [`testResults.${testType}`]: results
      }

      const response = await fetch(`/api/licenses/${licenseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        fetchLicenses()
        alert('Test results updated successfully!')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to update test results')
      }
    } catch (error) {
      console.error('Error updating test results:', error)
      alert('An error occurred while updating test results')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      case 'Under Review':
        return 'bg-blue-100 text-blue-800'
      case 'License Issued':
        return 'bg-purple-100 text-purple-800'
      case 'Tests Required':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="h-3 w-3" />
      case 'Pending':
        return <Clock className="h-3 w-3" />
      case 'Rejected':
        return <XCircle className="h-3 w-3" />
      case 'Under Review':
        return <AlertCircle className="h-3 w-3" />
      case 'License Issued':
        return <Award className="h-3 w-3" />
      case 'Tests Required':
        return <BookOpen className="h-3 w-3" />
      default:
        return <AlertCircle className="h-3 w-3" />
    }
  }

  const getLicenseTypeIcon = (type) => {
    switch (type) {
      case 'Motorcycle':
        return <Car className="h-4 w-4 text-orange-600" />
      case 'Private':
        return <Car className="h-4 w-4 text-blue-600" />
      case 'Commercial':
        return <Car className="h-4 w-4 text-green-600" />
      case 'Heavy':
        return <Car className="h-4 w-4 text-red-600" />
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTestStatus = (test) => {
    if (test?.passed === true) return { status: 'Passed', color: 'text-green-600' }
    if (test?.passed === false) return { status: 'Failed', color: 'text-red-600' }
    return { status: 'Pending', color: 'text-yellow-600' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-primary-600" />
            License Management
          </h1>
          <p className="text-gray-600 mt-1">Manage driving license applications and tests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
            </div>
            <CreditCard className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved || 0}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected || 0}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Issued</p>
              <p className="text-2xl font-bold text-purple-600">{stats.issued || 0}</p>
            </div>
            <Award className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by license type, number, applicant name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field pl-10 pr-4"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Tests Required">Tests Required</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="License Issued">License Issued</option>
            </select>
          </div>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field pl-10 pr-4"
            >
              <option value="all">All Types</option>
              <option value="Motorcycle">Motorcycle</option>
              <option value="Private">Private</option>
              <option value="Commercial">Commercial</option>
              <option value="Heavy">Heavy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Licenses Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  License Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLicenses.map((license) => (
                <tr key={license._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {license.user?.firstName} {license.user?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {license.user?.nationalId}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getLicenseTypeIcon(license.licenseType)}
                      <span className="text-sm font-medium text-gray-900">{license.licenseType}</span>
                    </div>
                    {license.licenseDetails?.licenseNumber && (
                      <div className="text-sm text-gray-500">
                        #{license.licenseDetails.licenseNumber}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(license.status)}`}>
                      {getStatusIcon(license.status)}
                      {license.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {license.testResults ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span>Theory:</span>
                          <span className={getTestStatus(license.testResults.theory).color}>
                            {getTestStatus(license.testResults.theory).status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Practical:</span>
                          <span className={getTestStatus(license.testResults.practical).color}>
                            {getTestStatus(license.testResults.practical).status}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Not started</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatDate(license.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal('view', license)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {license.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => updateLicenseStatus(license._id, 'Approved')}
                            className="text-green-600 hover:text-green-900"
                            title="Approve Application"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Please enter rejection reason:')
                              if (reason) {
                                updateLicenseStatus(license._id, 'Rejected', reason)
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Reject Application"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => openModal('edit', license)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Edit Tests"
                      >
                        <BookOpen className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                    const pageNumber = index + 1
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNumber
                            ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedLicense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {modalType === 'view' && 'License Application Details'}
                {modalType === 'edit' && 'Manage Test Results'}
              </h3>
            </div>

            <div className="p-6">
              {modalType === 'view' && (
                <div className="space-y-6">
                  {/* Applicant Information */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Applicant Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <p className="text-sm text-gray-900">{selectedLicense.user?.firstName} {selectedLicense.user?.lastName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <p className="text-sm text-gray-900">{selectedLicense.user?.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <p className="text-sm text-gray-900">{selectedLicense.user?.phone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">National ID</label>
                        <p className="text-sm text-gray-900">{selectedLicense.user?.nationalId}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <p className="text-sm text-gray-900">{formatDate(selectedLicense.user?.dateOfBirth)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Medical Certificate</label>
                        <p className="text-sm text-gray-900">
                          {selectedLicense.medicalCertificate?.isValid ? 'Valid' : 'Invalid/Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* License Details */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      License Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">License Type</label>
                        <div className="flex items-center gap-2">
                          {getLicenseTypeIcon(selectedLicense.licenseType)}
                          <span className="text-sm text-gray-900">{selectedLicense.licenseType}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedLicense.status)}`}>
                          {getStatusIcon(selectedLicense.status)}
                          {selectedLicense.status}
                        </span>
                      </div>
                      {selectedLicense.licenseDetails?.licenseNumber && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                          <p className="text-sm text-gray-900">{selectedLicense.licenseDetails.licenseNumber}</p>
                        </div>
                      )}
                      {selectedLicense.licenseDetails?.issueDate && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                          <p className="text-sm text-gray-900">{formatDate(selectedLicense.licenseDetails.issueDate)}</p>
                        </div>
                      )}
                      {selectedLicense.licenseDetails?.expiryDate && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                          <p className="text-sm text-gray-900">{formatDate(selectedLicense.licenseDetails.expiryDate)}</p>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Application Date</label>
                        <p className="text-sm text-gray-900">{formatDate(selectedLicense.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Test Results */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Test Results
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Theory Test</label>
                        {selectedLicense.testResults?.theory ? (
                          <div>
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm ${
                              selectedLicense.testResults.theory.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {selectedLicense.testResults.theory.passed ? '✓ Passed' : '✗ Failed'}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Score: {selectedLicense.testResults.theory.score}% | 
                              Date: {formatDate(selectedLicense.testResults.theory.completedAt)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not taken</span>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Practical Test</label>
                        {selectedLicense.testResults?.practical ? (
                          <div>
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm ${
                              selectedLicense.testResults.practical.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {selectedLicense.testResults.practical.passed ? '✓ Passed' : '✗ Failed'}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Score: {selectedLicense.testResults.practical.score}% | 
                              Date: {formatDate(selectedLicense.testResults.practical.completedAt)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not taken</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  {selectedLicense.status === 'Pending' && (
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => updateLicenseStatus(selectedLicense._id, 'Approved')}
                        className="btn-primary bg-green-600 hover:bg-green-700 flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Approve Application
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Please enter rejection reason:')
                          if (reason) {
                            updateLicenseStatus(selectedLicense._id, 'Rejected', reason)
                          }
                        }}
                        className="btn-primary bg-red-600 hover:bg-red-700 flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Reject Application
                      </button>
                    </div>
                  )}
                </div>
              )}

              {modalType === 'edit' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Theory Test */}
                    <div className="border rounded-lg p-4">
                      <h5 className="text-lg font-medium text-gray-900 mb-4">Theory Test</h5>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <select
                            className="input-field"
                            value={selectedLicense.testResults?.theory?.passed ? 'passed' : selectedLicense.testResults?.theory?.passed === false ? 'failed' : 'pending'}
                            onChange={(e) => {
                              const passed = e.target.value === 'passed' ? true : e.target.value === 'failed' ? false : null
                              if (passed !== null) {
                                const score = passed ? 85 : 45 // Default scores
                                updateTestResults(selectedLicense._id, 'theory', {
                                  passed,
                                  score,
                                  completedAt: new Date(),
                                  attempts: (selectedLicense.testResults?.theory?.attempts || 0) + 1
                                })
                              }
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="passed">Passed</option>
                            <option value="failed">Failed</option>
                          </select>
                        </div>
                        {selectedLicense.testResults?.theory && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Score</label>
                            <p className="text-sm text-gray-900">{selectedLicense.testResults.theory.score}%</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Practical Test */}
                    <div className="border rounded-lg p-4">
                      <h5 className="text-lg font-medium text-gray-900 mb-4">Practical Test</h5>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <select
                            className="input-field"
                            value={selectedLicense.testResults?.practical?.passed ? 'passed' : selectedLicense.testResults?.practical?.passed === false ? 'failed' : 'pending'}
                            onChange={(e) => {
                              const passed = e.target.value === 'passed' ? true : e.target.value === 'failed' ? false : null
                              if (passed !== null) {
                                const score = passed ? 90 : 40 // Default scores
                                updateTestResults(selectedLicense._id, 'practical', {
                                  passed,
                                  score,
                                  completedAt: new Date(),
                                  attempts: (selectedLicense.testResults?.practical?.attempts || 0) + 1
                                })
                              }
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="passed">Passed</option>
                            <option value="failed">Failed</option>
                          </select>
                        </div>
                        {selectedLicense.testResults?.practical && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Score</label>
                            <p className="text-sm text-gray-900">{selectedLicense.testResults.practical.score}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Update Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => updateLicenseStatus(selectedLicense._id, 'Tests Required')}
                      className="btn-primary bg-orange-600 hover:bg-orange-700"
                    >
                      Mark as Tests Required
                    </button>
                    <button
                      onClick={() => updateLicenseStatus(selectedLicense._id, 'License Issued')}
                      className="btn-primary bg-purple-600 hover:bg-purple-700"
                    >
                      Issue License
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LicenseManagement 