import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  MapPin, 
  User, 
  FileText, 
  Calendar,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Download,
  Clock,
  AlertTriangle,
  Building,
  ArrowRight
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const LandManagement = () => {
  const { token } = useSelector((state) => state.auth)
  const [processes, setProcesses] = useState([])
  const [filteredProcesses, setFilteredProcesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProcess, setSelectedProcess] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('view') // 'view', 'approve', 'reject'
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchProcesses()
  }, [currentPage])

  useEffect(() => {
    filterProcesses()
  }, [processes, searchTerm, filterStatus, filterType])

  const fetchProcesses = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/land/admin?page=${currentPage}&limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProcesses(data.data || [])
        setStats(data.stats || {})
        setTotalPages(Math.ceil((data.pagination?.totalItems || 0) / 20))
      } else {
        console.error('Failed to fetch land processes')
        setProcesses([])
      }
    } catch (error) {
      console.error('Error fetching land processes:', error)
      setProcesses([])
    } finally {
      setLoading(false)
    }
  }

  const filterProcesses = () => {
    let filtered = processes

    if (searchTerm) {
      filtered = filtered.filter(process => 
        process.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        process.landLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        process.landType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        process.applicationType?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(process => process.status === filterStatus)
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(process => process.applicationType === filterType)
    }

    setFilteredProcesses(filtered)
  }

  const openModal = (type, process = null) => {
    setModalType(type)
    if (process) {
      setSelectedProcess(process)
    } else {
      setSelectedProcess(null)
    }
    setRejectionReason('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedProcess(null)
    setRejectionReason('')
  }

  const handleStatusUpdate = async (status) => {
    if (status === 'Rejected' && !rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    try {
      setProcessing(true)
      const response = await fetch(`/api/land/admin/${selectedProcess._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          rejectionReason: status === 'Rejected' ? rejectionReason : undefined
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Process ${status.toLowerCase()} successfully`)
        closeModal()
        fetchProcesses() // Refresh the list
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    } finally {
      setProcessing(false)
    }
  }

  const downloadDocument = async (processId, documentType) => {
    try {
      const response = await fetch(`/api/land/admin/documents/${processId}/${documentType}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${documentType}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Failed to download document')
      }
    } catch (error) {
      console.error('Error downloading document:', error)
      alert('Failed to download document')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Approved': return 'bg-green-100 text-green-800'
      case 'Rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock className="h-4 w-4" />
      case 'Approved': return <CheckCircle className="h-4 w-4" />
      case 'Rejected': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getApplicationTypeIcon = (type) => {
    switch (type) {
      case 'Transfer Land': return <ArrowRight className="h-4 w-4" />
      case 'Building Permission': return <Building className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Land Management</h1>
        <p className="text-gray-600 mt-2">Manage land transfer and building permission applications</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by owner name, location, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="Transfer Land">Transfer Land</option>
              <option value="Building Permission">Building Permission</option>
            </select>
          </div>
        </div>
      </div>

      {/* Processes Table */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProcesses.map((process) => (
                <tr key={process._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        {getApplicationTypeIcon(process.applicationType)}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {process.applicationType}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {process._id.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{process.ownerName}</div>
                    <div className="text-sm text-gray-500">{process.userId?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">{process.landLocation}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {process.landType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(process.status)}`}>
                      {getStatusIcon(process.status)}
                      <span className="ml-1">{process.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(process.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal('view', process)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      {process.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => openModal('approve', process)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openModal('reject', process)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProcesses.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
                ? 'Try adjusting your search or filters.' 
                : 'No land applications have been submitted yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedProcess && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {modalType === 'view' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Application Details
                    </h3>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Application Type</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedProcess.applicationType}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedProcess.status)}`}>
                          {getStatusIcon(selectedProcess.status)}
                          <span className="ml-1">{selectedProcess.status}</span>
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedProcess.ownerName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Land Location</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedProcess.landLocation}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Land Type</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedProcess.landType}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Submitted</label>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(selectedProcess.createdAt)}</p>
                      </div>
                    </div>

                    {selectedProcess.applicationType === 'Building Permission' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Building Purpose</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedProcess.buildingPurpose}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Building Size</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedProcess.buildingSize}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Estimated Cost</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedProcess.estimatedCost}</p>
                        </div>
                      </div>
                    )}

                    {selectedProcess.rejectionReason && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedProcess.rejectionReason}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Documents</label>
                      <div className="space-y-2">
                        {Object.entries(selectedProcess.documents).map(([docType, docPath]) => (
                          <div key={docType} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-700 capitalize">
                              {docType.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <button
                              onClick={() => downloadDocument(selectedProcess._id, docType)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'approve' && (
                <div>
                  <div className="flex items-center mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">
                      Approve Application
                    </h3>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    Are you sure you want to approve this {selectedProcess.applicationType.toLowerCase()} application?
                  </p>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('Approved')}
                      disabled={processing}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {processing ? 'Approving...' : 'Approve'}
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'reject' && (
                <div>
                  <div className="flex items-center mb-4">
                    <XCircle className="h-6 w-6 text-red-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">
                      Reject Application
                    </h3>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason *
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Please provide a reason for rejection..."
                    />
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('Rejected')}
                      disabled={processing || !rejectionReason.trim()}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {processing ? 'Rejecting...' : 'Reject'}
                    </button>
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

export default LandManagement 