import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import LoadingSpinner from '../../components/UI/LoadingSpinner'

const VehiclesPage = () => {
  const { user } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState('annual-inspection')
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState({})
  const [activeLostType, setActiveLostType] = useState('libri')

  const {
    register: registerForm,
    handleSubmit: handleNewSubmit,
    formState: { errors: newErrors },
    reset: resetNew
  } = useForm()

  const {
    register: renewForm,
    handleSubmit: handleRenewSubmit,
    formState: { errors: renewErrors },
    reset: resetRenew
  } = useForm()

  // Fetch user's vehicles
  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const response = await api.get('/vehicles/my-vehicles')
      setVehicles(response.data.vehicles || [])
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      toast.error('Failed to fetch vehicles')
    } finally {
      setLoading(false)
    }
  }

  const onNewRegistration = async (data) => {
    try {
      setSubmitting(true)
      
      // Create FormData object to handle file uploads
      const formData = new FormData()
      
      // First, validate required documents
      if (!uploadedFiles.identification) {
        toast.error('Identification document is required')
        return
      }
      if (!uploadedFiles.importPermit) {
        toast.error('Import permit is required')
        return
      }
      if (!uploadedFiles.inspectionForm) {
        toast.error('Vehicle inspection form is required')
        return
      }

      // Append all files with proper field names
      Object.entries(uploadedFiles).forEach(([fieldName, file]) => {
        if (file instanceof File) {
          formData.append(fieldName, file)
        }
      })

      // Add vehicle data as individual form fields (not JSON string)
      formData.append('make', data.make)
      formData.append('model', data.model)
      formData.append('year', data.year)
      formData.append('color', data.color)
      formData.append('vehicleType', data.vehicleType)
      formData.append('engineNumber', data.engineNumber)
      formData.append('chassisNumber', data.chassisNumber)
      formData.append('applicationType', 'New Registration')
      formData.append('user', user?.id)
      formData.append('submissionDate', new Date().toISOString())

      // Log the FormData contents for debugging
      for (let pair of formData.entries()) {
        console.log('FormData entry:', pair[0], pair[1])
      }

      const response = await api.post('/vehicles/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        timeout: 30000,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          console.log('Upload Progress:', percentCompleted)
        }
      })

      if (response.data) {
        toast.success('Vehicle registration submitted successfully!')
        resetNew()
        setUploadedFiles({})
        fetchVehicles()
        setActiveTab('my-vehicles')
      }
    } catch (error) {
      console.error('Registration error:', error)
      if (error.response) {
        // Log the detailed error response
        console.error('Error response:', error.response.data)
        toast.error(error.response.data?.message || 'Registration failed. Please check all required fields and documents.')
      } else if (error.request) {
        toast.error('No response from server. Please try again.')
      } else {
        toast.error('Error submitting registration. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const onRenewal = async (data) => {
    try {
      setSubmitting(true)
      // Add application type for renewal
      const submissionData = {
        ...data,
        applicationType: 'Renewal'
      }
      console.log('Submitting renewal data:', submissionData)
      const response = await api.post('/vehicles', submissionData)
      toast.success('Vehicle renewal submitted successfully!')
      resetRenew()
      fetchVehicles()
      setActiveTab('my-vehicles')
    } catch (error) {
      console.error('Renewal error:', error)
      toast.error(error.response?.data?.message || 'Renewal failed')
    } finally {
      setSubmitting(false)
    }
  }

  // Service Type Change
  const onServiceTypeChange = async () => {
    try {
      setSubmitting(true)
      const formData = new FormData()
      // Required documents
      if (!uploadedFiles.revenueClearance || !uploadedFiles.insurancePolicy) {
        toast.error('All required documents must be uploaded')
        return
      }
      formData.append('revenueClearance', uploadedFiles.revenueClearance)
      formData.append('insurancePolicy', uploadedFiles.insurancePolicy)
      formData.append('applicationType', 'Service Type Change')
      formData.append('user', user?.id)
      formData.append('submissionDate', new Date().toISOString())
      // Add any additional info fields if needed
      const response = await api.post('/vehicles/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Service type change request submitted!')
      setUploadedFiles({})
      fetchVehicles()
      setActiveTab('my-vehicles')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  // Ownership Transfer
  const onOwnershipTransfer = async () => {
    try {
      setSubmitting(true)
      const formData = new FormData()
      if (!uploadedFiles.identification || !uploadedFiles.salesAgreement || !uploadedFiles.libri) {
        toast.error('All required documents must be uploaded')
        return
      }
      formData.append('identification', uploadedFiles.identification)
      formData.append('salesAgreement', uploadedFiles.salesAgreement)
      formData.append('libri', uploadedFiles.libri)
      formData.append('applicationType', 'Ownership Transfer')
      formData.append('user', user?.id)
      formData.append('submissionDate', new Date().toISOString())
      const response = await api.post('/vehicles/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Ownership transfer request submitted!')
      setUploadedFiles({})
      fetchVehicles()
      setActiveTab('my-vehicles')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  // Name Change
  const onNameChange = async () => {
    try {
      setSubmitting(true)
      const formData = new FormData()
      if (!uploadedFiles.notarizedDocuments || !uploadedFiles.revenueClearance) {
        toast.error('All required documents must be uploaded')
        return
      }
      formData.append('notarizedDocuments', uploadedFiles.notarizedDocuments)
      formData.append('revenueClearance', uploadedFiles.revenueClearance)
      formData.append('applicationType', 'Name Change')
      formData.append('user', user?.id)
      formData.append('submissionDate', new Date().toISOString())
      const response = await api.post('/vehicles/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Name change request submitted!')
      setUploadedFiles({})
      fetchVehicles()
      setActiveTab('my-vehicles')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  // Lost Documents
  const onLostDocuments = async (data, lostType) => {
    try {
      setSubmitting(true)
      const formData = new FormData()
      
      // Validate required documents based on lost type
      if (lostType === 'libri') {
        if (!uploadedFiles.renewedId || !uploadedFiles.policeReport || !uploadedFiles.publicNotice || !uploadedFiles.newspaperNotice || !uploadedFiles.serviceFee) {
          toast.error('All required documents must be uploaded')
          return
        }
        formData.append('renewedId', uploadedFiles.renewedId)
        formData.append('policeReport', uploadedFiles.policeReport)
        formData.append('publicNotice', uploadedFiles.publicNotice)
        formData.append('newspaperNotice', uploadedFiles.newspaperNotice)
        formData.append('serviceFee', uploadedFiles.serviceFee)
      } else if (lostType === 'bolo') {
        if (!uploadedFiles.renewedId || !uploadedFiles.libri || !uploadedFiles.policeReport || !uploadedFiles.serviceFee) {
          toast.error('All required documents must be uploaded')
          return
        }
        formData.append('renewedId', uploadedFiles.renewedId)
        formData.append('libri', uploadedFiles.libri)
        formData.append('policeReport', uploadedFiles.policeReport)
        formData.append('serviceFee', uploadedFiles.serviceFee)
        if (uploadedFiles.officialLetter) {
          formData.append('officialLetter', uploadedFiles.officialLetter)
        }
        if (uploadedFiles.damagedBolo) {
          formData.append('damagedBolo', uploadedFiles.damagedBolo)
        }
      } else if (lostType === 'plate') {
        if (!uploadedFiles.identification || !uploadedFiles.policeReport) {
          toast.error('All required documents must be uploaded')
          return
        }
        formData.append('identification', uploadedFiles.identification)
        formData.append('policeReport', uploadedFiles.policeReport)
        if (uploadedFiles.powerOfAttorney) {
          formData.append('powerOfAttorney', uploadedFiles.powerOfAttorney)
        }
      }
      
      formData.append('applicationType', `Lost ${lostType.charAt(0).toUpperCase() + lostType.slice(1)} Replacement`)
      formData.append('user', user?.id)
      formData.append('submissionDate', new Date().toISOString())
      
      const response = await api.post('/vehicles/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success(`${lostType.charAt(0).toUpperCase() + lostType.slice(1)} replacement request submitted!`)
      setUploadedFiles({})
      fetchVehicles()
      setActiveTab('my-vehicles')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'expired':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const tabs = [
    {
      id: 'annual-inspection',
      label: 'Annual Inspection',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'new-registration',
      label: 'New Registration',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )
    },
    {
      id: 'service-change',
      label: 'Service Type Change',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    },
    {
      id: 'ownership-transfer',
      label: 'Ownership Transfer',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    },
    {
      id: 'name-change',
      label: 'Name Change',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      )
    },
    {
      id: 'lost-documents',
      label: 'Lost Documents',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    {
      id: 'my-vehicles',
      label: 'My Vehicles',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    }
  ]

  const requiredDocuments = {
    'annual-inspection': [
      'Technical inspection certificate – .pdf, .jpg, .png',
      'Road fund payment receipt – .jpg, .png',
      'Proof of ownership (Vehicle Registration Book/Libri) – .pdf, .jpg, .png',
      'Inspection document issued by the inspection center – .pdf, .jpg, .png',
      'Valid third-party insurance certificate – .pdf, .jpg, .png'
    ],
    'new-registration': [
      'Identification (Driver\'s License or Ethiopian National ID with Passport) – .pdf, .jpg, .png',
      'Identification of the legal representative (if applicable) – .pdf, .jpg, .png',
      'Authorization letter and company ID (if from an organization) – .pdf, .jpg, .png',
      'Two passport-size photos (not needed for authorized representatives) – .pdf, .jpg, .png',
      'Import permit and certificate of fitness – .pdf, .jpg, .png',
      'Vehicle inspection form (Rose Paper) – .pdf, .jpg, .png'
    ],
    'service-change': [
      'For business to personal (Code 03 to Code 01), revenue clearance – .pdf, .jpg, .png',
      'Complete insurance policy – .pdf, .jpg, .png'
    ],
    'ownership-transfer': [
      'Buyer and seller must be present with identification copies – .pdf, .jpg, .png',
      'Signed sales agreement – .pdf, .jpg, .png',
      'Libri (Proof of ownership) – .pdf, .jpg, .png'
    ],
    'name-change': [
      'Notarized documents and 2% transfer tax receipt – .pdf, .jpg, .png',
      'Revenue clearance (for Code 03 to Code 01) – .pdf, .jpg, .png',
      'Two passport-size photos of buyer (not needed for legal reps) – .pdf, .jpg, .png',
      'Valid Bolo (annual vehicle certificate) – .pdf, .jpg, .png',
      'Valid third-party insurance certificate – .pdf, .jpg, .png'
    ],
    'lost-documents': {
      'libri': [
        'Renewed ID and notarized power of attorney (if representative) – .pdf, .jpg, .png',
        'Police report regarding the lost Libri – .pdf, .jpg, .png',
        'Proof that the public notice has been published for 15 days – .pdf, .jpg, .png',
        'Publish the notice in a newspaper as per legal process – .pdf, .jpg, .png',
        'Service fee payment – .pdf, .jpg, .png'
      ],
      'bolo': [
        'If individual: renewed ID and notarized power of attorney – .pdf, .jpg, .png',
        'If organization: official letter from the organization and ID of the representative – .pdf, .jpg, .png',
        'Original Libri (Vehicle Registration Book) – .pdf, .jpg, .png',
        'Police report for the lost Bolo – .pdf, .jpg, .png',
        'Damaged Bolo copy (if applicable) – .pdf, .jpg, .png',
        'Service fee payment – .pdf, .jpg, .png'
      ],
      'plate': [
        'Power of attorney and identification (if representative) – .pdf, .jpg, .png',
        'Police report confirming the loss – .pdf, .jpg, .png'
      ]
    }
  }

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0]
    if (file) {
      // Check file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png']
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload PDF, JPG, or PNG files only.')
        e.target.value = null // Reset the input
        return
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size too large. Maximum size is 5MB.')
        e.target.value = null // Reset the input
        return
      }

      setUploadedFiles(prev => ({
        ...prev,
        [fieldName]: file
      }))
    }
  }

  const handleAnnualInspectionSubmit = async () => {
    try {
      setSubmitting(true)
      const formData = new FormData()
      
      // Append all files with proper field names
      Object.entries(uploadedFiles).forEach(([fieldName, file]) => {
        if (file instanceof File) {
          formData.append(fieldName, file)
        }
      })

      // Add application type and other metadata
      formData.append('applicationType', 'Annual Inspection')
      formData.append('user', user?.id)
      formData.append('submissionDate', new Date().toISOString())

      const response = await api.post('/vehicles/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        // Add timeout and onUploadProgress
        timeout: 30000, // 30 seconds timeout
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          console.log('Upload Progress:', percentCompleted)
        }
      })

      if (response.data) {
        toast.success('Annual inspection documents submitted successfully!')
        resetNew()
        setUploadedFiles({})
        fetchVehicles()
      }
    } catch (error) {
      console.error('Submission error:', error)
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        toast.error(error.response.data?.message || 'Submission failed')
      } else if (error.request) {
        // The request was made but no response was received
        toast.error('No response from server. Please try again.')
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error('Error submitting documents. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vehicle Services</h1>
          <p className="text-gray-600">Manage your vehicle registrations and services</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Service-specific content */}
            {activeTab !== 'my-vehicles' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {tabs.find(tab => tab.id === activeTab)?.label}
                  </h2>
                  <p className="text-gray-600">Required documents for this service</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h3>
                  {activeTab === 'lost-documents' ? (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Lost Libri Replacement</h4>
                        <ul className="list-disc pl-5 space-y-2">
                          {requiredDocuments['lost-documents'].libri.map((doc, index) => (
                            <li key={index} className="text-gray-600">{doc}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Lost Bolo Replacement</h4>
                        <ul className="list-disc pl-5 space-y-2">
                          {requiredDocuments['lost-documents'].bolo.map((doc, index) => (
                            <li key={index} className="text-gray-600">{doc}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Lost Plate Replacement</h4>
                        <ul className="list-disc pl-5 space-y-2">
                          {requiredDocuments['lost-documents'].plate.map((doc, index) => (
                            <li key={index} className="text-gray-600">{doc}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <ul className="list-disc pl-5 space-y-2">
                      {Array.isArray(requiredDocuments[activeTab]) ? 
                        requiredDocuments[activeTab]?.map((doc, index) => (
                          <li key={index} className="text-gray-600">{doc}</li>
                        )) : 
                        <li className="text-gray-600">Select a document type above to see requirements</li>
                      }
                    </ul>
                  )}
                </div>

                {/* Service-specific form */}
                <div className="mt-6">
                  {activeTab === 'annual-inspection' && (
                    <div>
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Annual Inspection Name Change</h2>
                        <p className="text-gray-600">Submit required documents for annual inspection name change</p>
                      </div>

                      <form onSubmit={(e) => { e.preventDefault(); handleAnnualInspectionSubmit(); }} className="space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h3>
                          
                          <div className="space-y-4">
                            {/* Notarized Documents */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notarized Documents and 2% Transfer Tax Receipt
                              </label>
                              <div className="flex items-center space-x-4">
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => handleFileChange(e, 'notarizedDocuments')}
                                  className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                                />
                                {uploadedFiles.notarizedDocuments && (
                                  <span className="text-sm text-green-600">
                                    ✓ {uploadedFiles.notarizedDocuments.name}
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-gray-500">Accepted formats: PDF, JPG, PNG (Max size: 5MB)</p>
                            </div>

                            {/* Revenue Clearance */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Revenue Clearance (for Code 03 to Code 01)
                              </label>
                              <div className="flex items-center space-x-4">
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => handleFileChange(e, 'revenueClearance')}
                                  className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                                />
                                {uploadedFiles.revenueClearance && (
                                  <span className="text-sm text-green-600">
                                    ✓ {uploadedFiles.revenueClearance.name}
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-gray-500">Accepted formats: PDF, JPG, PNG</p>
                            </div>

                            {/* Passport Photos */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Two Passport-size Photos
                              </label>
                              <div className="flex items-center space-x-4">
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => handleFileChange(e, 'passportPhotos')}
                                  className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                                />
                                {uploadedFiles.passportPhotos && (
                                  <span className="text-sm text-green-600">
                                    ✓ {uploadedFiles.passportPhotos.name}
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-gray-500">Accepted formats: PDF, JPG, PNG</p>
                            </div>

                            {/* Valid Bolo */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Valid Bolo (Annual Vehicle Certificate)
                              </label>
                              <div className="flex items-center space-x-4">
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => handleFileChange(e, 'validBolo')}
                                  className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                                />
                                {uploadedFiles.validBolo && (
                                  <span className="text-sm text-green-600">
                                    ✓ {uploadedFiles.validBolo.name}
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-gray-500">Accepted formats: PDF, JPG, PNG</p>
                            </div>

                            {/* Insurance Certificate */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Valid Third-party Insurance Certificate
                              </label>
                              <div className="flex items-center space-x-4">
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => handleFileChange(e, 'insuranceCertificate')}
                                  className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                                />
                                {uploadedFiles.insuranceCertificate && (
                                  <span className="text-sm text-green-600">
                                    ✓ {uploadedFiles.insuranceCertificate.name}
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-gray-500">Accepted formats: PDF, JPG, PNG</p>
                            </div>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={submitting || Object.keys(uploadedFiles).length === 0}
                            className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submitting ? (
                              <div className="flex items-center">
                                <LoadingSpinner size="small" className="mr-2" />
                                Uploading...
                              </div>
                            ) : (
                              'Submit Documents'
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* New Registration Tab */}
                  {activeTab === 'new-registration' && (
                    <div>
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">New Vehicle Registration</h2>
                        <p className="text-gray-600">Submit required documents for new vehicle registration</p>
                      </div>

                      <form onSubmit={handleNewSubmit(onNewRegistration)} className="space-y-6">
                        {/* Vehicle Information */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="form-label">Make</label>
                              <input
                                {...registerForm('make', { required: 'Make is required' })}
                                type="text"
                                className="form-input"
                                placeholder="e.g. Toyota"
                              />
                              {newErrors.make && (
                                <p className="form-error">{newErrors.make.message}</p>
                              )}
                            </div>

                            <div>
                              <label className="form-label">Model</label>
                              <input
                                {...registerForm('model', { required: 'Model is required' })}
                                type="text"
                                className="form-input"
                                placeholder="e.g. Corolla"
                              />
                              {newErrors.model && (
                                <p className="form-error">{newErrors.model.message}</p>
                              )}
                            </div>

                            <div>
                              <label className="form-label">Year</label>
                              <input
                                {...registerForm('year', { required: 'Year is required' })}
                                type="number"
                                className="form-input"
                                placeholder="e.g. 2023"
                              />
                              {newErrors.year && (
                                <p className="form-error">{newErrors.year.message}</p>
                              )}
                            </div>

                            <div>
                              <label className="form-label">Color</label>
                              <input
                                {...registerForm('color', { required: 'Color is required' })}
                                type="text"
                                className="form-input"
                                placeholder="e.g. Silver"
                              />
                              {newErrors.color && (
                                <p className="form-error">{newErrors.color.message}</p>
                              )}
                            </div>

                            <div>
                              <label className="form-label">Vehicle Type</label>
                              <select
                                {...registerForm('vehicleType', { required: 'Vehicle type is required' })}
                                className="form-select"
                              >
                                <option value="">Select vehicle type</option>
                                <option value="Sedan">Sedan</option>
                                <option value="SUV">SUV</option>
                                <option value="Truck">Truck</option>
                                <option value="Van">Van</option>
                                <option value="Motorcycle">Motorcycle</option>
                              </select>
                              {newErrors.vehicleType && (
                                <p className="form-error">{newErrors.vehicleType.message}</p>
                              )}
                            </div>

                            <div>
                              <label className="form-label">Engine Number</label>
                              <input
                                {...registerForm('engineNumber', { required: 'Engine number is required' })}
                                type="text"
                                className="form-input"
                                placeholder="Enter engine number"
                              />
                              {newErrors.engineNumber && (
                                <p className="form-error">{newErrors.engineNumber.message}</p>
                              )}
                            </div>

                            <div>
                              <label className="form-label">Chassis Number</label>
                              <input
                                {...registerForm('chassisNumber', { required: 'Chassis number is required' })}
                                type="text"
                                className="form-input"
                                placeholder="Enter chassis number"
                              />
                              {newErrors.chassisNumber && (
                                <p className="form-error">{newErrors.chassisNumber.message}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Required Documents */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h3>
                          
                          <div className="space-y-4">
                            {/* Identification */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Identification (Driver's License or Ethiopian National ID with Passport)
                              </label>
                              <div className="flex items-center space-x-4">
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => handleFileChange(e, 'identification')}
                                  className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                                />
                                {uploadedFiles.identification && (
                                  <span className="text-sm text-green-600">
                                    ✓ {uploadedFiles.identification.name}
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-gray-500">Accepted formats: PDF, JPG, PNG (Max size: 5MB)</p>
                            </div>

                            {/* Legal Representative ID */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Identification of the Legal Representative (if applicable)
                              </label>
                              <div className="flex items-center space-x-4">
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => handleFileChange(e, 'legalRepresentativeId')}
                                  className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                                />
                                {uploadedFiles.legalRepresentativeId && (
                                  <span className="text-sm text-green-600">
                                    ✓ {uploadedFiles.legalRepresentativeId.name}
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-gray-500">Accepted formats: PDF, JPG, PNG</p>
                            </div>

                            {/* Authorization Letter and Company ID */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Authorization Letter and Company ID (if from an organization)
                              </label>
                              <div className="flex items-center space-x-4">
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => handleFileChange(e, 'authorizationLetter')}
                                  className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                                />
                                {uploadedFiles.authorizationLetter && (
                                  <span className="text-sm text-green-600">
                                    ✓ {uploadedFiles.authorizationLetter.name}
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-gray-500">Accepted formats: PDF, JPG, PNG</p>
                            </div>

                            {/* Passport Photos */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Two Passport-size Photos
                              </label>
                              <div className="flex items-center space-x-4">
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => handleFileChange(e, 'passportPhotos')}
                                  className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                                />
                                {uploadedFiles.passportPhotos && (
                                  <span className="text-sm text-green-600">
                                    ✓ {uploadedFiles.passportPhotos.name}
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-gray-500">Accepted formats: PDF, JPG, PNG</p>
                            </div>

                            {/* Import Permit and Certificate of Fitness */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Import Permit and Certificate of Fitness
                              </label>
                              <div className="flex items-center space-x-4">
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => handleFileChange(e, 'importPermit')}
                                  className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                                />
                                {uploadedFiles.importPermit && (
                                  <span className="text-sm text-green-600">
                                    ✓ {uploadedFiles.importPermit.name}
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-gray-500">Accepted formats: PDF, JPG, PNG</p>
                            </div>

                            {/* Vehicle Inspection Form */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vehicle Inspection Form (Rose Paper)
                              </label>
                              <div className="flex items-center space-x-4">
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => handleFileChange(e, 'inspectionForm')}
                                  className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                                />
                                {uploadedFiles.inspectionForm && (
                                  <span className="text-sm text-green-600">
                                    ✓ {uploadedFiles.inspectionForm.name}
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-gray-500">Accepted formats: PDF, JPG, PNG</p>
                            </div>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={submitting || !uploadedFiles.identification || !uploadedFiles.importPermit || !uploadedFiles.inspectionForm}
                            className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submitting ? (
                              <div className="flex items-center">
                                <LoadingSpinner size="small" className="mr-2" />
                                Submitting...
                              </div>
                            ) : (
                              'Submit Registration'
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Service Type Change Tab */}
                  {activeTab === 'service-change' && (
                    <div>
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Service Type Change</h2>
                        <p className="text-gray-600">Submit required documents for service type change</p>
                      </div>
                      <form onSubmit={e => { e.preventDefault(); onServiceTypeChange(); }} className="space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h3>
                          <div className="space-y-4">
                            {/* Revenue Clearance */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Revenue Clearance</label>
                              <div className="flex items-center space-x-4">
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileChange(e, 'revenueClearance')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {uploadedFiles.revenueClearance && (<span className="text-sm text-green-600">✓ {uploadedFiles.revenueClearance.name}</span>)}
                              </div>
                            </div>
                            {/* Insurance Policy */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Complete Insurance Policy</label>
                              <div className="flex items-center space-x-4">
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileChange(e, 'insurancePolicy')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {uploadedFiles.insurancePolicy && (<span className="text-sm text-green-600">✓ {uploadedFiles.insurancePolicy.name}</span>)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button type="submit" disabled={submitting || !uploadedFiles.revenueClearance || !uploadedFiles.insurancePolicy} className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? (<div className="flex items-center"><LoadingSpinner size="small" className="mr-2" />Submitting...</div>) : ('Submit Request')}</button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Ownership Transfer Tab */}
                  {activeTab === 'ownership-transfer' && (
                    <div>
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Ownership Transfer</h2>
                        <p className="text-gray-600">Submit required documents for ownership transfer</p>
                      </div>
                      <form onSubmit={e => { e.preventDefault(); onOwnershipTransfer(); }} className="space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h3>
                          <div className="space-y-4">
                            {/* Identification */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Identification (Buyer & Seller)</label>
                              <div className="flex items-center space-x-4">
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileChange(e, 'identification')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {uploadedFiles.identification && (<span className="text-sm text-green-600">✓ {uploadedFiles.identification.name}</span>)}
                              </div>
                            </div>
                            {/* Sales Agreement */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Signed Sales Agreement</label>
                              <div className="flex items-center space-x-4">
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileChange(e, 'salesAgreement')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {uploadedFiles.salesAgreement && (<span className="text-sm text-green-600">✓ {uploadedFiles.salesAgreement.name}</span>)}
                              </div>
                            </div>
                            {/* Libri */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Libri (Proof of Ownership)</label>
                              <div className="flex items-center space-x-4">
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileChange(e, 'libri')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {uploadedFiles.libri && (<span className="text-sm text-green-600">✓ {uploadedFiles.libri.name}</span>)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button type="submit" disabled={submitting || !uploadedFiles.identification || !uploadedFiles.salesAgreement || !uploadedFiles.libri} className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? (<div className="flex items-center"><LoadingSpinner size="small" className="mr-2" />Submitting...</div>) : ('Submit Request')}</button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Name Change Tab */}
                  {activeTab === 'name-change' && (
                    <div>
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Name Change</h2>
                        <p className="text-gray-600">Submit required documents for name change</p>
                      </div>
                      <form onSubmit={e => { e.preventDefault(); onNameChange(); }} className="space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h3>
                          <div className="space-y-4">
                            {/* Notarized Documents */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Notarized Documents and 2% Transfer Tax Receipt</label>
                              <div className="flex items-center space-x-4">
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileChange(e, 'notarizedDocuments')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {uploadedFiles.notarizedDocuments && (<span className="text-sm text-green-600">✓ {uploadedFiles.notarizedDocuments.name}</span>)}
                              </div>
                            </div>
                            {/* Revenue Clearance */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Revenue Clearance (for Code 03 to Code 01)</label>
                              <div className="flex items-center space-x-4">
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileChange(e, 'revenueClearance')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {uploadedFiles.revenueClearance && (<span className="text-sm text-green-600">✓ {uploadedFiles.revenueClearance.name}</span>)}
                              </div>
                            </div>
                            {/* Passport Photos */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Two Passport-size Photos</label>
                              <div className="flex items-center space-x-4">
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileChange(e, 'passportPhotos')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {uploadedFiles.passportPhotos && (<span className="text-sm text-green-600">✓ {uploadedFiles.passportPhotos.name}</span>)}
                              </div>
                            </div>
                            {/* Valid Bolo */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Valid Bolo (Annual Vehicle Certificate)</label>
                              <div className="flex items-center space-x-4">
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileChange(e, 'validBolo')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {uploadedFiles.validBolo && (<span className="text-sm text-green-600">✓ {uploadedFiles.validBolo.name}</span>)}
                              </div>
                            </div>
                            {/* Insurance Certificate */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Valid Third-party Insurance Certificate</label>
                              <div className="flex items-center space-x-4">
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileChange(e, 'insuranceCertificate')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {uploadedFiles.insuranceCertificate && (<span className="text-sm text-green-600">✓ {uploadedFiles.insuranceCertificate.name}</span>)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button type="submit" disabled={submitting || !uploadedFiles.notarizedDocuments || !uploadedFiles.revenueClearance} className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? (<div className="flex items-center"><LoadingSpinner size="small" className="mr-2" />Submitting...</div>) : ('Submit Request')}</button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Lost Documents Tab */}
                  {activeTab === 'lost-documents' && (
                    <div>
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Lost Documents</h2>
                        <p className="text-gray-600">Submit required documents for lost Libri, Bolo, or Plate</p>
                      </div>
                      {/* Sub-tabs for lost document type */}
                      <div className="flex space-x-4 mb-4">
                        {['libri', 'bolo', 'plate'].map(type => (
                          <button key={type} onClick={() => setActiveLostType(type)} className={`px-4 py-2 rounded-lg font-medium ${activeLostType === type ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{type.charAt(0).toUpperCase() + type.slice(1)}</button>
                        ))}
                      </div>
                      {/* Lost Libri Form */}
                      {activeLostType === 'libri' && (
                        <form onSubmit={e => { e.preventDefault(); onLostDocuments({}, 'libri'); }} className="space-y-6">
                          <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents for Libri</h3>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Renewed ID and Notarized Power of Attorney (if representative)</label>
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileChange(e, 'renewedId')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {uploadedFiles.renewedId && (<span className="text-sm text-green-600">✓ {uploadedFiles.renewedId.name}</span>)}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Police Report</label>
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileChange(e, 'policeReport')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {uploadedFiles.policeReport && (<span className="text-sm text-green-600">✓ {uploadedFiles.policeReport.name}</span>)}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Proof of Public Notice (15 days)</label>
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileChange(e, 'publicNotice')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {uploadedFiles.publicNotice && (<span className="text-sm text-green-600">✓ {uploadedFiles.publicNotice.name}</span>)}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Newspaper Notice</label>
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileChange(e, 'newspaperNotice')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {uploadedFiles.newspaperNotice && (<span className="text-sm text-green-600">✓ {uploadedFiles.newspaperNotice.name}</span>)}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Service Fee Payment</label>
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileChange(e, 'serviceFee')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {uploadedFiles.serviceFee && (<span className="text-sm text-green-600">✓ {uploadedFiles.serviceFee.name}</span>)}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <button type="submit" disabled={submitting || !uploadedFiles.renewedId || !uploadedFiles.policeReport || !uploadedFiles.publicNotice || !uploadedFiles.newspaperNotice || !uploadedFiles.serviceFee} className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? (<div className="flex items-center"><LoadingSpinner size="small" className="mr-2" />Submitting...</div>) : ('Submit Request')}</button>
                          </div>
                        </form>
                      )}
                      {/* Lost Bolo Form */}
                      {activeLostType === 'bolo' && (
                        <form onSubmit={e => { e.preventDefault(); onLostDocuments({}, 'bolo'); }} className="space-y-6">
                          <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents for Bolo</h3>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Renewed ID and Notarized Power of Attorney (if representative)</label>
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileChange(e, 'renewedId')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {uploadedFiles.renewedId && (<span className="text-sm text-green-600">✓ {uploadedFiles.renewedId.name}</span>)}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Official Letter from Organization (if applicable)</label>
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileChange(e, 'officialLetter')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {uploadedFiles.officialLetter && (<span className="text-sm text-green-600">✓ {uploadedFiles.officialLetter.name}</span>)}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Libri (Vehicle Registration Book)</label>
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileChange(e, 'libri')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {uploadedFiles.libri && (<span className="text-sm text-green-600">✓ {uploadedFiles.libri.name}</span>)}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Police Report</label>
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileChange(e, 'policeReport')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {uploadedFiles.policeReport && (<span className="text-sm text-green-600">✓ {uploadedFiles.policeReport.name}</span>)}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Damaged Bolo Copy (if applicable)</label>
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileChange(e, 'damagedBolo')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {uploadedFiles.damagedBolo && (<span className="text-sm text-green-600">✓ {uploadedFiles.damagedBolo.name}</span>)}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Service Fee Payment</label>
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileChange(e, 'serviceFee')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {uploadedFiles.serviceFee && (<span className="text-sm text-green-600">✓ {uploadedFiles.serviceFee.name}</span>)}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <button type="submit" disabled={submitting || !uploadedFiles.renewedId || !uploadedFiles.libri || !uploadedFiles.policeReport || !uploadedFiles.serviceFee} className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? (<div className="flex items-center"><LoadingSpinner size="small" className="mr-2" />Submitting...</div>) : ('Submit Request')}</button>
                          </div>
                        </form>
                      )}
                      {/* Lost Plate Form */}
                      {activeLostType === 'plate' && (
                        <form onSubmit={e => { e.preventDefault(); onLostDocuments({}, 'plate'); }} className="space-y-6">
                          <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents for Plate</h3>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Power of Attorney and Identification (if representative)</label>
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileChange(e, 'powerOfAttorney')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {uploadedFiles.powerOfAttorney && (<span className="text-sm text-green-600">✓ {uploadedFiles.powerOfAttorney.name}</span>)}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Identification</label>
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileChange(e, 'identification')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {uploadedFiles.identification && (<span className="text-sm text-green-600">✓ {uploadedFiles.identification.name}</span>)}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Police Report</label>
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileChange(e, 'policeReport')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {uploadedFiles.policeReport && (<span className="text-sm text-green-600">✓ {uploadedFiles.policeReport.name}</span>)}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <button type="submit" disabled={submitting || !uploadedFiles.identification || !uploadedFiles.policeReport} className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? (<div className="flex items-center"><LoadingSpinner size="small" className="mr-2" />Submitting...</div>) : ('Submit Request')}</button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* My Vehicles Tab */}
            {activeTab === 'my-vehicles' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">My Vehicles</h2>
                  <p className="text-gray-600">View and manage your registered vehicles</p>
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="large" />
                  </div>
                ) : vehicles.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles registered</h3>
                    <p className="text-gray-600 mb-4">You haven't registered any vehicles yet.</p>
                    <button
                      onClick={() => setActiveTab('new-registration')}
                      className="btn-primary"
                    >
                      Register Your First Vehicle
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vehicles.map((vehicle) => (
                      <div key={vehicle._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {vehicle.make} {vehicle.model}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                            {vehicle.status || 'Pending'}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Registration:</span>
                            <span className="text-gray-900">{vehicle.registrationNumber || 'Pending'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Year:</span>
                            <span className="text-gray-900">{vehicle.year}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Type:</span>
                            <span className="text-gray-900">{vehicle.vehicleType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Color:</span>
                            <span className="text-gray-900">{vehicle.color}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Applied:</span>
                            <span className="text-gray-900">
                              {new Date(vehicle.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VehiclesPage 